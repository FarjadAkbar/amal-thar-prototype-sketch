import type { ChatTurn } from "@/lib/chat/types";
import { talkSystemPrompt } from "@/lib/chat/systemPrompt";
import type { Placement } from "@/lib/sim/types";

export const runtime = "nodejs";

type Body = {
  messages?: ChatTurn[];
  placements?: Placement[];
  notes?: string[];
};

export async function POST(request: Request) {
  const secret = process.env.ALI_BABA_API_SECRET?.trim();
  const base = process.env.ALI_BABA_BASE_URI?.replace(/\/+$/, "");
  const model = process.env.ALI_BABA_MODEL?.trim() || "deepseek-v4-flash";
  const temperature = Number(process.env.ALI_BABA_TEMPERATURE ?? 0.7);

  if (!secret || !base) {
    return Response.json(
      { error: "Add ALI_BABA_API_SECRET and ALI_BABA_BASE_URI to .env." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (item) => item && (item.role === "user" || item.role === "assistant") && item.content.trim(),
  );
  const last = messages.at(-1);
  if (!last || last.role !== "user") {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  const history = messages.slice(-12);
  const system = await talkSystemPrompt(body.placements ?? [], body.notes ?? []);

  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: Number.isFinite(temperature) ? temperature : 0.7,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };

  if (!response.ok) {
    return Response.json(
      { error: payload.error?.message ?? "Thar people could not answer just now." },
      { status: 502 },
    );
  }

  const reply = payload.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return Response.json({ error: "Empty reply." }, { status: 502 });
  }

  return Response.json({ reply });
}
