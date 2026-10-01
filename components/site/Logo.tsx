// The UNSTILL mark: one photograph turning into frames, ringed by the orbit of a running world.
// Drawn in SVG so it stays sharp from favicon to billboard, and so it can move.

export function LogoMark({ className = "", animate = false, title }: { className?: string; animate?: boolean; title?: string }) {
  return (
    <svg
      className={`logo-mark ${animate ? "logo-animate" : ""} ${className}`}
      viewBox="0 0 120 100"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="unstill-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3a5c" />
          <stop offset="0.45" stopColor="#6b5a78" />
          <stop offset="0.72" stopColor="#e48a3a" />
          <stop offset="0.86" stopColor="#f6c56a" />
          <stop offset="1" stopColor="#1a1410" />
        </linearGradient>
        <linearGradient id="unstill-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f0b24a" />
          <stop offset="0.5" stopColor="#e2a43b" />
          <stop offset="1" stopColor="#c9782a" />
        </linearGradient>
        <clipPath id="unstill-back">
          <rect x="0" y="0" width="120" height="50" />
        </clipPath>
        <clipPath id="unstill-front">
          <rect x="0" y="50" width="120" height="50" />
        </clipPath>
        <clipPath id="unstill-a">
          <path d="M22 20 Q22 17 25 16.6 L48 11 Q52 10.2 52 14 L52 86 Q52 89.8 48 89 L25 83.4 Q22 83 22 80 Z" />
        </clipPath>
      </defs>

      {/* The far half of the orbit sits behind the frames. */}
      <ellipse
        className="logo-ring logo-ring-back"
        cx="56"
        cy="52"
        rx="55"
        ry="13"
        transform="rotate(-10 56 52)"
        clipPath="url(#unstill-back)"
      />

      <g className="logo-frames">
        <g className="logo-frame" style={{ ["--i" as string]: 0 }}>
          <g clipPath="url(#unstill-a)">
            <rect x="20" y="8" width="34" height="84" fill="url(#unstill-sky)" />
            <Skyline x={22} w={30} />
          </g>
          <path
            className="logo-edge"
            d="M22 20 Q22 17 25 16.6 L48 11 Q52 10.2 52 14 L52 86 Q52 89.8 48 89 L25 83.4 Q22 83 22 80 Z"
          />
        </g>
        {[
          { x: 56, w: 11, y: 16, h: 68 },
          { x: 71, w: 8.5, y: 22, h: 56 },
          { x: 83, w: 6, y: 28, h: 44 },
        ].map((f, i) => (
          <g key={f.x} className="logo-frame" style={{ ["--i" as string]: i + 1 }}>
            <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="1.6" fill="url(#unstill-sky)" />
            <rect x={f.x} y={f.y + f.h * 0.72} width={f.w} height={f.h * 0.28} rx="1" fill="#120e0b" opacity="0.85" />
            <rect className="logo-edge" x={f.x} y={f.y} width={f.w} height={f.h} rx="1.6" />
          </g>
        ))}
      </g>

      {/* The near half crosses in front, so the ring reads as going around. */}
      <ellipse
        className="logo-ring logo-ring-front"
        cx="56"
        cy="52"
        rx="55"
        ry="13"
        transform="rotate(-10 56 52)"
        clipPath="url(#unstill-front)"
      />
    </svg>
  );
}

function Skyline({ x, w }: { x: number; w: number }) {
  const s = w / 30;
  const X = (n: number) => x + n * s;
  return (
    <g>
      <path
        fill="#120e0b"
        d={`M${X(0)} 92 L${X(0)} 66 L${X(4)} 66 L${X(4)} 60 L${X(7)} 60 L${X(7)} 70 L${X(10)} 70 L${X(10)} 46 L${X(12)} 42 L${X(14)} 46 L${X(14)} 64 L${X(17)} 64 L${X(17)} 56 L${X(20)} 56 L${X(20)} 68 L${X(23)} 68 L${X(23)} 52 L${X(25)} 50 L${X(27)} 52 L${X(27)} 72 L${X(30)} 72 L${X(30)} 92 Z`}
      />
      {[
        [11, 52],
        [12.5, 58],
        [11, 64],
        [18, 60],
        [24, 57],
        [25.5, 63],
        [2, 70],
        [5, 64],
      ].map(([dx, y], i) => (
        <rect key={i} x={X(dx)} y={y} width={0.9 * s} height="1.1" fill="#f6c56a" opacity="0.9" />
      ))}
    </g>
  );
}

/** Mark and wordmark together. The tagline line is optional and only used where there is room. */
export function Logo({ tagline = false, animate = false, className = "" }: { tagline?: boolean; animate?: boolean; className?: string }) {
  return (
    <span className={`logo ${tagline ? "logo-full" : ""} ${className}`}>
      <LogoMark animate={animate} />
      <span className="logo-type">
        <span className="logo-word">UNSTILL</span>
        {tagline && <span className="logo-tag">The photograph is the first frame.</span>}
      </span>
    </span>
  );
}
