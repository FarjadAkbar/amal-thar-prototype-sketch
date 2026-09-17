"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  GOTH_SATTAR,
  canPlace,
  interventionOf,
  pct,
  rs,
  simulate,
} from "@/lib/sim";
import { bazaarMid } from "@/lib/sim/mapLayout";
import type { InterventionType, Placement, World, WorldFlags } from "@/lib/sim/types";
import { BuildPalette } from "./BuildPalette";
import { PlacementCard } from "./PlacementCard";
import { AnswerSketch } from "./AnswerSketch";
import { StickyLayer, type StickyNote } from "./StickyLayer";
import { VillageMap, resolveHit, svgCoords, type MapHit } from "./VillageMap";
import type { SketchSpec } from "@/lib/sketch/types";

function uid() {
  return crypto.randomUUID();
}

const QUIET_FLAGS: WorldFlags = {
  drought: false,
  harvest: false,
  solarBroken: false,
  pipelinePartial: false,
};

export function Simulator() {
  const village = GOTH_SATTAR;
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [history, setHistory] = useState<Placement[][]>([[]]);
  const [tool, setTool] = useState<InterventionType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flags, setFlags] = useState<WorldFlags>(QUIET_FLAGS);
  const [extraSpend, setExtraSpend] = useState(0);
  const [linkFrom, setLinkFrom] = useState<Placement | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);
  const [noteTool, setNoteTool] = useState(false);
  const mapSvgRef = useRef<SVGSVGElement>(null);
  const toolRef = useRef<InterventionType | null>(null);
  const placementsRef = useRef<Placement[]>([]);
  const [sketch, setSketch] = useState<SketchSpec | null>(null);
  const [intelOpen, setIntelOpen] = useState(false);
  const [message, setMessage] = useState(
    "Drop your idea on the map — then convert it into a scrappy sketch.",
  );

  placementsRef.current = placements;

  const world: World = useMemo(
    () => ({ flags, extraSpend }),
    [flags, extraSpend],
  );

  const result = useMemo(
    () => simulate(village, placements, world),
    [village, placements, world],
  );

  const waterWorking = placements.some((item) => {
    if (!result.functionalIds.includes(item.id)) return false;
    if (item.type === "main_water_line") return true;
    if (item.type !== "well") return false;
    return placements.some((helper) => {
      if (!result.functionalIds.includes(helper.id)) return false;
      const near = Math.hypot(helper.x - item.x, helper.y - item.y) < 140;
      return (
        near &&
        (helper.type === "solar_pump" ||
          helper.type === "water_tank" ||
          helper.type === "elevated_tank" ||
          helper.type === "solar_still")
      );
    });
  });

  const selected = placements.find((item) => item.id === selectedId) ?? null;

  function commit(next: Placement[], note?: string) {
    setPlacements(next);
    setHistory((prev) => [...prev, next]);
    if (note) setMessage(note);
  }

  function place(next: Placement, note: string) {
    const check = canPlace(next.type, placements, village.budget, extraSpend);
    if (!check.ok) {
      setMessage(check.reason ?? "Cannot build that.");
      return;
    }
    commit([...placements, next], note);
    setSelectedId(next.id);
  }

  function onHit(hit: MapHit) {
    if (noteTool) {
      const next: StickyNote = { id: uid(), x: hit.point.x, y: hit.point.y, text: "" };
      setStickies((prev) => [...prev, next]);
      setSelectedStickyId(next.id);
      setSelectedId(null);
      setMessage("Sticky note placed. Write what you noticed.");
      return;
    }

    setSelectedStickyId(null);

    const active = toolRef.current;

    if (!active) {
      setLinkFrom(null);
      if (hit.kind === "placement") {
        stayOnPlacement(hit.id);
        return;
      }
      const road = placements.find((item) => item.type === "road");
      if (hit.kind === "bazaar" && road) {
        setSelectedId(road.id);
        return;
      }
      setSelectedId(null);
      return;
    }

    const def = interventionOf(active);

    if (active === "road") {
      if (hit.kind === "bazaar") {
        const mid = bazaarMid();
        place({ id: uid(), type: "road", x: mid.x, y: mid.y }, "Road sketched on the goat track toward town.");
        toolRef.current = null;
        setTool(null);
        return;
      }
      setMessage("Drop on the faded goat track toward town — not empty sand.");
      return;
    }

    if (active === "pipeline") {
      if (!linkFrom) {
        if (hit.kind === "placement") {
          const well = placements.find((item) => item.id === hit.id);
          if (well?.type === "well") {
            setLinkFrom(well);
            setMessage("Now drop on a ground tank or elevated tank. The pipe only moves well water into storage.");
            return;
          }
        }
        setMessage("Start on a well. Drop the pipe on the well first, then on a tank.");
        return;
      }
      if (hit.kind === "placement") {
        const tank = placements.find((item) => item.id === hit.id);
        if (tank?.type === "water_tank" || tank?.type === "elevated_tank") {
          place(
            {
              id: uid(),
              type: "pipeline",
              x: linkFrom.x,
              y: linkFrom.y,
              x2: tank.x,
              y2: tank.y,
              fromId: linkFrom.id,
              toId: tank.id,
            },
            "Pipe laid. Connection is not the same as every courtyard drinking.",
          );
          setLinkFrom(null);
          toolRef.current = null;
          setTool(null);
          return;
        }
        setMessage("Finish on a tank — ground tank or elevated tank.");
        return;
      }
      if (hit.kind === "trunk" || hit.kind === "valve") {
        setMessage("That trunk is plant process water. It does not fill wells.");
        return;
      }
      setMessage("Finish on a tank. This pipe is not a city main.");
      return;
    }

    if (hit.kind === "placement") {
      toolRef.current = null;
      setTool(null);
      setMessage("That spot is taken. Drop on empty sand, or drag the building to move it.");
      return;
    }

    if (hit.kind === "trunk" || hit.kind === "valve") {
      toolRef.current = null;
      setTool(null);
      setMessage("That is plant process water, not village tap water.");
      return;
    }

    const next: Placement = { id: uid(), type: active, x: hit.point.x, y: hit.point.y };
    const preview = simulate(village, [...placements, next], world);
    const idle = preview.inactive.find((item) => item.id === next.id);
    const note = idle
      ? `${def.name} is in the sand, but it still needs: ${idle.missing.join(", ")}.`
      : `${def.name} placed.`;
    place(next, note);
    toolRef.current = null;
    setTool(null);
    setMessage(`${note} Drag it to move.`);
  }

  function movePlacement(id: string, point: { x: number; y: number }) {
    setIntelOpen(false);
    toolRef.current = null;
    setTool(null);
    const prev = placementsRef.current;
    const moving = prev.find((item) => item.id === id);
    if (!moving || moving.type === "pipeline" || moving.type === "road") return;
    if (moving.x === point.x && moving.y === point.y) return;
    const next = prev.map((item) => {
      if (item.id === id) return { ...item, x: point.x, y: point.y };
      if (item.type === "pipeline" && item.fromId === id) {
        return { ...item, x: point.x, y: point.y };
      }
      if (item.type === "pipeline" && item.toId === id) {
        return { ...item, x2: point.x, y2: point.y };
      }
      if (
        !item.toId &&
        item.type === "pipeline" &&
        item.x2 != null &&
        item.y2 != null &&
        Math.hypot(item.x2 - moving.x, item.y2 - moving.y) < 28
      ) {
        return { ...item, x2: point.x, y2: point.y };
      }
      return item;
    });
    placementsRef.current = next;
    setPlacements(next);
  }

  function pickPlacement(id: string) {
    toolRef.current = null;
    setTool(null);
    setNoteTool(false);
    setSelectedStickyId(null);
    setLinkFrom(null);
    setSelectedId(id);
  }

  function finishMove() {
    setHistory((prev) => [...prev, placementsRef.current]);
    setMessage("Moved. Drag again to shift it.");
  }

  function stayOnPlacement(id: string) {
    setSelectedId(id);
    setIntelOpen(true);
    setMessage("Add a short comment — it will show on your sketch.");
  }

  function pointOnMap(clientX: number, clientY: number) {
    const svg = mapSvgRef.current;
    if (!svg) return null;
    const box = svg.getBoundingClientRect();
    if (clientX < box.left || clientX > box.right || clientY < box.top || clientY > box.bottom) {
      return null;
    }
    return svgCoords(svg, clientX, clientY);
  }

  function onDragStart(type: InterventionType) {
    toolRef.current = type;
    setTool(type);
    setLinkFrom(null);
    setSelectedId(null);
    setNoteTool(false);
    document.body.style.cursor = "grabbing";
    setMessage(`Drag ${interventionOf(type).shortName} onto the map — a rough place is enough.`);
  }

  function onDragMove(clientX: number, clientY: number) {
    setHover(pointOnMap(clientX, clientY));
  }

  function onDragEnd(clientX: number, clientY: number) {
    const point = pointOnMap(clientX, clientY);
    const active = toolRef.current;
    document.body.style.cursor = "";
    setHover(null);
    if (!point || !active) {
      if (active !== "pipeline" || !linkFrom) {
        toolRef.current = null;
        setTool(null);
        setLinkFrom(null);
      }
      return;
    }
    onHit(resolveHit(point, placementsRef.current));
  }

  function undo() {
    if (history.length < 2) return;
    const prior = history[history.length - 2];
    setHistory((prev) => prev.slice(0, -1));
    setPlacements(prior);
    setSelectedId(null);
    setLinkFrom(null);
    setMessage("Undid last building.");
  }

  function reset() {
    setPlacements([]);
    setHistory([[]]);
    setSelectedId(null);
    toolRef.current = null;
    setTool(null);
    setLinkFrom(null);
    setFlags(QUIET_FLAGS);
    setExtraSpend(0);
    setStickies([]);
    setSelectedStickyId(null);
    setNoteTool(false);
    setSketch(null);
    setIntelOpen(false);
    setMessage("Cleared. Drop a rough idea on the map, then sketch it.");
  }

  function setComment(text: string) {
    if (!selectedId) return;
    const next = placements.map((item) =>
      item.id === selectedId ? { ...item, comment: text } : item,
    );
    setPlacements(next);
    setHistory((prev) => (prev.length === 0 ? [next] : [...prev.slice(0, -1), next]));
  }

  function removeSelected() {
    if (!selectedId) return;
    const removed = placements.find((item) => item.id === selectedId);
    commit(
      placements.filter((item) => item.id !== selectedId),
      removed ? `Removed ${interventionOf(removed.type).name}.` : "Removed.",
    );
    setSelectedId(null);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "Escape") {
        toolRef.current = null;
        setTool(null);
        setLinkFrom(null);
        setNoteTool(false);
        setSelectedStickyId(null);
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedStickyId) {
        event.preventDefault();
        setStickies((prev) => prev.filter((note) => note.id !== selectedStickyId));
        setSelectedStickyId(null);
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        removeSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, selectedStickyId, placements]);

  return (
    <div className={["sim-shell", intelOpen && "is-intel"].filter(Boolean).join(" ")}>
      <header className="sim-header">
        <div className="brand">
          <p className="eyebrow">Prototype · Goth Sattar</p>
          <h1>Thar village</h1>
        </div>
        <dl className="stat-strip">
          <div>
            <dt>Families</dt>
            <dd>{village.families}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>{rs(result.budgetRemaining)}</dd>
          </div>
          <div>
            <dt>Water hrs</dt>
            <dd>{result.derived.waterHours.toFixed(1)}</dd>
          </div>
          <div>
            <dt>Child labour</dt>
            <dd>{pct(result.derived.childLabor)}</dd>
          </div>
        </dl>
        <div className="map-actions">
          <button
            type="button"
            className={`btn btn-talk ${intelOpen ? "is-on" : ""}`}
            onClick={() => setIntelOpen((open) => !open)}
          >
            Sketch
          </button>
          <button
            type="button"
            className={`btn btn-sticky ${noteTool ? "is-on" : ""}`}
            onClick={() => {
              setNoteTool((on) => !on);
              setTool(null);
              setLinkFrom(null);
              if (!noteTool) setMessage("Stick a note on the map — what did you notice?");
            }}
          >
            Note
          </button>
          <button type="button" className="btn btn-undo" onClick={undo} disabled={history.length < 2}>
            Undo
          </button>
          <button type="button" className="btn btn-reset" onClick={reset}>
            Reset
          </button>
          {tool && (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => {
                toolRef.current = null;
                setTool(null);
                setLinkFrom(null);
              }}
            >
              Cancel {interventionOf(tool).shortName}
            </button>
          )}
          {noteTool && (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => setNoteTool(false)}
            >
              Cancel note
            </button>
          )}
        </div>
      </header>

      <div className="sim-grid">
        <BuildPalette
          tool={tool}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          placements={placements}
          budgetRemaining={result.budgetRemaining}
        />

        <div className="viewport">
          <div className="map-frame">
            <VillageMap
              placements={placements}
              functionalIds={result.functionalIds}
              selectedId={selectedId}
              tool={tool}
              hover={hover}
              linkFrom={linkFrom}
              waterWorking={waterWorking}
              noteTool={noteTool}
              svgRef={mapSvgRef}
              onHover={setHover}
              onHit={onHit}
              onPick={pickPlacement}
              onMove={movePlacement}
              onMoveEnd={finishMove}
              onStay={stayOnPlacement}
            />
            <StickyLayer
              notes={stickies}
              selectedId={selectedStickyId}
              onSelect={(id) => {
                setSelectedStickyId(id);
                setSelectedId(null);
              }}
              onMove={(id, x, y) =>
                setStickies((prev) => prev.map((note) => (note.id === id ? { ...note, x, y } : note)))
              }
              onChange={(id, text) =>
                setStickies((prev) => prev.map((note) => (note.id === id ? { ...note, text } : note)))
              }
              onRemove={(id) => {
                setStickies((prev) => prev.filter((note) => note.id !== id));
                if (selectedStickyId === id) setSelectedStickyId(null);
              }}
            />
            <div className="map-toast">{message}</div>
          </div>
        </div>

        <aside className="intel-rail">
          {selected && (
            <PlacementCard
              placement={selected}
              onComment={setComment}
              onRemove={removeSelected}
            />
          )}

          <AnswerSketch
            placements={placements}
            sketch={sketch}
            onSketched={(spec) => {
              setSketch(spec);
              setMessage(spec.nextQuestion);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
