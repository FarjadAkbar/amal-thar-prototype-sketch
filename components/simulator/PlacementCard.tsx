import type { Placement } from "@/lib/sim/types";
import { interventionOf } from "@/lib/sim";

type Props = {
  placement: Placement;
  onComment: (text: string) => void;
  onRemove: () => void;
};

export function PlacementCard({ placement, onComment, onRemove }: Props) {
  const placed = interventionOf(placement.type);

  return (
    <section className="placement-card">
      <label className="comment-field">
        Comment on {placed.shortName}
        <textarea
          value={placement.comment ?? ""}
          placeholder="e.g. Well next to Amna’s compound so girls walk less."
          rows={2}
          onChange={(event) => onComment(event.target.value)}
        />
        <span className="comment-hint">Shows on the sketch — keep it short and real.</span>
      </label>
      <button type="button" className="btn btn-remove" onClick={onRemove}>
        Remove this
      </button>
    </section>
  );
}
