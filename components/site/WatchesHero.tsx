"use client";

import { useState } from "react";

type Item = { id: string; name: string; sector: string; opening: string };

/** A24 style: huge stacked titles, the background follows the title you point at. */
export function WatchesHero({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0].id);

  return (
    <section className="wx" aria-label="Watches">
      {items.map((it) => (
        <div key={it.id} className={`wx-bg ${active === it.id ? "on" : ""}`} aria-hidden>
          {it.id === "corner" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/stills/corner-night.jpg" alt="" />
          ) : (
            <div className={`wx-slate wx-slate-${it.id}`}>
              <p className="mono">{it.opening}</p>
            </div>
          )}
        </div>
      ))}

      <div className="wx-head">
        <div>
          <p className="eyebrow-blue mono">Watches</p>
          <p>Four ways in. Point at a title to see the world it opens.</p>
        </div>
        <p className="mono" style={{ fontSize: 12 }}>
          {items.find((i) => i.id === active)?.sector}
        </p>
      </div>

      <ul className="wx-list">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`wx-item ${active === it.id ? "on" : ""}`}
              onMouseEnter={() => setActive(it.id)}
              onFocus={() => setActive(it.id)}
            >
              {it.name}
              <sup>{String(i + 1).padStart(2, "0")}</sup>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
