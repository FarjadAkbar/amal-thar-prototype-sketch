"use client";

import type { PointerEvent, Ref } from "react";
import { interventionOf } from "@/lib/sim";
import {
  BAZAAR,
  CLUSTERS,
  LANES,
  MAP,
  TREES,
  TRUNK,
  VALVE,
  distToPolyline,
  nearestOnPolyline,
  polylinePath,
  type Pt,
} from "@/lib/sim/mapLayout";
import type { InterventionType, Placement } from "@/lib/sim/types";
import {
  Chaunra,
  ClayFilter,
  DemoHouse,
  ElevatedTank,
  Goat,
  HouseTaps,
  Khejri,
  MudBox,
  RoKiosk,
  RoundTank,
  SolarStill,
  StoneWell,
  ValveWheel,
  Walker,
} from "./MapArt";

export type MapHit =
  | { kind: "sand"; point: Pt }
  | { kind: "placement"; id: string; point: Pt }
  | { kind: "trunk"; point: Pt }
  | { kind: "valve"; point: Pt }
  | { kind: "bazaar"; point: Pt }
  | { kind: "plant"; point: Pt }
  | { kind: "cluster"; id: string; point: Pt };

type Props = {
  placements: Placement[];
  functionalIds: string[];
  selectedId: string | null;
  tool: InterventionType | null;
  hover: Pt | null;
  linkFrom: Placement | null;
  waterWorking: boolean;
  noteTool?: boolean;
  svgRef?: Ref<SVGSVGElement>;
  onHover: (point: Pt | null) => void;
  onHit: (hit: MapHit) => void;
};

const HIDDEN = new Set<InterventionType>(["pipeline", "road"]);

