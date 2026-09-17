import type { Talk } from "@/lib/sim/game";
import type { Placement } from "@/lib/sim/types";
import { interventionOf } from "@/lib/sim";

type Props = {
  talk: Talk;
  depth: number;
  onAskWhy?: () => void;
  placement?: Placement | null;
  onComment?: (text: string) => void;
  onRemove?: () => void;
};

export function ThinkCard({ talk, depth, onAskWhy, placement, onComment, onRemove }: Props) {
  const shown = talk.lines.slice(0, depth + 1);
  const current = talk.lines[Math.min(depth, talk.lines.length - 1)];
  const canAsk = depth < talk.lines.length - 1 && Boolean(current?.prompt);
  const placed = placement ? interventionOf(placement.type) : null;

  return (
    <section className="think-card">
      <header>
        <h2>{talk.speaker}</h2>
        <p className="talk-role">{talk.role}</p>
      </header>
      {shown.map((line, index) => (
        <p key={line.text} className={index === shown.length - 1 ? "headline" : "talk-prior"}>
          “{line.text}”
        </p>
      ))}
      {canAsk && onAskWhy && (
        <button type="button" onClick={onAskWhy}>
          Ask: {current.prompt}
        </button>
      )}
      {placement && onComment && (
        <label className="comment-field">
          Comment on {placed?.shortName ?? "this"}
          <textarea
            value={placement.comment ?? ""}
            placeholder="e.g. Well next to Amna’s compound so girls walk less."
            rows={3}
            onChange={(event) => onComment(event.target.value)}
          />
          <span className="comment-hint">This sentence is drawn on the sketch.</span>
        </label>
      )}
      {placement && onRemove && (
        <button type="button" className="ghost-btn" onClick={onRemove}>
          Remove this
        </button>
      )}
    </section>
  );
}
