import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/site/Reveal";
import { ReviewTimeline, type ReviewBeat } from "@/components/site/ReviewTimeline";
import { compileOpening, compileShift } from "@/lib/compiler";
import { AXES, WATCHES, optionFor, type WorldState } from "@/lib/watches";

import "./how.css";

export const metadata: Metadata = {
  title: "How it works",
  description: "The continuity compiler, chunk gated release and reproducible takes behind UNSTILL.",
};

const corner = WATCHES[0];

/** The Corner's cue sheet laid out the way the studio would release it. */
function cornerBeats(): { beats: ReviewBeat[]; length: number } {
  let world: WorldState = { ...corner.initial };
  let at = 2;
  const beats: ReviewBeat[] = [
    { chunk: 0, label: "Opening", prompt: compileOpening(corner, world), world, kind: "opening" },
  ];
  for (const step of corner.cue.steps) {
    if (step.kind === "axis") {
      world = { ...world, [step.axis]: step.value };
      beats.push({
        chunk: at,
        label: `${AXES[step.axis].label}: ${optionFor(step.axis, step.value).label}`,
        prompt: compileShift(step.axis, step.value, corner.nouns),
        world,
        kind: "axis",
      });
    } else {
      const ev = corner.events.find((e) => e.id === step.id);
      if (ev) beats.push({ chunk: at, label: ev.label, prompt: ev.prompt, world, kind: "event" });
    }
    at += step.hold;
  }
  return { beats, length: at + 2 };
}

const LOOP = [
  { n: "01", title: "Lock", body: "Choose a Watch or drop in a photograph. The place is fixed for the whole take." },
  { n: "02", title: "Roll", body: "One opening prompt builds the world. Orbis starts streaming it over WebRTC." },
  { n: "03", title: "Direct", body: "Hour, weather, crowd, camera, events, or a line of your own. Each lands on the next chunk." },
  { n: "04", title: "Keep", body: "Cut, and the take is saved: seed, opening and every beat with its chunk." },
];

export default function HowItWorks() {
  const { beats, length } = cornerBeats();
  const rain = compileShift("weather", "rain", corner.nouns);

  return (
    <>
      <header className="page-head wrap">
        <p className="eyebrow">How it works</p>
        <div className="page-head-row">
          <h1 className="display">
            One take.
            <br />
            <em className="glow">Four parts.</em>
          </h1>
          <p className="lede">
            UNSTILL is a thin, careful layer over a live model. It decides what to say to Orbis, when to say it, and
            remembers all of it so the run can be played again.
          </p>
        </div>
      </header>

      <section className="section wrap">
        <ol className="loop">
          {LOOP.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90}>
              <span className="loop-n mono">{s.n}</span>
              <h3 className="serif">{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="section wrap">
        <div className="section-intro">
          <p className="eyebrow">The take, reviewed</p>
          <div>
            <h2 className="title">
              Every prompt,
              <br />
              <em>stamped with its chunk.</em>
            </h2>
            <p className="lede intro-lede">
              This is the Corner cue sheet as the studio releases it. Click a marker or a note to jump. The notes are the
              exact text sent to Orbis.
            </p>
          </div>
        </div>
        <ReviewTimeline beats={beats} length={length} />
      </section>

      <section className="section wrap">
        <div className="section-intro">
          <p className="eyebrow">01 · Continuity compiler</p>
          <div>
            <h2 className="title">
              You press Rain.
              <br />
              <em>Orbis reads a sentence.</em>
            </h2>
            <p className="lede intro-lede">
              The opening describes the whole world once: camera, place, conditions. Every prompt after it describes
              one visible change in physical nouns and verbs, and never a negation. The nouns come from the Watch, so
              rain wets this asphalt and these lamps, not a generic street.
            </p>
          </div>
        </div>
        <Reveal className="compile">
          <div className="compile-col">
            <span className="compile-tag mono">You</span>
            <div className="compile-key">
              <kbd className="mono">E</kbd>
              Weather: Rain
            </div>
          </div>
          <div className="compile-arrow" aria-hidden>
            <span />
          </div>
          <div className="compile-col">
            <span className="compile-tag mono">Compiler</span>
            <ul className="compile-nouns mono">
              <li>
                ground <span>{corner.nouns.ground}</span>
              </li>
              <li>
                lights <span>{corner.nouns.lights}</span>
              </li>
              <li>
                axis <span>weather → rain</span>
              </li>
            </ul>
          </div>
          <div className="compile-arrow" aria-hidden>
            <span />
          </div>
          <div className="compile-col">
            <span className="compile-tag mono">Orbis</span>
            <p className="compile-out">{rain}</p>
          </div>
        </Reveal>
      </section>

      <section className="section wrap">
        <div className="section-intro">
          <p className="eyebrow">02 · Chunk gated release</p>
          <div>
            <h2 className="title">
              One change
              <br />
              <em>per settle window.</em>
            </h2>
            <p className="lede intro-lede">
              Orbis morphs at chunk boundaries. Two prompts in the same breath fight each other. So the studio listens
              for every finished chunk and releases at most one directive, then waits two chunks for it to settle.
              Press Night twice and the second replaces the first in the queue. Change your mind and drop it.
            </p>
          </div>
        </div>
        <Reveal className="gate">
          <div className="gate-row">
            {Array.from({ length: 14 }, (_, i) => {
              const sends = [1, 4, 8, 11];
              const settle = sends.some((s) => i > s && i <= s + 2);
              return (
                <div key={i} className={`gate-chunk ${sends.includes(i) ? "send" : ""} ${settle ? "settle" : ""}`}>
                  <span className="mono">{String(i).padStart(2, "0")}</span>
                </div>
              );
            })}
          </div>
          <div className="gate-legend mono">
            <span>
              <i className="send" /> Directive released
            </span>
            <span>
              <i className="settle" /> Settling, queue held
            </span>
            <span>
              <i /> Open, next one may go
            </span>
          </div>
        </Reveal>
      </section>

      <section className="section wrap">
        <div className="section-intro">
          <p className="eyebrow">03 · Takes</p>
          <div>
            <h2 className="title">
              Same seed, same beats,
              <br />
              <em>same world.</em>
            </h2>
            <p className="lede intro-lede">
              Orbis returns the same video for the same seed and the same prompt sequence. A take stores both, with the
              chunk each prompt landed on. Replay releases every beat at its chunk again. Export it as a small file and
              it replays on any machine.
            </p>
          </div>
        </div>
        <Reveal className="take-file">
          <div className="take-file-bar mono">
            <span>unstill-take-7-corner.json</span>
            <span>{beats.length - 1} beats</span>
          </div>
          <pre className="mono">
            {JSON.stringify(
              {
                number: 7,
                watchId: "corner",
                seed: 13664,
                anchored: false,
                opening: beats[0].prompt.slice(0, 72) + "...",
                beats: beats.slice(1, 4).map((b) => ({ chunk: b.chunk, label: b.label, prompt: b.prompt.slice(0, 48) + "..." })),
              },
              null,
              2,
            )}
          </pre>
        </Reveal>
        <div className="how-next">
          <Link href="/docs#takes" className="text-link arrow">
            The full take format
          </Link>
          <Link href="/studio" className="btn-pill">
            Try it in the studio
          </Link>
        </div>
      </section>
    </>
  );
}
