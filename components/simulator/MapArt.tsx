export function Khejri({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity="0.92">
      <ellipse cx="0" cy="10" rx="16" ry="5" fill="#c4a06a" opacity="0.35" />
      <path d="M 0 10 L 0 -6" stroke="#5c3a22" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="-8" cy="-10" rx="12" ry="8" fill="#5f7a3a" />
      <ellipse cx="8" cy="-12" rx="13" ry="9" fill="#6b8a44" />
      <ellipse cx="0" cy="-16" rx="10" ry="7" fill="#7a9a4e" />
    </g>
  );
}

export function Chaunra({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="16" rx="20" ry="7" fill="#c9a06a" opacity="0.45" />
      <ellipse cx="0" cy="10" rx="18" ry="8" fill="#d8b07a" stroke="#8a6238" strokeWidth="1.2" />
      <path d="M -17 8 Q 0 -22 17 8 Z" fill="#6a4a2a" stroke="#3f2a16" strokeWidth="1.2" />
      <path d="M -10 4 Q 0 -14 10 4" fill="none" stroke="#8a6238" strokeWidth="1" />
      <path d="M -3 10 v 8" stroke="#3f2a16" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

export function MudBox({
  x,
  y,
  w,
  h,
  white,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  white?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={white ? "#efe6d4" : "#c4a07a"}
        stroke="#6b4a2a"
        strokeWidth="1.3"
      />
      <rect x={x + w * 0.35} y={y + h * 0.45} width={w * 0.18} height={h * 0.55} fill="#5c3a22" />
    </g>
  );
}

export function RoundTank({ filled }: { filled?: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="16" rx="22" ry="8" fill="#b08958" opacity="0.4" />
      <path d="M -20 -6 v 20 a 20 8 0 0 0 40 0 v -20" fill="#cfc3a8" stroke="#6b5340" strokeWidth="1.8" />
      <ellipse cx="0" cy="-6" rx="20" ry="8" fill={filled ? "#5fa0b3" : "#8a8070"} stroke="#6b5340" />
      <ellipse cx="0" cy="-6" rx="12" ry="4.5" fill={filled ? "#1d6b82" : "#4a453c"} />
    </g>
  );
}

export function StoneWell({ weak }: { weak?: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="12" rx="18" ry="7" fill="#b08958" opacity="0.35" />
      <ellipse cx="0" cy="2" rx="16" ry="9" fill="#cfc3a8" stroke="#6b5340" strokeWidth="2" />
      <ellipse cx="0" cy="2" rx="9" ry="5" fill={weak ? "#5c4a38" : "#1d6b82"} />
      <path d="M -14 -4 h 28" stroke="#6b5340" strokeWidth="3" strokeLinecap="round" />
      <path d="M 0 -4 v -10" stroke="#6b5340" strokeWidth="2" />
    </g>
  );
}

export function Walker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.85">
      <circle cx="0" cy="-10" r="3" fill="#3f2a16" />
      <path d="M 0 -6 L 0 4 L -4 12 M 0 4 L 4 12 M -5 -2 h 8" stroke="#3f2a16" strokeWidth="1.6" fill="none" />
      <ellipse cx="6" cy="4" rx="3" ry="4" fill="#1d6b82" />
    </g>
  );
}

export function Goat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#d9c59a" stroke="#5c3a22" strokeWidth="1">
      <ellipse cx="0" cy="0" rx="8" ry="4" />
      <rect x="5" y="-5" width="4" height="5" rx="1" />
      <path d="M -6 3 v 5 M 2 3 v 5" />
    </g>
  );
}

export function ValveWheel({ live }: { live: boolean }) {
  return (
    <g>
      <circle r="14" fill={live ? "#1d4e63" : "#8a6a3b"} stroke="#3f2a16" strokeWidth="2" />
      <circle r="5" fill={live ? "#7ec8d9" : "#d9c59a"} />
      <path d="M 0 -12 v 24 M -12 0 h 24" stroke="#f3e0c2" strokeWidth="2" />
    </g>
  );
}

export function SolarStill() {
  return (
    <g>
      <path d="M -18 10 L -12 -8 L 16 -2 L 14 12 Z" fill="#8ec4d4" stroke="#3e5360" strokeWidth="1.4" opacity="0.85" />
      <path d="M -12 -8 L 16 -2" stroke="#f5d76e" strokeWidth="2.2" />
      <rect x="-16" y="8" width="10" height="8" rx="1" fill="#5c3a22" />
      <path d="M 8 4 L 18 10" stroke="#1d6b82" strokeWidth="2" />
    </g>
  );
}

export function ElevatedTank() {
  return (
    <g>
      <rect x="-4" y="2" width="8" height="18" fill="#6b5340" />
      <rect x="-16" y="-16" width="32" height="20" fill="#7a9bb0" stroke="#3e5360" strokeWidth="1.5" />
      <path d="M -12 -10 H 12" stroke="#d7eef4" strokeWidth="1.4" />
    </g>
  );
}

export function HouseTaps() {
  return (
    <g>
      <rect x="-4" y="-2" width="8" height="18" fill="#4a4f59" />
      <circle cx="0" cy="-6" r="4" fill="#1d6b82" />
      <path d="M 4 -6 H 12 v 8" fill="none" stroke="#2b6e88" strokeWidth="2.2" />
      <ellipse cx="12" cy="10" rx="5" ry="3" fill="#7ec8d9" opacity="0.7" />
    </g>
  );
}

export function RoKiosk() {
  return (
    <g>
      <rect x="-16" y="-4" width="32" height="18" rx="2" fill="#d6e4ea" stroke="#3e5360" />
      <rect x="-12" y="-14" width="24" height="12" rx="1" fill="#2f4d6a" />
      <rect x="-4" y="0" width="8" height="10" fill="#1d6b82" />
      <circle cx="-8" cy="8" r="3" fill="#7ec8d9" />
      <circle cx="8" cy="8" r="3" fill="#7ec8d9" />
    </g>
  );
}

export function ClayFilter() {
  return (
    <g>
      <ellipse cx="0" cy="12" rx="10" ry="5" fill="#b08958" />
      <path d="M -9 4 Q 0 14 9 4 L 7 -2 Q 0 -8 -7 -2 Z" fill="#c4a07a" stroke="#6b4a2a" />
      <path d="M -6 -6 Q 0 -14 6 -6" fill="#a67c52" stroke="#6b4a2a" />
    </g>
  );
}

export function DemoHouse() {
  return (
    <g>
      <rect x="-16" y="-2" width="32" height="18" fill="#efe6d4" stroke="#6b4a2a" />
      <path d="M -18 0 L 0 -16 L 18 0" fill="#5f7a3a" stroke="#3f2a16" />
      <rect x="6" y="-10" width="12" height="7" fill="#1e3a5f" transform="rotate(-28 12 -6)" />
    </g>
  );
}
