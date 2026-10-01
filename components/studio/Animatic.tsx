"use client";

import type { WorldState } from "@/lib/watches";

/**
 * A cheap rehearsal of the shot before any GPU is spent. Hour, weather, crowd and
 * camera all read on it, so the director can block the take, then Roll for real.
 * It never pretends to be Orbis: the slug in the corner says what it is.
 */
export function Animatic({ watchId, world, photoUrl }: { watchId: string | null; world: WorldState; photoUrl?: string | null }) {
  return (
    <div
      className="animatic"
      data-hour={world.hour}
      data-weather={world.weather}
      data-crowd={world.crowd}
      data-camera={world.camera}
      aria-hidden
    >
      <div className="anim-scene">
        {photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" className="anim-photo" />
            {/* A photo has no palette to swap, so the hour is laid over it as a grade. */}
            <div className="anim-grade" />
          </>
        ) : (
          <>
            <div className="anim-sky" />
            <Set watchId={watchId} />
          </>
        )}
        <Walkers crowd={world.crowd} />
        <div className="anim-weather" />
      </div>
      <span className="anim-slug mono">
        Animatic<span className="anim-slug-more"> · rehearse here, Roll to generate</span>
      </span>
    </div>
  );
}

const WALKERS = { empty: 0, sparse: 3, busy: 11 } as const;

function Walkers({ crowd }: { crowd: WorldState["crowd"] }) {
  const count = WALKERS[crowd];
  return (
    <div className="anim-walkers">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="walker"
          style={
            {
              "--lane": `${(i * 37) % 9}%`,
              "--dur": `${14 + ((i * 7) % 11)}s`,
              "--delay": `${-((i * 5.3) % 20)}s`,
              "--way": i % 2 ? "reverse" : "normal",
              "--h": `${15 + ((i * 3) % 5)}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** A silhouette of each Watch: enough to read the place, nothing that competes with Orbis. */
function Set({ watchId }: { watchId: string | null }) {
  if (watchId === "aisle") {
    return (
      <svg className="anim-set interior" viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice">
        <rect className="wall" x="0" y="0" width="160" height="70" />
        <rect className="sky-cut" x="20" y="6" width="120" height="10" />
        {[30, 55, 80, 105, 130].map((x) => (
          <circle key={x} className="lit" cx={x} cy="22" r="1.6" />
        ))}
        <rect className="mass" x="6" y="34" width="42" height="36" />
        <rect className="mass" x="112" y="34" width="42" height="36" />
        {[40, 48, 56, 64].map((y) => (
          <g key={y}>
            <rect className="edge" x="6" y={y} width="42" height="0.8" />
            <rect className="edge" x="112" y={y} width="42" height="0.8" />
          </g>
        ))}
        <rect className="mass" x="66" y="50" width="28" height="20" />
        <rect className="lit soft" x="72" y="44" width="16" height="6" />
        <rect className="ground" x="0" y="70" width="160" height="20" />
      </svg>
    );
  }
  if (watchId === "bay") {
    return (
      <svg className="anim-set interior" viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice">
        <rect className="wall" x="0" y="0" width="160" height="70" />
        <rect className="sky-cut" x="10" y="4" width="140" height="8" />
        {[24, 56, 88, 120, 140].map((x) => (
          <rect key={x} className="lit" x={x} y="16" width="10" height="1.4" />
        ))}
        {[8, 52, 96].map((x) => (
          <g key={x}>
            <rect className="edge" x={x} y="24" width="1.2" height="46" />
            <rect className="edge" x={x + 46} y="24" width="1.2" height="46" />
            {[34, 48, 62].map((y) => (
              <rect key={y} className="edge" x={x} y={y} width="47" height="1" />
            ))}
            <rect className="mass" x={x + 4} y="27" width="16" height="7" />
            <rect className="mass" x={x + 24} y="41" width="18" height="7" />
            <rect className="mass" x={x + 8} y="55" width="14" height="7" />
          </g>
        ))}
        <rect className="ground" x="0" y="70" width="160" height="20" />
        <rect className="stripe" x="0" y="78" width="160" height="0.8" />
      </svg>
    );
  }
  // The Corner, and the fallback for anything without its own set.
  return (
    <svg className="anim-set" viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice">
      <rect className="mass" x="0" y="14" width="58" height="56" />
      <rect className="mass far" x="58" y="30" width="34" height="40" />
      <rect className="mass" x="92" y="22" width="68" height="48" />
      {[20, 30, 40, 50].map((y) =>
        [6, 16, 26, 36, 46, 98, 110, 122, 134, 146].map((x) => (
          <rect key={`${x}-${y}`} className={`lit win ${(x + y) % 3 ? "" : "off"}`} x={x} y={y} width="5" height="5" />
        )),
      )}
      <rect className="awning" x="98" y="58" width="30" height="3" />
      <rect className="lit soft" x="100" y="61" width="26" height="9" />
      <rect className="edge" x="70" y="46" width="0.8" height="24" />
      <circle className="lit" cx="70.4" cy="45.5" r="1.6" />
      <rect className="ground" x="0" y="70" width="160" height="20" />
      <rect className="stripe" x="20" y="80" width="10" height="1.2" />
      <rect className="stripe" x="40" y="80" width="10" height="1.2" />
      <rect className="stripe" x="60" y="80" width="10" height="1.2" />
      <rect className="taxi" x="128" y="66" width="18" height="5" rx="1" />
    </svg>
  );
}
