"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { MAP } from "@/lib/sim/mapLayout";
import type { Placement } from "@/lib/sim/types";

type Props = {
  placements: Placement[];
  selectedId: string | null;
  disabled?: boolean;
  onPick: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onMoveEnd: () => void;
  onStay: (id: string) => void;
};

const SKIP = new Set(["pipeline", "road"]);

export function StampLayer({
  placements,
  selectedId,
  disabled = false,
  onPick,
  onMove,
  onMoveEnd,
  onStay,
}: Props) {
  const drag = useRef<{
    id: string;
    pointerId: number;
    moved: boolean;
    startX: number;
    startY: number;
  } | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const stopDrag = useRef<(() => void) | null>(null);

  const onMoveRef = useRef(onMove);
  const onMoveEndRef = useRef(onMoveEnd);
  const onStayRef = useRef(onStay);
  const onPickRef = useRef(onPick);
  onMoveRef.current = onMove;
  onMoveEndRef.current = onMoveEnd;
  onStayRef.current = onStay;
  onPickRef.current = onPick;

  useEffect(() => () => stopDrag.current?.(), []);

  function clientToMap(clientX: number, clientY: number) {
    const layer = layerRef.current;
    if (!layer) return null;
    const box = layer.getBoundingClientRect();
    return {
      x: Math.min(MAP.w - 20, Math.max(20, ((clientX - box.left) / box.width) * MAP.w)),
      y: Math.min(MAP.h - 20, Math.max(20, ((clientY - box.top) / box.height) * MAP.h)),
    };
  }

  function finish(clientX: number, clientY: number) {
    const session = drag.current;
    if (!session) return;
    drag.current = null;
    stopDrag.current?.();
    stopDrag.current = null;
    document.body.style.cursor = "";
    if (session.moved) {
      const point = clientToMap(clientX, clientY);
      if (point) onMoveRef.current(session.id, point.x, point.y);
      onMoveEndRef.current();
    } else {
      onStayRef.current(session.id);
    }
  }

  function beginDrag(id: string, pointerId: number, clientX: number, clientY: number) {
    stopDrag.current?.();
    drag.current = {
      id,
      pointerId,
      moved: false,
      startX: clientX,
      startY: clientY,
    };
    document.body.style.cursor = "grabbing";
    onPickRef.current(id);

    const onWinMove = (event: globalThis.PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const session = drag.current;
      if (!session) return;
      if (!session.moved) {
        if (Math.hypot(event.clientX - session.startX, event.clientY - session.startY) < 5) return;
        session.moved = true;
      }
      const point = clientToMap(event.clientX, event.clientY);
      if (point) onMoveRef.current(session.id, point.x, point.y);
    };
    const onWinUp = (event: globalThis.PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      finish(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onWinMove);
    window.addEventListener("pointerup", onWinUp);
    window.addEventListener("pointercancel", onWinUp);
    stopDrag.current = () => {
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
  }

  const stamps = placements.filter((item) => !SKIP.has(item.type));

  return (
    <div ref={layerRef} className="stamp-layer" aria-hidden={disabled || undefined}>
      {stamps.map((item) => {
        const selected = selectedId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={["stamp-handle", selected && "is-selected"].filter(Boolean).join(" ")}
            style={{
              left: `${(item.x / MAP.w) * 100}%`,
              top: `${(item.y / MAP.h) * 100}%`,
            }}
            aria-label="Drag to move"
            disabled={disabled}
            onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
              if (disabled || event.button !== 0) return;
              event.preventDefault();
              event.stopPropagation();
              try {
                event.currentTarget.setPointerCapture(event.pointerId);
              } catch {
                /* ok */
              }
              beginDrag(item.id, event.pointerId, event.clientX, event.clientY);
            }}
          />
        );
      })}
    </div>
  );
}
