"use client";

import { useEffect, useRef, useState } from "react";
import { sketchFromVillage } from "@/lib/sketch/fromAnswer";
import type { Placement } from "@/lib/sim/types";
import { SketchPaper } from "./SketchPaper";
import type { SketchSpec } from "@/lib/sketch/types";

type Props = {
  placements: Placement[];
  sketch: SketchSpec | null;
  onSketched: (spec: SketchSpec) => void;
};

export function AnswerSketch({ placements, sketch, onSketched }: Props) {
  const built = placements.filter((item) => item.type !== "pipeline" && item.type !== "road").length;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sketch) return;
    frameRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sketch]);

  async function sketchIt() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements }),
      });
      const payload = (await response.json()) as SketchSpec & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not draw the sketch.");
      }
      onSketched(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw the sketch.");
      onSketched(sketchFromVillage(placements));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="answer-sketch">
      <div className="sketch-row">
        <p className="sketch-lead">
          {built === 0
            ? "Not the final product — just a rough prototype. Place your idea, then sketch it."
            : `Turn ${built} placed idea${built === 1 ? "" : "s"} into a scrappy sketch others can react to.`}
        </p>
        <button className="btn btn-sketch" type="button" onClick={() => void sketchIt()} disabled={busy}>
          {busy ? "Drawing…" : "Convert into sketch"}
        </button>
      </div>
      {error && <p className="chat-error">{error}</p>}
      {sketch && (
        <figure ref={frameRef} className="sketch-frame">
          {sketch.image ? (
            <img src={sketch.image} alt={sketch.title} className="sketch-photo" />
          ) : (
            <SketchPaper spec={sketch} />
          )}
        </figure>
      )}
    </section>
  );
}