function SandStreet({
  pts,
  wide = false,
  packed = false,
  yard = false,
}: {
  pts: Pt[];
  wide?: boolean;
  packed?: boolean;
  yard?: boolean;
}) {
  const edge = wide ? 32 : yard ? 14 : 22;
  const bed = wide ? 20 : yard ? 7.5 : 13;
  const d = polylinePath(pts);
  return (
    <g>
      <path d={d} fill="none" stroke="#6b4524" strokeWidth={edge} strokeLinecap="round" opacity="0.42" />
      <path
        d={d}
        fill="none"
        stroke={packed ? "#6b5340" : yard ? "#e2c89a" : "#e8c890"}
        strokeWidth={bed}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={packed || !wide ? undefined : "11 8"}
      />
      {packed && (
        <path
          d={d}
          fill="none"
          stroke="#f3e0c2"
          strokeWidth={wide ? 2.4 : 1.4}
          strokeDasharray="9 13"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

export function svgCoords(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const mapped = point.matrixTransform(ctm.inverse());
  return {
    x: Math.min(MAP.w - 20, Math.max(20, mapped.x)),
    y: Math.min(MAP.h - 20, Math.max(20, mapped.y)),
  };
}

function Glyph({ type, weak, filled }: { type: InterventionType; weak?: boolean; filled?: boolean }) {
  if (type === "well") return <StoneWell weak={weak} />;
  if (type === "water_tank") return <RoundTank filled={filled} />;
  if (type === "solar_still") return <SolarStill />;
  if (type === "elevated_tank") return <ElevatedTank />;
  if (type === "house_taps") return <HouseTaps />;
  if (type === "main_water_line") return <RoKiosk />;
  if (type === "clay_filter") return <ClayFilter />;
  if (type === "demo_house") return <DemoHouse />;
  switch (type) {
    case "rainwater":
      return (
        <g>
          <path d="M -16 4 L 0 -14 L 16 4 Z" fill="#7a9bb0" stroke="#3e5360" strokeWidth="1.5" />
          <rect x="-7" y="4" width="14" height="12" rx="2" fill="#4d7180" />
        </g>
      );
    case "solar_farm":
      return (
        <g>
          <rect x="-20" y="-4" width="40" height="22" rx="2" fill="#1e3a5f" stroke="#f0c14b" strokeWidth="1.6" />
          <path d="M -12 -4 v 22 M 0 -4 v 22 M 12 -4 v 22" stroke="#7ec8d9" strokeWidth="1" />
        </g>
      );
    case "solar_pump":
      return (
        <g>
          <circle cx="0" cy="6" r="11" fill="#875f2a" />
          <rect x="-4" y="-14" width="8" height="14" fill="#c9842a" />
          <circle cx="0" cy="-16" r="6" fill="#f5d76e" />
        </g>
      );
    case "battery":
      return (
        <g>
          <rect x="-14" y="-10" width="28" height="22" rx="3" fill="#3f6b4e" stroke="#1f3326" />
          <rect x="-4" y="-14" width="8" height="5" fill="#1f3326" />
        </g>
      );
    case "distribution_line":
      return (
        <g>
          <rect x="-3" y="-20" width="6" height="36" fill="#5c3a22" />
          <path d="M -18 -8 Q 0 -18 18 -8" fill="none" stroke="#1d4e63" strokeWidth="2" />
        </g>
      );
    case "market":
      return (
        <g>
          <path d="M -20 -2 L 0 -16 L 20 -2" fill="#c45c26" />
          <rect x="-16" y="-2" width="32" height="18" fill="#e8c9a0" stroke="#5c3a22" />
        </g>
      );
    case "livestock_center":
      return (
        <g>
          <rect x="-18" y="-4" width="36" height="18" fill="#8a6a3b" stroke="#5c3a22" />
          <circle cx="-6" cy="2" r="5" fill="#d9c59a" />
          <circle cx="8" cy="4" r="4" fill="#d9c59a" />
        </g>
      );
    case "processing_unit":
      return (
        <g>
          <rect x="-18" y="-8" width="36" height="24" fill="#7a7468" stroke="#3f3a34" />
          <rect x="6" y="-20" width="8" height="14" fill="#5c3a22" />
        </g>
      );
    case "microfinance":
      return (
        <g>
          <rect x="-16" y="-8" width="32" height="24" fill="#d6b25c" stroke="#5c3a22" />
          <text y="6" textAnchor="middle" fontSize="12" fill="#5c3a22" fontWeight="700">
            Rs
          </text>
        </g>
      );
    case "school":
      return (
        <g>
          <rect x="-18" y="-6" width="36" height="22" fill="#b8572a" stroke="#5c3a22" />
          <path d="M -20 -6 L 0 -20 L 20 -6" fill="#7a2e16" />
        </g>
      );
    case "skill_center":
      return (
        <g>
          <rect x="-18" y="-10" width="36" height="26" fill="#2f4d6a" stroke="#f0c14b" />
          <rect x="-8" y="-2" width="16" height="10" fill="#9ad0e0" />
        </g>
      );
    case "clinic":
      return (
        <g>
          <rect x="-16" y="-10" width="32" height="26" fill="#f3efe4" stroke="#5c3a22" />
          <rect x="-3" y="-2" width="6" height="16" fill="#c0392b" />
          <rect x="-8" y="4" width="16" height="6" fill="#c0392b" />
        </g>
      );
    case "internet_tower":
      return (
        <g>
          <path d="M 0 -22 L -10 16 H 10 Z" fill="#4a4f59" stroke="#1f2328" />
          <circle cx="0" cy="-18" r="5" fill="#7ec8d9" />
        </g>
      );
    default:
      return null;
  }
}

export function resolveHit(point: Pt, placements: Placement[]): MapHit {
  const stamp = [...placements]
    .reverse()
    .find((item) => {
      if (HIDDEN.has(item.type)) return false;
      return Math.hypot(item.x - point.x, item.y - point.y) < 26;
    });
  if (stamp) return { kind: "placement", id: stamp.id, point };

  const pipe = placements.find((item) => {
    if (item.type !== "pipeline" || item.x2 == null || item.y2 == null) return false;
    return distToPolyline([{ x: item.x, y: item.y }, { x: item.x2, y: item.y2 }], point) < 16;
  });
  if (pipe) return { kind: "placement", id: pipe.id, point };

  if (Math.hypot(point.x - VALVE.x, point.y - VALVE.y) < 26) {
    return { kind: "valve", point: VALVE };
  }
  if (distToPolyline(TRUNK, point) < 18) {
    return { kind: "trunk", point: nearestOnPolyline(TRUNK, point) };
  }
  if (distToPolyline(BAZAAR, point) < 20) {
    return { kind: "bazaar", point: nearestOnPolyline(BAZAAR, point) };
  }
  if (point.x > 900 && point.y < 200) {
    return { kind: "plant", point };
  }
  const cluster = CLUSTERS.find((item) => Math.hypot(item.cx - point.x, item.cy - point.y) < 70);
  if (cluster) return { kind: "cluster", id: cluster.id, point };
  return { kind: "sand", point };
}

export function VillageMap({
  placements,
  functionalIds,
  selectedId,
  tool,
  hover,
  linkFrom,
  waterWorking,
  noteTool = false,
  svgRef,
  onHover,
  onHit,
}: Props) {
  const functional = new Set(functionalIds);
  const hasRoad = placements.some((item) => item.type === "road" && functional.has(item.id));
  const pipes = placements.filter((item) => item.type === "pipeline");
  const highlightRoad = tool === "road";

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    onHover(svgCoords(event.currentTarget, event.clientX, event.clientY));
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    /* Stamp tools place only via palette drag — map clicks are for pipe/road/notes. */
    if (tool && tool !== "pipeline" && tool !== "road") return;
    const point = svgCoords(event.currentTarget, event.clientX, event.clientY);
    onHit(resolveHit(point, placements));
  }

  return (
    <svg
      viewBox={`0 0 ${MAP.w} ${MAP.h}`}
      className={`map-canvas ${tool ? "is-build" : ""} ${noteTool ? "is-note" : ""}`}
      role="img"
      aria-label="Map of Goth Sattar"
      ref={svgRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => onHover(null)}
    >
      <defs>
        <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#edc98a" />
          <stop offset="55%" stopColor="#d9a45c" />
          <stop offset="100%" stopColor="#c4843c" />
        </linearGradient>
        <clipPath id="plant-clip">
          <rect x="920" y="22" width="152" height="92" rx="8" />
        </clipPath>
        <filter id="soft">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.18" />
        </filter>
      </defs>

      <rect width={MAP.w} height={MAP.h} fill="url(#sand)" />
      <path d="M 0 80 C 200 20, 400 90, 620 40 C 820 0, 960 70, 1100 30 L 1100 0 L 0 0 Z" fill="#e8c080" opacity="0.7" />
      <path d="M 0 640 C 180 580, 400 700, 700 620 C 900 560, 1000 680, 1100 600 L 1100 720 L 0 720 Z" fill="#c9924a" opacity="0.55" />

      <text x="24" y="30" className="map-kicker">
        GOTH SATTAR · THARPARKAR
      </text>

      {TREES.map((tree, index) => (
        <Khejri key={index} x={tree.x} y={tree.y} s={index % 3 === 0 ? 1.15 : 0.9} />
      ))}

      {LANES.map((lane) => (
        <SandStreet key={lane.id} pts={lane.pts} yard={lane.yard} />
      ))}
      <SandStreet pts={BAZAAR} wide packed={hasRoad} />
      {highlightRoad && !hasRoad && (
        <path
          d={polylinePath(BAZAAR)}
          fill="none"
          stroke="#c45c26"
          strokeWidth="6"
          strokeDasharray="8 7"
          strokeLinecap="round"
          className="pulse-stroke"
        />
      )}
      <text x="760" y="548" className="map-caption">
        {hasRoad ? "Road → town" : "Goat track → town"}
      </text>

      <path
        d={polylinePath(TRUNK)}
        fill="none"
        stroke="#6b5340"
        strokeWidth="7"
        strokeDasharray="10 8"
        strokeLinecap="round"
        opacity="0.45"
      />
      <text x="805" y="248" className="map-caption map-caption-soft" textAnchor="middle">
        Plant water · not village taps
      </text>

      {pipes.map((pipe) => {
        const live = functional.has(pipe.id);
        if (pipe.x2 == null || pipe.y2 == null) return null;
        const end = { x: pipe.x2, y: pipe.y2 };
        return (
          <g key={pipe.id} opacity={live ? 1 : 0.4}>
            <path
              d={`M ${pipe.x} ${pipe.y} L ${end.x} ${end.y}`}
              fill="none"
              stroke={live ? "#16384a" : "#8a6238"}
              strokeWidth="8"
              strokeLinecap="round"
            />
            {live && (
              <path
                d={`M ${pipe.x} ${pipe.y} L ${end.x} ${end.y}`}
                fill="none"
                stroke="#7ec8d9"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="water-flow"
              />
            )}
          </g>
        );
      })}

      {CLUSTERS.map((cluster) => (
        <g key={cluster.id}>
          <ellipse cx={cluster.cx} cy={cluster.cy} rx="78" ry="56" fill="#c9a06c" opacity="0.38" />
          <path d={cluster.wall} fill="#d7b07a" stroke="#8a6238" strokeWidth="3" opacity="0.55" />
          {cluster.boxes.map((box, index) => (
            <MudBox key={index} {...box} white={index === 0} />
          ))}
          {cluster.huts.map((hut, index) => (
            <Chaunra key={index} x={hut.x} y={hut.y} />
          ))}
        </g>
      ))}

      <Goat x={270} y={540} />

      {!waterWorking && (
        <g pointerEvents="none" opacity="0.9">
          <Walker x={152} y={420} />
          <Walker x={178} y={446} />
          <text x="168" y="478" textAnchor="middle" className="map-warn">
            Walking for water
          </text>
        </g>
      )}

      <g transform={`translate(${VALVE.x} ${VALVE.y})`} filter="url(#soft)">
        <ValveWheel live={false} />
        <text y="30" textAnchor="middle" className="map-label map-label-soft">
          Valve
        </text>
      </g>

      <g clipPath="url(#plant-clip)">
        <image href="/thar/plant.png" x="920" y="22" width="152" height="92" preserveAspectRatio="xMidYMid slice" />
      </g>
      <rect x="920" y="22" width="152" height="92" rx="8" fill="none" stroke="#5c3a22" strokeWidth="1.4" opacity="0.7" />
      <text x="996" y="132" textAnchor="middle" className="map-label map-label-soft">
        Coal plant
      </text>

      {placements.map((item) => {
        if (HIDDEN.has(item.type)) return null;
        const selected = selectedId === item.id;
        const def = interventionOf(item.type);
        return (
          <g
            key={item.id}
            transform={`translate(${item.x} ${item.y})`}
            filter="url(#soft)"
            className="map-stamp"
          >
            {selected && (
              <circle r="30" fill="none" stroke="#f0c14b" strokeWidth="2.5" strokeDasharray="4 3" />
            )}
            <circle
              r="22"
              fill="#f7ecd4"
              stroke={functional.has(item.id) ? "#5c3a22" : "#a07848"}
              strokeWidth="2"
              strokeDasharray={functional.has(item.id) ? "0" : "4 3"}
            />
            <Glyph
              type={item.type}
              weak={
                item.type === "well" &&
                !placements.some((helper) => {
                  if (!functional.has(helper.id)) return false;
                  const near = Math.hypot(helper.x - item.x, helper.y - item.y) < 140;
                  return (
                    near &&
                    (helper.type === "solar_pump" ||
                      helper.type === "water_tank" ||
                      helper.type === "elevated_tank" ||
                      helper.type === "solar_still")
                  );
                })
              }
              filled={item.type === "water_tank" && functional.has(item.id)}
            />
            {selected && (
              <text y="38" textAnchor="middle" className="map-label">
                {def.shortName}
              </text>
            )}
          </g>
        );
      })}

      {tool === "pipeline" && linkFrom && hover && (
        <path
          d={`M ${linkFrom.x} ${linkFrom.y} L ${hover.x} ${hover.y}`}
          fill="none"
          stroke="#1d6b82"
          strokeWidth="5"
          strokeDasharray="7 6"
          pointerEvents="none"
        />
      )}

      {tool && hover && tool !== "pipeline" && tool !== "road" && (
        <g transform={`translate(${hover.x} ${hover.y})`} opacity="0.5" pointerEvents="none">
          <circle r="26" fill="#f4e6c8" stroke="#5c3a22" strokeDasharray="5 4" />
          <Glyph type={tool} />
        </g>
      )}
    </svg>
  );
}
