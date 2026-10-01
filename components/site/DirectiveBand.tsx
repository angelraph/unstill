// Two rows of real directives drifting in opposite directions, like a ticker on a stage door.

const TOP = [
  "Rain begins to fall",
  "Night falls",
  "A cab stops at the curb",
  "The camera goes handheld",
  "The street empties",
  "Push in toward the door",
  "Steam rises from a grate",
];

const BOTTOM = [
  "A forklift crosses the aisle",
  "Fog rolls in",
  "A spotlight finds the display",
  "The robot detours",
  "Snow settles on the shelf edge",
  "The launch line forms",
  "Dawn rakes the floor",
];

export function DirectiveBand() {
  return (
    <section className="band" aria-label="Directives you can give">
      <Row items={TOP} />
      <Row items={BOTTOM} reverse />
    </section>
  );
}

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const run = [...items, ...items];
  return (
    <div className={`band-row ${reverse ? "band-reverse" : ""}`}>
      <div className="band-track">
        {run.map((text, i) => (
          <span key={i} className="band-item" aria-hidden={i >= items.length}>
            <span className="serif">{text}</span>
            <span className="band-sep mono">Ch {String(4 + ((i * 5) % 60)).padStart(3, "0")}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
