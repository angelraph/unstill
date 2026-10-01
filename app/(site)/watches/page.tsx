import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/site/Reveal";
import { WatchPreview } from "@/components/site/WatchPreview";
import { AXES, AXIS_ORDER, WATCHES, optionFor } from "@/lib/watches";

import "./watches.css";

export const metadata: Metadata = {
  title: "Watches",
  description: "The Corner, The Aisle and The Bay: three locked places for film, retail and robotics. Or bring your own photograph.",
};

export default function WatchesPage() {
  return (
    <div className="page-paper">
      <header className="page-head wrap">
        <p className="eyebrow">The Watches</p>
        <div className="page-head-row">
          <h1 className="display">
            Pick a place.
            <br />
            <em>Then keep watch.</em>
          </h1>
          <p className="lede">
            A Watch is a locked world: one setting, its own nouns, four events and a cue sheet. The place stays put. You
            change everything that happens to it. Try the controls on each one below. These are drawn previews. The studio
            streams the real thing.
          </p>
        </div>
        <nav className="reel-index" aria-label="Watches on this page">
          {WATCHES.map((w, i) => (
            <a key={w.id} href={`#${w.id}`}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              {w.name}
            </a>
          ))}
          <a href="#photo">
            <span className="mono">04</span>
            Your photograph
          </a>
        </nav>
      </header>

      {WATCHES.map((w, i) => (
        <section key={w.id} id={w.id} className="reel wrap">
          <Reveal className="reel-head">
            <span className="reel-n serif">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="eyebrow">{w.sector}</p>
              <h2 className="title">{w.name}</h2>
            </div>
            <p className="reel-logline">{w.logline}</p>
          </Reveal>

          <div className="reel-body">
            <Reveal>
              <WatchPreview watchId={w.id} initial={w.initial} />
            </Reveal>

            <Reveal className="reel-credits" delay={120}>
              <div>
                <p className="credit-title mono">Opens on</p>
                <p className="credit-text">
                  {AXIS_ORDER.map((a) => optionFor(a, w.initial[a]).label).join(" · ")}
                </p>
              </div>
              <div>
                <p className="credit-title mono">Events</p>
                <ul className="credit-list">
                  {w.events.map((e, k) => (
                    <li key={e.id}>
                      <span>{e.label}</span>
                      <kbd className="mono">{5 + k}</kbd>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="credit-title mono">Cue sheet · {w.cue.title}</p>
                <ol className="credit-cue">
                  {w.cue.steps.map((step, k) => (
                    <li key={k}>
                      <span className="mono">{String(k + 1).padStart(2, "0")}</span>
                      <span>
                        {step.kind === "axis"
                          ? `${AXES[step.axis].label}: ${optionFor(step.axis, step.value).label}`
                          : w.events.find((e) => e.id === step.id)?.label}
                      </span>
                      <span className="mono credit-hold">hold {step.hold}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <Link href="/studio" className="btn-pill reel-cta">
                Direct {w.name} live
              </Link>
            </Reveal>
          </div>
        </section>
      ))}

      <section id="photo" className="reel reel-photo wrap">
        <Reveal className="reel-head">
          <span className="reel-n serif">04</span>
          <div>
            <p className="eyebrow">Anyone</p>
            <h2 className="title">Your photograph</h2>
          </div>
          <p className="reel-logline">Any place you have stood becomes a place you can direct.</p>
        </Reveal>
        <div className="photo-steps">
          {[
            ["Drop it on the frame", "Any image works. The studio crops it to 16:9 in your browser so Orbis never squashes it."],
            ["Say what is in it", "One plain line, like a quiet harbor at low tide. It becomes the subject of the opening prompt."],
            ["Roll", "Orbis opens on that exact frame, then every change you make lands on your place, not a new one."],
          ].map(([t, b], k) => (
            <Reveal key={t} className="photo-step" delay={k * 100}>
              <span className="mono">{String(k + 1).padStart(2, "0")}</span>
              <h3 className="serif">{t}</h3>
              <p>{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-intro">
          <p className="eyebrow">The vocabulary</p>
          <h2 className="title">
            Seventeen controls.
            <br />
            <em>Every one on a key.</em>
          </h2>
        </div>
        <div className="vocab">
          {AXIS_ORDER.map((axis) => (
            <div key={axis} className="vocab-row">
              <p className="vocab-axis serif">{AXES[axis].label}</p>
              <ul>
                {AXES[axis].options.map((o) => (
                  <li key={o.value}>
                    <kbd className="mono">{o.key.toUpperCase()}</kbd>
                    {o.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
