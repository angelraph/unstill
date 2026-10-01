"use client";

import { useEffect, useRef, useState } from "react";

import { Animatic } from "@/components/studio/Animatic";
import type { WorldState } from "@/lib/watches";

export type ReviewBeat = { chunk: number; label: string; prompt: string; world: WorldState; kind: "opening" | "axis" | "event" };

const CHUNK_MS = 420;

/** A review player in the Frame.io manner: picture, a track of markers, and timecoded notes that follow the playhead. */
export function ReviewTimeline({ beats, length }: { beats: ReviewBeat[]; length: number }) {
  const [chunk, setChunk] = useState(0);
  const [playing, setPlaying] = useState(true);
  const notes = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setChunk((c) => (c + 1 > length ? 0 : c + 1)), CHUNK_MS);
    return () => clearInterval(timer);
  }, [playing, length]);

  let active = 0;
  beats.forEach((b, i) => {
    if (b.chunk <= chunk) active = i;
  });
  const beat = beats[active];

  useEffect(() => {
    const list = notes.current;
    const item = list?.children[active] as HTMLElement | undefined;
    if (list && item) list.scrollTo({ top: item.offsetTop - list.offsetTop - 8, behavior: "smooth" });
  }, [active]);

  const seek = (c: number) => setChunk(Math.max(0, Math.min(length, c)));

  return (
    <div className="review">
      <div className="review-player">
        <div className="review-frame">
          <Animatic watchId="corner" world={beat.world} slug={false} />
          <div className="review-caption" key={active}>
            <span className="mono">Ch {String(beat.chunk).padStart(3, "0")}</span>
            {beat.label}
          </div>
        </div>

        <div className="review-bar">
          <button className="review-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <span className="mono review-time">
            {String(chunk).padStart(3, "0")} <span>/ {String(length).padStart(3, "0")}</span>
          </span>
          <div
            className="review-track"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek(Math.round(((e.clientX - r.left) / r.width) * length));
            }}
          >
            <div className="review-lane">
              {beats.map((b, i) => (
                <button
                  key={i}
                  className={`review-marker review-${b.kind} ${i === active ? "on" : ""}`}
                  style={{ left: `${(b.chunk / length) * 100}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    seek(b.chunk);
                  }}
                  aria-label={`Jump to ${b.label}`}
                />
              ))}
            </div>
            <div className="review-ticks" />
            <span className="review-head" style={{ left: `${(chunk / length) * 100}%` }} />
          </div>
        </div>
      </div>

      <aside className="review-notes">
        <header>
          <span className="mono">Watch log</span>
          <span className="mono review-count">{beats.length} prompts</span>
        </header>
        <ol ref={notes}>
          {beats.map((b, i) => (
            <li key={i} className={i === active ? "on" : i < active ? "past" : ""}>
              <button onClick={() => seek(b.chunk)}>
                <span className="review-stamp mono">Ch {String(b.chunk).padStart(3, "0")}</span>
                <span className="review-label">{b.label}</span>
                <span className="review-prompt">{b.prompt}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
