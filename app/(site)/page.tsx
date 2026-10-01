import Link from "next/link";

import { Filmstrip } from "@/components/site/Filmstrip";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/site/Reveal";
import { Slides } from "@/components/site/Slides";

const STATEMENTS = [
  "A clip is finished the moment it renders.",
  "To make it rain, you render another one. You get another street.",
  "A place keeps running.",
  "So we made rain fall on the street that was already there.",
];

const STATS = [
  { v: "1.8", u: "s", k: "per Orbis chunk. Every change lands on the next one." },
  { v: "18", u: "fps", k: "generated live, delivered up to 4K over WebRTC." },
  { v: "0", u: "cuts", k: "from the first frame to the last. One continuous world." },
  { v: "61", u: "min", k: "of continuous running per session, if you want it." },
];

const BENTO = [
  { cls: "b-wide", k: "Continuity compiler", t: "The world is built once.", b: "The opening describes everything. Every prompt after it names one visible change, in physical nouns and verbs." },
  { cls: "", k: "Chunk timing", t: "Released on the beat.", b: "At most one directive per settle window, so morphs never collide." },
  { cls: "", k: "Queue", t: "See what is next.", b: "Queued changes replace each other per control. Drop any of them." },
  { cls: "", k: "Record", t: "Keep the picture.", b: "Save picture and sound to a file in the browser." },
  { cls: "b-glow", k: "Shortcuts", t: "Play it like an instrument.", b: "Every control has a key. 1 to 4 for the hour, Q to T for weather, 5 to 8 for events." },
  { cls: "b-wide", k: "Three worlds", t: "Film, retail, robotics.", b: "The Corner, The Aisle and The Bay share one instrument. Your photograph makes four." },
];

const DOORS = [
  { href: "/watches", k: "Places", title: "Watches", body: "Three worlds and your own photograph." },
  { href: "/how-it-works", k: "Technology", title: "How it works", body: "Sessions, the compiler and chunk timing." },
  { href: "/docs", k: "Reference", title: "Docs", body: "Controls, shortcuts, takes and self hosting." },
  { href: "/faq", k: "Questions", title: "FAQ", body: "Credits, cuts, photos and more." },
];

export default function Home() {
  return (
    <>
      <section className="hero" aria-label="Introduction">
        <div className="hero-media" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stills/corner-dusk.jpg" alt="" className="hero-img h1" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stills/corner-morph.jpg" alt="" className="hero-img h2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stills/corner-night.jpg" alt="" className="hero-img h3" />
          <div className="hero-shade" />
          <div className="hero-grain" />
        </div>

        <div className="hero-copy">
          <p className="eyebrow mono rise" style={{ animationDelay: "0.1s" }}>
            <span className="live-dot" aria-hidden /> Live Model · Visko Orbis
          </p>
          <h1 className="hero-title">
            <span className="line">
              <span className="rise" style={{ animationDelay: "0.2s" }}>
                The photograph
              </span>
            </span>
            <span className="line">
              <em className="rise" style={{ animationDelay: "0.38s" }}>
                is the first frame.
              </em>
            </span>
          </h1>
          <p className="hero-sub rise" style={{ animationDelay: "0.6s" }}>
            Direct a real place while it runs. Change the hour, the weather, the crowd and the camera. Orbis carries every
            change into the live picture at the next chunk, without a cut.
          </p>
          <div className="hero-actions rise" style={{ animationDelay: "0.75s" }}>
            <Link href="/studio" className="pill pill-light pill-lg">
              Open the studio
            </Link>
            <Link href="/how-it-works" className="pill pill-ghost pill-lg">
              See how it works <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="hero-tc mono" aria-hidden>
          <span className="rec">REC</span>
          <span className="tc-stack">
            <span className="tc tc1">CH 016 · Dusk</span>
            <span className="tc tc2">CH 029 · Night arriving</span>
            <span className="tc tc3">CH 039 · Settled</span>
          </span>
        </div>
        <a href="#why" className="hero-down" aria-label="Scroll down">
          ↓
        </a>
      </section>

      <Marquee />

      <section className="statements" id="why" aria-label="Why live">
        {STATEMENTS.map((s, i) => (
          <Reveal key={i} as="p" className={`statement ${i >= 2 ? "statement-bright" : ""}`}>
            {s}
          </Reveal>
        ))}
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow-blue mono">What a clip cannot do</p>
          <Reveal as="h2" className="h2 grad">
            Five moves. One running world.
          </Reveal>
          <Slides />
        </div>
      </section>

      <section className="band band-violet">
        <div className="arcs" aria-hidden />
        <div className="wrap">
          <p className="eyebrow-blue mono">Proof</p>
          <Reveal as="h2" className="h2 two-tone">
            One take. <span>No cuts.</span>
          </Reveal>
          <p className="lede">
            Real frames from a single Orbis session on The Corner. Rain and night were pressed from the deck. The taxi,
            the awning and the street stayed where they were.
          </p>
          <Filmstrip />
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="stats">
            {STATS.map((s) => (
              <Reveal key={s.u} className="stat">
                <p className="stat-v">
                  {s.v}
                  <span>{s.u}</span>
                </p>
                <p className="stat-k">{s.k}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow-blue mono">The instrument</p>
          <Reveal as="h2" className="h2 two-tone">
            Direct the world. <span>Never write a prompt.</span>
          </Reveal>
          <div className="bento">
            {BENTO.map((b) => (
              <Reveal key={b.k} className={`tile ${b.cls}`}>
                <span className="mono tile-k">{b.k}</span>
                <h3>{b.t}</h3>
                <p>{b.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="h2 two-tone">
            Go deeper. <span>Every page stands on its own.</span>
          </h2>
          <div className="doors">
            {DOORS.map((d) => (
              <Link key={d.href} href={d.href} className="door">
                <span className="mono door-k">{d.k}</span>
                <span className="door-title">{d.title}</span>
                <span className="door-body">{d.body}</span>
                <span className="door-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
