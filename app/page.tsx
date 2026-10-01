import Link from "next/link";

import { compileOpening, compileShift } from "@/lib/compiler";
import { WATCHES } from "@/lib/watches";

import "./brief.css";

const corner = WATCHES[0];

const steps = [
  {
    n: "01",
    title: "Lock a Watch",
    body: "Choose a place: a city corner, a flagship store, a warehouse floor. Or bring your own photograph and Orbis opens on that exact frame.",
  },
  {
    n: "02",
    title: "Roll",
    body: "UNSTILL builds the world once, in a single opening prompt, and Orbis starts streaming it live over WebRTC.",
  },
  {
    n: "03",
    title: "Direct",
    body: "Change the hour, the weather, the crowd, the camera, or fire one event. The running world changes at the next chunk boundary. Nothing restarts.",
  },
  {
    n: "04",
    title: "Keep the take",
    body: "Every run is logged as a take: seed, opening and every beat stamped with its chunk. Replay it and Orbis gives you the same world back.",
  },
];

const mechanics = [
  {
    title: "Continuity compiler",
    body: "Directives become prompts written the way Orbis reads them. The opening describes the whole world. Every prompt after it describes one visible change, in physical nouns and verbs, never a negation.",
  },
  {
    title: "Chunk gated release",
    body: "Orbis morphs at chunk boundaries. UNSTILL listens for every completed chunk and releases at most one directive per settle window, so changes land cleanly instead of fighting each other.",
  },
  {
    title: "Reproducible takes",
    body: "Same seed and same prompt sequence produce the same video. Takes store both, export as a small JSON file and replay on any machine.",
  },
  {
    title: "Photo anchoring",
    body: "Your photograph is cropped to 16:9 in the browser, uploaded, and set as the first frame before the opening prompt. The still becomes a place you can direct.",
  },
];

export default function Brief() {
  const opening = compileOpening(corner, corner.initial);
  const rain = compileShift("weather", "rain", corner.nouns);
  const night = compileShift("hour", "night", corner.nouns);

  return (
    <div className="brief">
      <header className="brief-nav">
        <span className="brief-mark">UNSTILL</span>
        <nav>
          <a href="#how">How it works</a>
          <a href="#watches">Watches</a>
          <a href="#mechanics">Under the hood</a>
          <Link href="/studio" className="brief-cta-small">
            Open the studio
          </Link>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">A live direction deck for places · Built on Visko Orbis</p>
        <h1>
          The photograph is
          <br />
          <em>the first frame.</em>
        </h1>
        <div className="hero-foot">
          <p className="lede">
            UNSTILL lets you direct a real place while it runs. Lock a location, then change the hour, the weather,
            the crowd and the camera. Orbis carries every change into the live picture at the next chunk, without a cut.
          </p>
          <div className="hero-actions">
            <Link href="/studio" className="brief-cta">
              Open the studio
            </Link>
            <a href="#how" className="brief-link">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section className="contrast">
        <div>
          <p className="kicker">A clip</p>
          <p className="contrast-line">is finished the moment it renders. To make it rain, you render another one.</p>
        </div>
        <div>
          <p className="kicker">A place</p>
          <p className="contrast-line">keeps running. In UNSTILL you make it rain on the street that is already there.</p>
        </div>
      </section>

      <section id="how" className="block">
        <h2 className="block-title">How it works</h2>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="watches" className="block">
        <h2 className="block-title">Three Watches, one instrument</h2>
        <div className="watch-cards">
          {WATCHES.map((w, i) => (
            <article key={w.id} className="watch-card">
              <p className="kicker">
                {String(i + 1).padStart(2, "0")} · {w.sector}
              </p>
              <h3>{w.name}</h3>
              <p>{w.logline}</p>
              <ul>
                {w.events.map((e) => (
                  <li key={e.id}>{e.label}</li>
                ))}
              </ul>
            </article>
          ))}
          <article className="watch-card watch-card-photo">
            <p className="kicker">04 · Anyone</p>
            <h3>Your photograph</h3>
            <p>Upload a still of any place you know. It becomes the first frame, then it becomes a place you can direct.</p>
          </article>
        </div>
      </section>

      <section className="block transcript">
        <h2 className="block-title">What Orbis actually receives</h2>
        <p className="block-lede">
          You never write a video prompt. You press Rain. This is the exact text the studio sends for The Corner.
        </p>
        <div className="script">
          <div className="script-row">
            <span className="script-tag">Opening</span>
            <p>{opening}</p>
          </div>
          <div className="script-row">
            <span className="script-tag">Weather: Rain</span>
            <p>{rain}</p>
          </div>
          <div className="script-row">
            <span className="script-tag">Hour: Night</span>
            <p>{night}</p>
          </div>
        </div>
      </section>

      <section id="mechanics" className="block">
        <h2 className="block-title">Under the hood</h2>
        <div className="mechanics">
          {mechanics.map((m) => (
            <div key={m.title}>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closing">
        <h2>
          Stop rendering clips.
          <br />
          <em>Start keeping watch.</em>
        </h2>
        <Link href="/studio" className="brief-cta brief-cta-dark">
          Open the studio
        </Link>
      </section>

      <footer className="brief-foot">
        <span>UNSTILL</span>
        <span>Live picture by Visko Orbis Stable, streamed through Reactor. Made for the Visko Orbis Online Challenge, 2026.</span>
      </footer>
    </div>
  );
}
