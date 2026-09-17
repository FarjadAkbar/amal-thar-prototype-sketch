import { sketchFromVillage } from "@/lib/sketch/fromAnswer";
import { imagePromptFromVillage } from "@/lib/sketch/imagePrompt";
import type { Placement } from "@/lib/sim/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  placements?: Placement[];
};

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY?.trim();
  const base = (process.env.OPENAI_BASE_URI ?? "https://api.openai.com/v1/").replace(/\/+$/, "");
  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1-mini";

  if (!key) {
    return Response.json({ error: "Add OPENAI_API_KEY to .env for sketch images." }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const placements = body.placements ?? [];
  const spec = sketchFromVillage(placements);
  const prompt = imagePromptFromVillage(placements);

  const response = await fetch(`${base}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1536x1024",
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    data?: { b64_json?: string; url?: string }[];
  };

  if (!response.ok) {
    return Response.json(
      { error: payload.error?.message ?? "Could not draw the sketch." },
      { status: 502 },
    );
  }

  const row = payload.data?.[0];
  const image = row?.b64_json ? `data:image/png;base64,${row.b64_json}` : row?.url;
  if (!image) {
    return Response.json({ error: "No image came back." }, { status: 502 });
  }

  return Response.json({
    ...spec,
    image,
    source: "image",
  });
}
