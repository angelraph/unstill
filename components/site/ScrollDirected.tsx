"use client";

import { useEffect, useRef, useState } from "react";

import { Animatic } from "@/components/studio/Animatic";
import type { WorldState } from "@/lib/watches";

// The Corner's cue sheet, played by the reader's scroll instead of by the clock.
const BEATS: { chunk: number; label: string; line: string; world: WorldState }[] = [
  {
    chunk: 0,
    label: "Opening",
    line: "A corner at dusk. Dry street, a few people, the cab at the curb.",
    world: { hour: "dusk", weather: "clear", crowd: "sparse", camera: "static" },
  },
  {
    chunk: 4,
    label: "Weather: Rain",
    line: "Press Rain. It rains on the street that is already there.",
    world: { hour: "dusk", weather: "rain", crowd: "sparse", camera: "static" },
  },
  {
    chunk: 9,
    label: "Hour: Night",
    line: "Press Night. The light falls and every window comes on.",
    world: { hour: "night", weather: "rain", crowd: "sparse", camera: "static" },
  },
  {
    chunk: 15,
    label: "Camera: Handheld",
    line: "Go handheld. The same block, now breathing.",
    world: { hour: "night", weather: "rain", crowd: "sparse", camera: "handheld" },
  },
  {
    chunk: 21,
    label: "Occupancy: Empty",
    line: "Empty it. One by one they walk out of frame.",
    world: { hour: "night", weather: "rain", crowd: "empty", camera: "handheld" },
  },
  {
    chunk: 27,
    label: "Camera: Push in",
    line: "Push in toward the bodega door. One take. Not one cut.",
    world: { hour: "night", weather: "rain", crowd: "empty", camera: "push" },
  },
];

const LAST_CHUNK = 32;

export function ScrollDirected() {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = root.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(1, travel))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const index = Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length));
  const beat = BEATS[index];
  const chunk = Math.round(progress * LAST_CHUNK);

  return (
    <section ref={root} className="directed" style={{ height: `${BEATS.length * 85 + 40}vh` }} aria-label="Direct The Corner">
      <div className="directed-pin">
        <div className="directed-grid wrap">
          <div className="directed-copy">
            <p className="eyebrow">Scroll to direct · The Corner</p>
            <ol className="directed-beats">
              {BEATS.map((b, i) => (
                <li key={b.label} className={i === index ? "on" : i < index ? "past" : ""}>
                  <span className="mono directed-chunk">Ch {String(b.chunk).padStart(3, "0")}</span>
                  <span className="directed-label">{b.label}</span>
                  <p className="directed-line">{b.line}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="directed-stage">
            <div className="directed-frame">
              <Animatic watchId="corner" world={beat.world} slug={false} />
              <div className="directed-caption" key={beat.label}>
                <span className="mono">Ch {String(beat.chunk).padStart(3, "0")}</span>
                {beat.label}
              </div>
              <span className="directed-live mono">
                <span aria-hidden />
                Live
              </span>
            </div>
            <div className="playhead" aria-hidden>
              <div className="playhead-track">
                {BEATS.map((b) => (
                  <span
                    key={b.label}
                    className={`playhead-marker ${b.chunk <= chunk ? "hit" : ""}`}
                    style={{ left: `${(b.chunk / LAST_CHUNK) * 100}%` }}
                  />
                ))}
                <span className="playhead-fill" style={{ width: `${progress * 100}%` }} />
                <span className="playhead-head" style={{ left: `${progress * 100}%` }} />
              </div>
              <div className="playhead-meta mono">
                <span>Chunk {String(chunk).padStart(3, "0")}</span>
                <span>Seed 13664 · Take 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
