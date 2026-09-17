import type { SketchFigure, SketchKind, SketchSpec } from "@/lib/sketch/types";

const W = 1000;
const H = 640;
const INK = "#3a3a3a";

function Pipe({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="7" />
      <path d={d} stroke="#f4ead6" strokeWidth="3.2" />
    </g>
  );
}

function Sun() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round">
      <path d="M -26 -4 C -24 -28, 8 -34, 24 -12 C 36 8, 18 30, -4 28 C -30 24, -30 16, -26 -4 Z" />
      <path d="M 2 -36 l 2 -16 M 24 -26 l 11 -13 M 36 -6 l 16 -1 M 30 18 l 13 11 M 4 34 l 1 15 M -22 28 l -11 12 M -36 4 l -15 2 M -26 -22 l -11 -13" />
    </g>
  );
}

function SolarPanel() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round">
      <path d="M -68 -52 L 72 -56 L 78 58 L -64 54 Z" />
      <path d="M -32 -53 L -28 55 M 6 -54 L 10 56 M 44 -55 L 46 57" />
      <path d="M -66 -24 L 74 -28 M -65 4 L 75 2 M -64 30 L 76 28" />
    </g>
  );
}

function Pump() {
  const vanes = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g fill="none" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="-48" cy="0" r="32" />
      <circle cx="-48" cy="0" r="7" />
      {vanes.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const x2 = -48 + Math.cos(a) * 28;
        const y2 = Math.sin(a) * 28;
        const x1 = -48 + Math.cos(a) * 8;
        const y1 = Math.sin(a) * 8;
        return <path key={deg} d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${(-48 + Math.cos(a + 0.4) * 16).toFixed(1)} ${(Math.sin(a + 0.4) * 16).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`} />;
      })}
      <path d="M -14 -22 Q 6 -28 58 -20 L 70 -8 Q 78 2 68 18 L 8 24 Q -10 16 -14 2 Z" />
      <path d="M 22 -20 L 26 20" />
      <path d="M 8 -18 L 12 22" opacity="0.7" />
      <path d="M 70 0 H 118" strokeWidth="5" />
    </g>
  );
}

function Well() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round">
      <ellipse cx="2" cy="-40" rx="46" ry="15" />
      <ellipse cx="2" cy="-36" rx="28" ry="8" />
      <path d="M -44 -40 L -42 32" />
      <path d="M 48 -40 L 44 32" />
      <ellipse cx="1" cy="32" rx="44" ry="14" />
      <path d="M -30 -20 h 60 M -32 -4 h 64 M -28 12 h 56" opacity="0.5" />
    </g>
  );
}

function Tower() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -46 -78 Q 0 -118 48 -78" />
      <path d="M -46 -78 L -50 52" />
      <path d="M 48 -78 L 46 52" />
      <ellipse cx="-1" cy="52" rx="48" ry="13" />
      <path d="M -34 -48 h 70 M -36 -16 h 72" opacity="0.4" />
      <path d="M -30 64 L -52 140" strokeWidth="1.6" />
      <path d="M -10 66 L -16 140" strokeWidth="1.6" />
      <path d="M 10 66 L 16 140" strokeWidth="1.6" />
      <path d="M 30 64 L 52 140" strokeWidth="1.6" />
      <path d="M -58 140 H 58" />
    </g>
  );
}

function Houses() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -118 42 C -30 10, 36 48, 128 22" />
      <path d="M -112 16 l 16 -24 h 40 v 46 h -56 z" />
      <path d="M -48 8 l 24 -30 h 44 v 52 h -68 z" />
      <path d="M 28 6 l 18 -22 h 36 v 42 h -54 z" />
      <path d="M 84 16 l 14 -18 h 30 v 32 h -44 z" />
      <path d="M -90 20 v 14 M -18 18 v 16 M 52 18 v 12 M 102 22 v 8" />
      <path d="M -130 54 Q -20 78 48 52 T 150 64" />
      <path d="M -100 70 Q 20 96 140 72" opacity="0.55" />
    </g>
  );
}

function GroundTank() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.6">
      <ellipse cx="0" cy="-22" rx="32" ry="11" />
      <path d="M -32 -22 v 40" />
      <path d="M 32 -22 v 40" />
      <ellipse cx="0" cy="18" rx="32" ry="11" />
    </g>
  );
}

function School() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.6">
      <path d="M -36 10 L 0 -28 L 36 10 Z" />
      <path d="M -28 10 h 56 v 28 h -56 z" />
      <path d="M -4 20 v 18" />
    </g>
  );
}

function Market() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.6">
      <path d="M -28 8 L 0 -22 L 28 8" />
      <path d="M -22 8 h 44 v 22 h -44 z" />
      <path d="M -10 18 h 20" />
    </g>
  );
}

function Clinic() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.6">
      <rect x="-24" y="-14" width="48" height="36" />
      <path d="M -3 0 v 16 M -10 8 h 14" />
    </g>
  );
}

function Hut() {
  return (
    <g fill="none" stroke={INK} strokeWidth="1.6">
      <path d="M -26 14 Q 0 -28 26 14 Z" />
      <ellipse cx="0" cy="18" rx="22" ry="7" />
    </g>
  );
}

function Glyph({ kind }: { kind: SketchKind }) {
  switch (kind) {
    case "sun":
      return <Sun />;
    case "solar":
      return <SolarPanel />;
    case "pump":
      return <Pump />;
    case "well":
      return <Well />;
    case "tower":
      return <Tower />;
    case "tank":
      return <GroundTank />;
    case "houses":
      return <Houses />;
    case "school":
      return <School />;
    case "market":
      return <Market />;
    case "clinic":
      return <Clinic />;
    case "hut":
      return <Hut />;
    default:
      return (
        <g fill="none" stroke={INK} strokeWidth="1.6">
          <rect x="-22" y="-16" width="44" height="32" />
        </g>
      );
  }
}

function wrapNote(text: string, width = 28) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function at(figure: SketchFigure) {
  return { x: (figure.x / 100) * W, y: (figure.y / 100) * H };
}

function elbow(x1: number, y1: number, x2: number, y2: number) {
  if (Math.abs(x2 - x1) < 28) return `M ${x1} ${y1} L ${x2} ${y2}`;
  return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;
}

export function SketchPaper({ spec }: { spec: SketchSpec }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sketch-paper" role="img" aria-label={spec.title}>
      <defs>
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0.07 0"
          />
        </filter>
        <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="#f4ead6" />
      <rect width={W} height={H} filter="url(#paper-grain)" />

      <text x={W / 2} y="42" textAnchor="middle" className="sketch-hand-title">
        {spec.title}
      </text>
      {spec.heard && (
        <text x={W / 2} y="68" textAnchor="middle" className="sketch-hand">
          {spec.heard.length > 90 ? `${spec.heard.slice(0, 90)}…` : spec.heard}
        </text>
      )}

      <g filter="url(#pencil)">
        {spec.pipes.map((pipe, index) => {
          const a = spec.figures[pipe.from];
          const b = spec.figures[pipe.to];
          if (!a || !b) return null;
          const p = at(a);
          const q = at(b);
          return <Pipe key={`pipe-${index}`} d={elbow(p.x, p.y, q.x, q.y)} />;
        })}
        {spec.figures.map((figure, index) => {
          const p = at(figure);
          const scale = figure.kind === "houses" || figure.kind === "tower" || figure.kind === "solar" ? 0.42 : 0.5;
          return (
            <g key={`${figure.kind}-${index}`} transform={`translate(${p.x} ${p.y})`}>
              <g transform={`scale(${scale})`}>
                <Glyph kind={figure.kind} />
              </g>
            </g>
          );
        })}
      </g>

      {spec.figures.map((figure, index) => {
        const p = at(figure);
        const n = figure.step ?? index + 1;
        const note = figure.note?.trim();
        return (
          <g key={`label-${index}`} transform={`translate(${p.x} ${p.y})`}>
            <circle cx="-36" cy="-28" r="12" fill="#f4ead6" stroke={INK} strokeWidth="1.2" />
            <text className="sketch-hand" x="-36" y="-23" textAnchor="middle">
              {n}
            </text>
            <text className="sketch-hand" y="36" textAnchor="middle">
              {figure.label}
            </text>
            {note &&
              wrapNote(note).map((line, lineIndex) => (
                <text key={lineIndex} className="sketch-note" y={56 + lineIndex * 18} textAnchor="middle">
                  {line}
                </text>
              ))}
          </g>
        );
      })}
    </svg>
  );
}
