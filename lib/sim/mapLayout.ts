import { dist } from "./format";

export type Pt = { x: number; y: number };

export const MAP = { w: 1100, h: 720 };

/** Thar coal / mining scheme sits east of the dhani. Process water stays there. */
export const PLANT = { x: 990, y: 118 };
export const VALVE = { x: 712, y: 352 };

export const TRUNK: Pt[] = [
  { x: 955, y: 168 },
  { x: 888, y: 214 },
  { x: 812, y: 278 },
  { x: 712, y: 352 },
  { x: 560, y: 368 },
  { x: 410, y: 372 },
  { x: 250, y: 358 },
];

/** Goat path toward Mithi / Islamkot bazaar. */
export const BAZAAR: Pt[] = [
  { x: 86, y: 438 },
  { x: 230, y: 418 },
  { x: 390, y: 442 },
  { x: 560, y: 478 },
  { x: 740, y: 522 },
  { x: 930, y: 558 },
];

export type Lane = { id: string; pts: Pt[]; yard?: boolean };

/** Packed sand lanes between compounds — the streets you walk. */
export const LANES: Lane[] = [
  {
    id: "west-gate",
    pts: [
      { x: 168, y: 248 },
      { x: 172, y: 298 },
      { x: 178, y: 348 },
      { x: 196, y: 388 },
      { x: 230, y: 418 },
    ],
  },
  {
    id: "south-gate",
    pts: [
      { x: 196, y: 458 },
      { x: 208, y: 438 },
      { x: 230, y: 418 },
    ],
  },
  {
    id: "north-gate",
    pts: [
      { x: 478, y: 252 },
      { x: 448, y: 288 },
      { x: 388, y: 338 },
      { x: 318, y: 378 },
      { x: 268, y: 408 },
      { x: 230, y: 418 },
    ],
  },
  {
    id: "north-west",
    pts: [
      { x: 250, y: 138 },
      { x: 318, y: 158 },
      { x: 392, y: 164 },
      { x: 428, y: 168 },
    ],
  },
  {
    id: "west-south",
    pts: [
      { x: 92, y: 268 },
      { x: 78, y: 348 },
      { x: 82, y: 428 },
      { x: 108, y: 478 },
      { x: 128, y: 492 },
    ],
  },
  {
    id: "west-yard",
    yard: true,
    pts: [
      { x: 120, y: 168 },
      { x: 148, y: 188 },
      { x: 168, y: 198 },
      { x: 186, y: 222 },
      { x: 168, y: 248 },
    ],
  },
  {
    id: "south-yard",
    yard: true,
    pts: [
      { x: 128, y: 492 },
      { x: 168, y: 508 },
      { x: 196, y: 518 },
      { x: 210, y: 548 },
    ],
  },
  {
    id: "north-yard",
    yard: true,
    pts: [
      { x: 428, y: 168 },
      { x: 448, y: 188 },
      { x: 478, y: 198 },
      { x: 500, y: 208 },
      { x: 478, y: 252 },
    ],
  },
];

export const TREES: Pt[] = [
  { x: 40, y: 260 },
  { x: 86, y: 120 },
  { x: 268, y: 86 },
  { x: 318, y: 248 },
  { x: 470, y: 130 },
  { x: 520, y: 520 },
  { x: 640, y: 210 },
  { x: 88, y: 560 },
  { x: 300, y: 620 },
  { x: 780, y: 430 },
  { x: 860, y: 620 },
];

export const CLUSTERS = [
  {
    id: "west",
    name: "West compound",
    note: "Nine chaunras. Without a nearby well and tank, women still walk for tanker water.",
    cx: 168,
    cy: 198,
    wall: "M 70 150 L 250 128 L 268 250 L 92 268 Z",
    huts: [
      { x: 120, y: 168 },
      { x: 168, y: 148 },
      { x: 214, y: 172 },
      { x: 128, y: 214 },
      { x: 186, y: 222 },
    ],
    boxes: [
      { x: 232, y: 198, w: 36, h: 28 },
      { x: 96, y: 178, w: 28, h: 22 },
    ],
  },
  {
    id: "south",
    name: "South dhani",
    note: "Courtyard tank weather — livestock drink here if a well lifts aquifer water.",
    cx: 196,
    cy: 512,
    wall: "M 88 458 L 268 448 L 286 580 L 78 592 Z",
    huts: [
      { x: 128, y: 492 },
      { x: 178, y: 478 },
      { x: 226, y: 502 },
      { x: 150, y: 542 },
      { x: 210, y: 548 },
    ],
    boxes: [{ x: 250, y: 520, w: 32, h: 24 }],
  },
  {
    id: "north",
    name: "North compound",
    note: "Whitewashed rooms and thatch. The plant trunk nearby is process water, not village taps.",
    cx: 478,
    cy: 188,
    wall: "M 400 128 L 560 118 L 572 248 L 392 252 Z",
    huts: [
      { x: 428, y: 168 },
      { x: 478, y: 152 },
      { x: 524, y: 178 },
      { x: 448, y: 214 },
    ],
    boxes: [
      { x: 500, y: 208, w: 40, h: 26 },
      { x: 414, y: 196, w: 26, h: 20 },
    ],
  },
] as const;

export function polylinePath(points: Pt[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function nearestOnPolyline(points: Pt[], point: Pt): Pt {
  let best = points[0];
  let bestDist = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2));
    const snapped = { x: a.x + t * dx, y: a.y + t * dy };
    const d = dist(point, snapped);
    if (d < bestDist) {
      bestDist = d;
      best = snapped;
    }
  }
  return best;
}

export function distToPolyline(points: Pt[], point: Pt) {
  return dist(point, nearestOnPolyline(points, point));
}

export function bazaarMid() {
  return BAZAAR[Math.floor(BAZAAR.length / 2)];
}
