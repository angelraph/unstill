import Link from "next/link";

import { DirectiveBand } from "@/components/site/DirectiveBand";
import { HeroReel } from "@/components/site/HeroReel";
import { Reveal } from "@/components/site/Reveal";
import { ScrollDirected } from "@/components/site/ScrollDirected";
import { Slides, type Slide } from "@/components/site/Slides";
import { WATCHES } from "@/lib/watches";

import "./home.css";

const SLIDES: Slide[] = [
  ...WATCHES.map((w, i) => ({
    id: w.id,
    watchId: w.id,
    kicker: `${String(i + 1).padStart(2, "0")} · ${w.sector}`,
    title: w.name,
    body: w.logline,
    world: w.cue.steps.reduce(
      (state, step) => (step.kind === "axis" ? { ...state, [step.axis]: step.value } : state),
      w.initial,
    ),
    href: `/watches#${w.id}`,
  })),
  {
    id: "photo",
    watchId: null,
    kicker: "04 · Anyone",
    title: "Your photograph",
    body: "Any place you have stood. Orbis opens on that exact frame, then you direct it.",
    world: { hour: "dusk", weather: "clear", crowd: "sparse", camera: "static" },
    href: "/watches#photo",
  },
];

const ROUTES = [
  {
    href: "/how-it-works",
    kicker: "Under the hood",
    title: "How it works",
    body: "The continuity compiler, chunk gated release, and takes that replay beat for beat.",
  },
  {
    href: "/docs",
    kicker: "Reference",
    title: "Docs",
    body: "Quickstart, every control and key, the take file format, and the exact Orbis command flow.",
  },
  {
    href: "/faq",
    kicker: "Questions",
    title: "FAQ",
    body: "Credits, privacy, photos, replays, and why this only works with a live model.",
  },
];

export default function Home() {
  return (
    <>
      <HeroReel />
      <DirectiveBand />

      <section className="contrast page-paper">
        <div className="wrap contrast-grid">
          <Reveal className="contrast-cell">
            <p className="eyebrow">A clip</p>
            <p className="contrast-line serif">
              is finished the moment it renders. To make it rain, you render another one, and you get another street.
            </p>
          </Reveal>
          <Reveal className="contrast-cell" delay={140}>
            <p className="eyebrow">A place</p>
            <p className="contrast-line serif">
              keeps running. In UNSTILL you make it rain on <em>the street that is already there.</em>
            </p>
          </Reveal>
        </div>
      </section>

      <ScrollDirected />

      <section className="section">
        <div className="wrap">
          <Reveal className="specs">
            <div>
              <span className="spec-figure">
                0<span className="spec-unit">cuts</span>
              </span>
              <p className="spec-label">From the first frame to the last. Every change lands on the running stream.</p>
            </div>
            <div>
              <span className="spec-figure">
                2<span className="spec-unit">chunks</span>
              </span>
              <p className="spec-label">Settle window between directives, so morphs land clean instead of colliding.</p>
            </div>
            <div>
              <span className="spec-figure">
                17<span className="spec-unit">controls</span>
              </span>
              <p className="spec-label">Hour, weather, occupancy and camera, every one on a single key.</p>
            </div>
            <div>
              <span className="spec-figure">
                1<span className="spec-unit">seed</span>
              </span>
              <p className="spec-label">Per take. Same seed and same beats give you the same world back.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-slides">
        <div className="wrap">
          <div className="section-intro">
            <p className="eyebrow">The Watches</p>
            <h2 className="title">
              Three places.
              <br />
              <em>One instrument.</em>
            </h2>
          </div>
        </div>
        <div className="wrap wrap-bleed">
          <Slides slides={SLIDES} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="routes">
            {ROUTES.map((r, i) => (
              <Reveal key={r.href} delay={i * 100}>
                <Link href={r.href} className="route">
                  <span className="mono route-n">{String(i + 1).padStart(2, "0")}</span>
                  <p className="eyebrow">{r.kicker}</p>
                  <h3 className="route-title serif">{r.title}</h3>
                  <p className="route-body">{r.body}</p>
                  <span className="route-go arrow">Read</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
