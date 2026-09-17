export const SKETCH_KINDS = [
  "sun",
  "solar",
  "pump",
  "well",
  "tower",
  "tank",
  "houses",
  "pipe",
  "hut",
  "school",
  "market",
  "clinic",
  "tanker",
  "woman",
  "child",
  "blocked",
] as const;

export type SketchKind = (typeof SKETCH_KINDS)[number];

export type SketchFigure = {
  kind: SketchKind;
  label: string;
  x: number;
  y: number;
  step?: number;
  note?: string;
};

export type SketchPipe = {
  from: number;
  to: number;
  label: string;
};

export type SketchSpec = {
  title: string;
  heard: string;
  nextQuestion: string;
  figures: SketchFigure[];
  pipes: SketchPipe[];
  source?: "local" | "image";
  image?: string;
};
