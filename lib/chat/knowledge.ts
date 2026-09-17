import { readFile } from "node:fs/promises";
import path from "node:path";

function clip(text: string, max: number) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= max) return clean;
  const head = Math.floor(max * 0.7);
  const tail = max - head - 20;
  return `${clean.slice(0, head)}\n\n[...]\n\n${clean.slice(-tail)}`;
}

export async function loadTharKnowledge() {
  const dir = path.join(process.cwd(), "public", "files");
  const [worldBank, dawn, wash] = await Promise.all([
    readFile(path.join(dir, "1.txt"), "utf8"),
    readFile(path.join(dir, "2.txt"), "utf8"),
    readFile(path.join(dir, "3.txt"), "utf8"),
  ]);

  return [
    "SOURCE 1 — World Bank blog, Shaza Khan, 2022 (public/files/1.txt)",
    clip(worldBank, 7000),
    "",
    "SOURCE 2 — Dawn, Sukhl Khu / Dry Wells, 13 May 2024 (public/files/2.txt)",
    clip(dawn, 8000),
    "",
    "SOURCE 3 — Hirani, WASH study of Tharparkar, PSSR 2019 (public/files/3.txt)",
    clip(wash, 14000),
  ].join("\n");
}
