// Three real frames from one Orbis session (seed 30837), laid out like an edit timeline.

const FRAMES = [
  { src: "/stills/corner-dusk.jpg", chunk: 16, label: "Opening", note: "Dusk, dry street" },
  { src: "/stills/corner-morph.jpg", chunk: 29, label: "Mid morph", note: "Night arriving over the same block" },
  { src: "/stills/corner-night.jpg", chunk: 39, label: "Settled", note: "After Rain and Night, same corner" },
];

const TOTAL = 40;
const BEATS = [
  { chunk: 0, label: "Opening" },
  { chunk: 22, label: "Rain" },
  { chunk: 24, label: "Night" },
];

export function Filmstrip() {
  return (
    <figure className="strip">
      <div className="strip-frames">
        {FRAMES.map((f) => (
          <div key={f.src} className="strip-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt={`Orbis frame at chunk ${f.chunk}: ${f.note}`} loading="lazy" />
            <span className="strip-tc mono">CH {String(f.chunk).padStart(3, "0")}</span>
            <figcaption>
              <strong>{f.label}</strong>
              <span>{f.note}</span>
            </figcaption>
          </div>
        ))}
      </div>
      <div className="timeline" aria-hidden>
        <div className="timeline-ticks">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span key={i} className={i % 5 === 0 ? "major" : ""} />
          ))}
        </div>
        {BEATS.map((b) => (
          <span key={b.label} className="timeline-beat mono" style={{ left: `${(b.chunk / TOTAL) * 100}%` }}>
            {b.label}
          </span>
        ))}
        <span className="playhead" />
      </div>
      <p className="strip-note mono">One session · seed 30837 · 1.8 s per chunk · no cuts, no re-renders</p>
    </figure>
  );
}
