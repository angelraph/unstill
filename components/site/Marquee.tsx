const WORDS = [
  "Dawn",
  "Rain begins",
  "Night falls",
  "Fog rolls in",
  "Snow settles",
  "The street empties",
  "A cab pulls up",
  "Handheld",
  "Slow push in",
  "Crane overhead",
  "Spotlight on",
  "A forklift crosses",
];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((w, i) => (
          <span key={i}>
            {w}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}
