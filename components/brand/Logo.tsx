import { useId } from "react";

/**
 * UNSTILL mark: a photograph splitting into receding frames, circled by an amber orbit.
 * The orbit passes behind the frames on top and in front of them below.
 */
export function LogoMark({ size = 40, animated = false, photo = true }: { size?: number; animated?: boolean; photo?: boolean }) {
  const id = useId().replace(/:/g, "");
  const frames = [
    { x: 30, y: 6, w: 26, h: 68, r: 4 },
    { x: 60, y: 12, w: 9, h: 56, r: 2.5 },
    { x: 72, y: 17, w: 6, h: 46, r: 2 },
    { x: 81, y: 21, w: 4, h: 38, r: 1.5 },
  ];
  return (
    <svg
      width={size * 1.5}
      height={size}
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden
      className={`logo-mark ${animated ? "logo-animated" : ""}`}
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6b24a" />
          <stop offset="1" stopColor="#d9822b" />
        </linearGradient>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d5a80" />
          <stop offset="0.55" stopColor="#f2a65a" />
          <stop offset="1" stopColor="#1b1410" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          {frames.map((f, i) => (
            <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} rx={f.r} />
          ))}
        </clipPath>
      </defs>

      <g transform="rotate(-12 58 44)">
        <ellipse cx="58" cy="44" rx="54" ry="13" stroke={`url(#${id}g)`} strokeWidth="3" opacity="0.55" />
      </g>

      <g clipPath={`url(#${id}c)`}>
        <rect x="28" y="4" width="60" height="72" fill={`url(#${id}sky)`} />
        {photo && (
          <image href="/stills/corner-dusk.jpg" x="20" y="4" width="72" height="72" preserveAspectRatio="xMidYMid slice" />
        )}
      </g>
      {frames.map((f, i) => (
        <rect
          key={i}
          className="logo-frame"
          style={{ animationDelay: `${i * 0.12}s` }}
          x={f.x}
          y={f.y}
          width={f.w}
          height={f.h}
          rx={f.r}
          stroke={`url(#${id}g)`}
          strokeWidth={i === 0 ? 1.8 : 1.4}
        />
      ))}

      <g transform="rotate(-12 58 44)">
        <path className="logo-orbit" d="M4 44 A54 13 0 0 0 112 44" stroke={`url(#${id}g)`} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Logo({
  size = 28,
  tagline = false,
  animated = false,
}: {
  size?: number;
  tagline?: boolean;
  animated?: boolean;
}) {
  return (
    <span className="logo">
      <LogoMark size={size} animated={animated} />
      <span className="logo-text">
        <span className="logo-word" style={{ fontSize: size * 0.82 }}>
          UNSTILL
        </span>
        {tagline && <span className="logo-tag">The photograph is the first frame.</span>}
      </span>
    </span>
  );
}
