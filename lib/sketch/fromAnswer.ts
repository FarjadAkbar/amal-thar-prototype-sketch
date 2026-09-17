import { interventionOf } from "@/lib/sim/catalog";
import { MAP } from "@/lib/sim/mapLayout";
import type { InterventionType, Placement } from "@/lib/sim/types";
import type { SketchFigure, SketchKind, SketchPipe, SketchSpec } from "./types";

const KIND: Partial<Record<InterventionType, SketchKind>> = {
  well: "well",
  solar_farm: "solar",
  solar_pump: "pump",
  solar_still: "tank",
  water_tank: "tank",
  elevated_tank: "tower",
  rainwater: "tank",
  house_taps: "houses",
  clay_filter: "tank",
  school: "school",
  skill_center: "school",
  clinic: "clinic",
  market: "market",
  livestock_center: "hut",
  processing_unit: "market",
  microfinance: "market",
  demo_house: "hut",
  internet_tower: "clinic",
  battery: "pipe",
  distribution_line: "pipe",
  main_water_line: "houses",
};

function onPaper(x: number, y: number) {
  return {
    x: (x / MAP.w) * 82 + 9,
    y: (y / MAP.h) * 68 + 20,
  };
}

function link(pipes: SketchPipe[], figures: SketchFigure[], fromKind: SketchKind, toKind: SketchKind, label = "") {
  const from = figures.findIndex((item) => item.kind === fromKind);
  const to = figures.findIndex((item) => item.kind === toKind);
  if (from < 0 || to < 0) return;
  if (pipes.some((pipe) => pipe.from === from && pipe.to === to)) return;
  pipes.push({ from, to, label });
}

/** Pencil sketch of what is actually on the Goth Sattar map, plus student comments. */
export function sketchFromVillage(placements: Placement[], caption = ""): SketchSpec {
  const figures: SketchFigure[] = [];
  const indexById = new Map<string, number>();
  const hasSolar = placements.some(
    (item) => item.type === "solar_farm" || item.type === "solar_pump" || item.type === "solar_still",
  );

  if (hasSolar) {
    figures.push({ kind: "sun", label: "Sun", x: 12, y: 16, step: 1 });
  }

  for (const item of placements) {
    if (item.type === "pipeline" || item.type === "road") continue;
    const kind = KIND[item.type];
    if (!kind) continue;
    const point = onPaper(item.x, item.y);
    indexById.set(item.id, figures.length);
    figures.push({
      kind,
      label: interventionOf(item.type).shortName,
      x: point.x,
      y: point.y,
      step: figures.length + 1,
      note: item.comment?.trim() || undefined,
    });
  }

  const pipes: SketchPipe[] = [];
  for (const item of placements) {
    if (item.type !== "pipeline" || !item.fromId || item.x2 == null || item.y2 == null) continue;
    const from = indexById.get(item.fromId);
    const tank = placements.find((row) => {
      if (row.type !== "water_tank" && row.type !== "elevated_tank") return false;
      return Math.hypot(row.x - item.x2!, row.y - item.y2!) < 28;
    });
    const to = tank ? indexById.get(tank.id) : undefined;
    if (from == null || to == null) continue;
    pipes.push({ from, to, label: "pipe" });
  }

  link(pipes, figures, "sun", "solar");
  link(pipes, figures, "solar", "pump", "power");
  link(pipes, figures, "well", "pump");
  link(pipes, figures, "pump", "tower");
  link(pipes, figures, "pump", "tank");

  const comments = placements
    .map((item) => item.comment?.trim())
    .filter((text): text is string => Boolean(text));

  return {
    title: "GOTH SATTAR · THARPARKAR",
    heard: caption.trim() || comments.join(" · ") || "What you built on the map.",
    nextQuestion: comments.length
      ? "Your comments are on the sketch. What is still missing in the chain?"
      : "Add a comment on each building — it will appear on the sketch.",
    figures,
    pipes,
    source: "local",
  };
}

export function sketchFromAnswer(answer: string): SketchSpec {
  return sketchFromVillage([], answer);
}
