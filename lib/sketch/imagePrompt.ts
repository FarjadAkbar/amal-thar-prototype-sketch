import { interventionOf } from "@/lib/sim/catalog";
import type { Placement } from "@/lib/sim/types";

export function imagePromptFromVillage(placements: Placement[]) {
  const built = placements.filter((item) => item.type !== "pipeline" && item.type !== "road");
  const pipes = placements.filter((item) => item.type === "pipeline");
  const comments = built
    .map((item) => item.comment?.trim())
    .filter((text): text is string => Boolean(text));

  const parts = [
    "A student's hand-drawn pencil sketch on cream notebook paper.",
    'Title written in handwriting across the top: "GOTH SATTAR · THARPARKAR".',
    "Homework-style diagram of a Thar desert village in Pakistan, not a poster, not 3D, not photorealistic.",
    "Black ink outlines, light sand wash, numbered labels, orange handwritten notes beside objects.",
    "Simple desert: dunes, a few katcha huts with thatch, a dirt track. No city skyline. No household tap network.",
  ];

  if (built.length === 0) {
    parts.push("Empty village sand. No well, no solar, no pump, no tank, no tower. Only the place name and empty courtyards.");
  } else {
    parts.push("Draw ONLY the things the student actually built, in the same chain they made:");
    built.forEach((item, index) => {
      const def = interventionOf(item.type);
      const note = item.comment?.trim();
      parts.push(
        `${index + 1}. ${def.name}${note ? ` — handwritten student comment: "${note}"` : ""}.`,
      );
    });
    if (pipes.length) {
      parts.push(`Draw ${pipes.length} pipe line${pipes.length === 1 ? "" : "s"} from well to tank, labeled "pipe".`);
    }
  }

  if (comments.length) {
    parts.push(`Put these comments on the drawing in orange handwriting: ${comments.join(" / ")}`);
  }

  parts.push(
    "Do not add sun, solar panels, pumps, towers, or pipes unless they are listed above.",
    "Look like a classroom water-cycle sketch, slightly messy, student-made.",
  );

  return parts.join(" ");
}
