"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Animatic } from "@/components/studio/Animatic";
import type { WorldState } from "@/lib/watches";

// Three Watches, each held long enough to read, then dissolved into the next.
const REELS: { id: string; name: string; sector: string; world: WorldState; line: string }[] = [
  {
    id: "corner",
    name: "The Corner",
    sector: "Film and media",
    world: { hour: "night", weather: "rain", crowd: "sparse", camera: "push" },
    line: "Weather: Rain · Hour: Night",
  },
  {
    id: "aisle",
    name: "The Aisle",
    sector: "Retail",
    world: { hour: "dusk", weather: "clear", crowd: "busy", camera: "pan" },
    line: "Occupancy: Busy · Camera: Pan",
  },
  {
    id: "bay",
    name: "The Bay",
    sector: "Robotics and training",
    world: { hour: "dawn", weather: "fog", crowd: "sparse", camera: "handheld" },
    line: "Weather: Fog · Camera: Handheld",
  },
];

const HOLD_MS = 6500;

export function HeroReel() {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % REELS.length);
      setCycle((c) => c + 1);
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [index, cycle]);

  const reel = REELS[index];

  return (
    <section className="hero" aria-label="UNSTILL">
      <div className="hero-reel" aria-hidden>
        {REELS.map((r, i) => (
          <div key={r.id} className={`hero-shot ${i === index ? "on" : ""}`}>
            <Animatic watchId={r.id} world={r.world} slug={false} />
          </div>
        ))}
        <div className="hero-vignette" />
        <div className="hero-grain" />
      </div>

      <div className="hero-body wrap">
        <p className="eyebrow hero-eyebrow">A live direction deck for places · Built on Visko Orbis</p>
        <h1 className="display hero-title">
          <span className="rise" style={{ animationDelay: "80ms" }}>
            The photograph
          </span>
          <span className="rise" style={{ animationDelay: "200ms" }}>
            is <em className="glow">the first frame.</em>
          </span>
        </h1>
        <div className="hero-foot rise" style={{ animationDelay: "420ms" }}>
          <p className="lede">
            Lock a place. Then change the hour, the weather, the crowd and the camera while the world keeps running.
            Orbis carries every change into the live picture at the next chunk. No cuts.
          </p>
          <div className="hero-actions">
            <Link href="/studio" className="btn-pill btn-pill-light">
              Open the studio
            </Link>
            <Link href="/how-it-works" className="btn-pill btn-pill-ghost hero-ghost">
              How it works
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-slate wrap">
        <div className="hero-slate-now" key={reel.id}>
          <span className="mono hero-slate-sector">{reel.sector}</span>
          <span className="serif hero-slate-name">{reel.name}</span>
          <span className="mono hero-slate-line">{reel.line}</span>
        </div>
        <div className="hero-index" role="tablist" aria-label="Watches">
          {REELS.map((r, i) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={i === index}
              aria-label={r.name}
              className={i === index ? "on" : ""}
              onClick={() => {
                setIndex(i);
                setCycle((c) => c + 1);
              }}
            >
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="hero-bar">
                {i === index && <span className="hero-fill" key={cycle} style={{ animationDuration: `${HOLD_MS}ms` }} />}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
