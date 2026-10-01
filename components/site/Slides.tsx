"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Animatic } from "@/components/studio/Animatic";
import type { WorldState } from "@/lib/watches";

export type Slide = {
  id: string;
  watchId: string | null;
  kicker: string;
  title: string;
  body: string;
  world: WorldState;
  href: string;
};

const HOLD_MS = 5200;

/** Auto advancing highlights. Pauses on hover, on focus, and when the user asks it to. */
export function Slides({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [cycle, setCycle] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const running = playing && !hover;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
      setCycle((c) => c + 1);
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [running, index, cycle, slides.length]);

  useEffect(() => {
    const el = track.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, [index]);

  const go = (i: number) => {
    setIndex((i + slides.length) % slides.length);
    setCycle((c) => c + 1);
  };

  return (
    <div className="slides" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="slides-track" ref={track}>
        {slides.map((s, i) => (
          <Link
            key={s.id}
            href={s.href}
            className={`slide ${i === index ? "on" : ""}`}
            onFocus={() => setIndex(i)}
            aria-label={`${s.title}. ${s.body}`}
          >
            <div className="slide-art" aria-hidden>
              {s.watchId ? (
                <Animatic watchId={s.watchId} world={s.world} slug={false} />
              ) : (
                <div className="slide-photo">
                  <span className="serif">Your still</span>
                </div>
              )}
            </div>
            <div className="slide-copy">
              <p className="eyebrow">{s.kicker}</p>
              <h3 className="slide-title serif">{s.title}</h3>
              <p className="slide-body">{s.body}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="slides-controls">
        <div className="slides-dots" role="tablist" aria-label="Slides">
          {slides.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={i === index} aria-label={s.title} onClick={() => go(i)}>
              <span className="slides-dot">
                {i === index && (
                  <span
                    key={cycle}
                    className="slides-dot-fill"
                    style={{ animationDuration: `${HOLD_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="slides-buttons">
          <button onClick={() => go(index - 1)} aria-label="Previous">
            ←
          </button>
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause slides" : "Play slides"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <button onClick={() => go(index + 1)} aria-label="Next">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
