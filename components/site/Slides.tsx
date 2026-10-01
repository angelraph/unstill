"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 6500;

type Slide = { kicker: string; title: string; accent: string; body: string; visual: React.ReactNode };

const SLIDES: Slide[] = [
  {
    kicker: "The Corner · Film and media",
    title: "Rain on a street",
    accent: "that is already running.",
    body: "Press Rain, then Night. The same taxi, the same awning, the same block. Orbis morphs it at the next chunk.",
    visual: (
      <div className="sv sv-morph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stills/corner-dusk.jpg" alt="Orbis frame of The Corner at dusk" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stills/corner-night.jpg" alt="The same corner at night, same session" className="sv-morph-b" />
        <span className="sv-tag mono">Real Orbis frames · one session</span>
      </div>
    ),
  },
  {
    kicker: "Your photograph",
    title: "Any still you bring",
    accent: "becomes the first frame.",
    body: "Cropped to 16:9 in your browser, uploaded, and set as the opening image. Then it starts to move, and you direct it.",
    visual: (
      <div className="sv sv-crop">
        <div className="sv-crop-photo" />
        <div className="sv-crop-box">
          <i />
          <i />
          <i />
          <i />
          <span className="mono">16 : 9</span>
        </div>
        <span className="sv-tag mono">uploadFile → set_image → start</span>
      </div>
    ),
  },
  {
    kicker: "Direction deck",
    title: "Press a control.",
    accent: "Never write a prompt.",
    body: "Each press becomes one physical sentence, written the way Orbis reads best, released on the beat.",
    visual: (
      <div className="sv sv-deck">
        <div className="sv-seg">
          {["Dawn", "Noon", "Dusk", "Night"].map((h) => (
            <span key={h} className={h === "Night" ? "on" : ""}>
              {h}
            </span>
          ))}
        </div>
        <div className="sv-seg">
          {["Clear", "Rain", "Fog", "Snow"].map((h) => (
            <span key={h} className={h === "Rain" ? "on" : ""}>
              {h}
            </span>
          ))}
        </div>
        <p className="sv-prompt mono">
          <span>set_prompt</span> Night falls. The sky deepens to night blue, and the shop signs and street lamps glow
          brightly.
        </p>
      </div>
    ),
  },
  {
    kicker: "Takes",
    title: "Every run is kept.",
    accent: "Every take comes back.",
    body: "Same seed, same prompts, stamped with the chunk they landed on. Replay a take and Orbis returns the same world.",
    visual: (
      <div className="sv sv-code mono">
        <pre>{`{
  "watch": "corner",
  "seed": 30837,
  "beats": [
    { "chunk": 22, "label": "Weather: Rain" },
    { "chunk": 24, "label": "Hour: Night" }
  ]
}`}</pre>
        <span className="sv-replay">Replay take 1</span>
      </div>
    ),
  },
  {
    kicker: "Cue sheets",
    title: "A ninety second film",
    accent: "that directs itself.",
    body: "One click plays a scripted sequence on chunk timing. Rain, night, a cab, handheld, an empty street, a push in.",
    visual: (
      <ol className="sv sv-cue">
        {["Weather: Rain", "Hour: Night", "Cab stops", "Camera: Handheld", "Occupancy: Empty", "Camera: Push in"].map(
          (c, i) => (
            <li key={c} style={{ animationDelay: `${i * 0.7}s` }}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              {c}
            </li>
          ),
        )}
      </ol>
    ),
  },
];

export function Slides() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const touch = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    setCycle((c) => c + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, go, cycle]);

  return (
    <div
      className={`slides ${paused ? "is-paused" : ""}`}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="slides-bars" aria-hidden>
        {SLIDES.map((_, i) => (
          <span key={i} className={i < index ? "done" : i === index ? "now" : ""}>
            <i key={i === index ? cycle : undefined} style={{ animationDuration: `${DURATION}ms` }} />
          </span>
        ))}
      </div>

      <div className="slides-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <article key={s.kicker} className={`slide ${i === index ? "is-on" : ""}`} aria-hidden={i !== index}>
            <div className="slide-copy">
              <p className="kicker mono">{s.kicker}</p>
              <h3>
                {s.title} <span>{s.accent}</span>
              </h3>
              <p>{s.body}</p>
            </div>
            <div className="slide-visual">{s.visual}</div>
          </article>
        ))}
      </div>

      <div className="slides-ctrl">
        <span className="mono slides-count">
          {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
        <button onClick={() => go(index - 1)} aria-label="Previous slide">
          ←
        </button>
        <button onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play slides" : "Pause slides"}>
          {paused ? "▶" : "❚❚"}
        </button>
        <button onClick={() => go(index + 1)} aria-label="Next slide">
          →
        </button>
      </div>
    </div>
  );
}
