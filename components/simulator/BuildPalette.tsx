"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  INTERVENTIONS,
  interventionOf,
  rs,
} from "@/lib/sim";
import type { Category, InterventionType, Placement } from "@/lib/sim/types";

type Props = {
  tool: InterventionType | null;
  onDragStart: (type: InterventionType) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: (clientX: number, clientY: number) => void;
  placements: Placement[];
  budgetRemaining: number;
};

export function BuildPalette({
  tool,
  onDragStart,
  onDragMove,
  onDragEnd,
  placements,
  budgetRemaining,
}: Props) {
  const [tab, setTab] = useState<Category>(CATEGORY_ORDER[0]);
  const items = INTERVENTIONS.filter((item) => item.category === tab);
  const meta = CATEGORY_META[tab];
  const dragging = useRef(false);
  const stopDrag = useRef<(() => void) | null>(null);

  function finishDrag(clientX: number, clientY: number) {
    if (!dragging.current) return;
    dragging.current = false;
    stopDrag.current?.();
    stopDrag.current = null;
    document.body.style.cursor = "";
    onDragEnd(clientX, clientY);
  }

  useEffect(() => () => stopDrag.current?.(), []);

  useEffect(() => {
    if (!tool) return;
    const found = INTERVENTIONS.find((item) => item.type === tool);
    if (found) setTab(found.category);
  }, [tool]);

  return (
    <div className="palette">
      <header className="palette-head">
        <p className="eyebrow">Tools</p>
        <strong>{rs(budgetRemaining)}</strong>
      </header>
      <div className="palette-tabs" role="tablist">
        {CATEGORY_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "is-on" : ""}
            onClick={() => setTab(id)}
          >
            {CATEGORY_META[id].label}
          </button>
        ))}
      </div>
      <p className="palette-hint">{meta.hint}</p>
      <p className="palette-how">Drop on the map. Grab the stamp afterward to move it.</p>
      <div className="palette-row">
        {items.map((item) => {
          const used = placements.filter((p) => p.type === item.type).length;
          const blocked = item.cost > budgetRemaining || (item.unique && used > 0);
          const active = tool === item.type;
          return (
            <button
              key={item.type}
              type="button"
              className={["build-chip", active && "is-active", blocked && "is-blocked"].filter(Boolean).join(" ")}
              disabled={blocked && !active}
              aria-pressed={active}
              title={item.description}
              onPointerDown={(event) => {
                if (blocked || event.button !== 0) return;
                event.preventDefault();
                dragging.current = true;
                try {
                  event.currentTarget.setPointerCapture(event.pointerId);
                } catch {
                  /* window listeners still finish the drop */
                }
                onDragStart(item.type);
                const pointerId = event.pointerId;
                const onWinMove = (moveEvent: PointerEvent) => {
                  if (moveEvent.pointerId !== pointerId) return;
                  onDragMove(moveEvent.clientX, moveEvent.clientY);
                };
                const onWinUp = (upEvent: PointerEvent) => {
                  if (upEvent.pointerId !== pointerId) return;
                  finishDrag(upEvent.clientX, upEvent.clientY);
                };
                window.addEventListener("pointermove", onWinMove);
                window.addEventListener("pointerup", onWinUp);
                window.addEventListener("pointercancel", onWinUp);
                stopDrag.current = () => {
                  window.removeEventListener("pointermove", onWinMove);
                  window.removeEventListener("pointerup", onWinUp);
                  window.removeEventListener("pointercancel", onWinUp);
                };
              }}
              onPointerMove={(event) => {
                if (!dragging.current) return;
                onDragMove(event.clientX, event.clientY);
              }}
              onPointerUp={(event) => {
                finishDrag(event.clientX, event.clientY);
              }}
            >
              <span className="build-chip-icon">{item.icon}</span>
              <span className="build-chip-name">{item.shortName}</span>
              <span className="build-chip-cost">{rs(item.cost)}</span>
            </button>
          );
        })}
      </div>
      {tool && (
        <p className="palette-how">
          <strong>{interventionOf(tool).howTo}</strong>
        </p>
      )}
    </div>
  );
}
