"use client";

import { useRef, type PointerEvent } from "react";
import { MAP } from "@/lib/sim/mapLayout";

export type StickyNote = {
  id: string;
  x: number;
  y: number;
  text: string;
};

type Props = {
  notes: StickyNote[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
};

export function StickyLayer({ notes, selectedId, onSelect, onChange, onRemove, onMove }: Props) {
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  function pointOnLayer(event: PointerEvent<HTMLElement>) {
    const layer = event.currentTarget.closest(".sticky-layer");
    if (!(layer instanceof HTMLElement)) return null;
    const box = layer.getBoundingClientRect();
    return {
      x: Math.min(MAP.w - 20, Math.max(20, ((event.clientX - box.left) / box.width) * MAP.w)),
      y: Math.min(MAP.h - 20, Math.max(20, ((event.clientY - box.top) / box.height) * MAP.h)),
    };
  }

  return (
    <div className="sticky-layer">
      {notes.map((note, index) => {
        const open = selectedId === note.id;
        const flipLeft = note.x / MAP.w > 0.68;
        const flipUp = note.y / MAP.h > 0.62;
        return (
          <article
            key={note.id}
            className={["sticky-pin", open && "is-open", flipLeft && "is-left", flipUp && "is-up"]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: `${(note.x / MAP.w) * 100}%`,
              top: `${(note.y / MAP.h) * 100}%`,
            }}
          >
            <button
              type="button"
              className="sticky-dot"
              aria-label={`Sticky note ${index + 1}`}
              aria-expanded={open}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { id: note.id, moved: false };
                document.body.style.cursor = "grabbing";
              }}
              onPointerMove={(event) => {
                if (!drag.current || drag.current.id !== note.id || !onMove) return;
                const point = pointOnLayer(event);
                if (!point) return;
                if (!drag.current.moved) {
                  if (Math.hypot(point.x - note.x, point.y - note.y) < 8) return;
                  drag.current.moved = true;
                }
                onMove(note.id, point.x, point.y);
              }}
              onPointerUp={(event) => {
                event.stopPropagation();
                const session = drag.current;
                drag.current = null;
                document.body.style.cursor = "";
                try {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                } catch {
                  /* already released */
                }
                if (!session?.moved) onSelect(open ? null : note.id);
              }}
            >
              {index + 1}
            </button>
            {open && (
              <div className="sticky-card" onClick={(event) => event.stopPropagation()}>
                <p className="sticky-card-label">Note {index + 1}</p>
                <textarea
                  value={note.text}
                  rows={4}
                  placeholder="e.g. Girls miss school because of the 3-hour water walk."
                  onChange={(event) => onChange(note.id, event.target.value)}
                />
                <button type="button" className="sticky-delete" onClick={() => onRemove(note.id)}>
                  Delete
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
