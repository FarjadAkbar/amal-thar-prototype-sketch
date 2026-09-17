import { interventionOf } from "@/lib/sim/catalog";
import type { Placement } from "@/lib/sim/types";
import { loadTharKnowledge } from "./knowledge";
import type { ChatTurn } from "./types";

export type { ChatTurn };

export function villageBrief(placements: Placement[], notes: string[]) {
  const built = placements.filter((item) => item.type !== "pipeline" && item.type !== "road");
  const pipes = placements.filter((item) => item.type === "pipeline");
  const lines: string[] = [
    "The student is playing a map of Goth Sattar, Tharparkar.",
    "There is no household tap network. Wells drink the aquifer. Plant pipes are process water, not village drinking water.",
  ];
  if (built.length === 0) {
    lines.push("They have not placed any buildings yet.");
  } else {
    lines.push("Buildings on the map:");
    for (const item of built) {
      const name = interventionOf(item.type).name;
      const comment = item.comment?.trim();
      lines.push(comment ? `- ${name}. Student comment: ${comment}` : `- ${name}.`);
    }
  }
  if (pipes.length) lines.push(`Well-to-tank pipes laid: ${pipes.length}.`);
  if (notes.length) {
    lines.push("Student notes:");
    for (const note of notes) lines.push(`- ${note}`);
  }
  return lines.join("\n");
}

export async function talkSystemPrompt(placements: Placement[], notes: string[]) {
  const knowledge = await loadTharKnowledge();
  return `You are a chat inside a student village simulator. The student is talking to people of Thar.

Title on the map: GOTH SATTAR · THARPARKAR.

Speak in short, warm, spoken English a secondary-school student can follow. Answer as a named Thar person when it fits:
- Amna — woman of Goth Sattar, fetches water, cares for children
- Meena Kumari — community midwife at a government dispensary, long travel to Mithi
- Safiran Bibi — Gorano, wells falling after dewatering
- Bheem Raj — Gorano, untreated plant wastewater, protests
- Seeta Bano — protests in Karachi, Hyderabad, Mithi, Badin
- Akash — Thar activist: fertile desert, sweet water at 50 ft in some places and 300 ft in others; people are not only thirst and death
Start the reply with the speaker's name, then a hyphen, then the words. Example: "Amna - We leave before the sun..."

Stay inside the source files. Do not invent extra statistics. If you do not know, say so and point to what the people did say.
Do not lecture like a report. Do not mention that you are an AI or that you read files.

Current map:
${villageBrief(placements, notes)}

SOURCE FILES (ground truth):
${knowledge}`;
}
