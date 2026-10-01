import type { Metadata } from "next";
import Link from "next/link";

import { Filmstrip } from "@/components/site/Filmstrip";
import { Reveal } from "@/components/site/Reveal";
import { compileOpening, compileShift } from "@/lib/compiler";
import { WATCHES } from "@/lib/watches";

export const metadata: Metadata = {
  title: "How it works",
  description: "Sessions, the continuity compiler, chunk gated release and reproducible takes. How UNSTILL drives Visko Orbis live.",
};

const corner = WATCHES[0];

const FLOW = [
  { t: "Mint a session", b: "The server swaps your Reactor key for a one hour token scoped to Orbis only.", c: "POST /api/token" },
  { t: "Connect live", b: "The browser opens a WebRTC session and receives picture and sound tracks.", c: "main_video · main_audio" },
  { t: "Anchor the frame", b: "For a photograph: upload, set as the first frame, wait for Orbis to confirm.", c: "set_image" },
  { t: "Build the world", b: "One opening prompt describes everything, then generation starts.", c: "set_prompt → start" },
  { t: "Listen to the beat", b: "Every completed chunk is an event. The studio counts them.", c: "chunk_complete" },
  { t: "Release a directive", b: "At most one change per settle window, written as one visible change.", c: "set_prompt" },
  { t: "Stamp the take", b: "Each change is saved with the chunk it landed on, next to the seed.", c: "seed + beats" },
  { t: "Cut or hold", b: "Pause, resume or reset. Releasing the GPU ends the session and the billing.", c: "pause · reset" },
];

// q = queued, s = sent, x = would collide without gating
const RAW = "....s.s.ss.s..s.";
const GATED = "....s.q.s.q.s.q.";

export default function HowItWorks() {
  const rain = compileShift("weather", "rain", corner.nouns);
  const night = compileShift("hour", "night", corner.nouns);
  const empty = compileShift("crowd", "empty", corner.nouns);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow-blue mono">How it works</p>
          <h1 className="h1">
            A live model, <em>played like an instrument.</em>
          </h1>
          <p className="lede">
            UNSTILL sits between your hands and Visko Orbis. It turns presses into prompts Orbis reads well, times them to
            the stream, and remembers every take.
          </p>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="h2" className="h2 two-tone">
            The session. <span>Eight steps, one stream.</span>
          </Reveal>
          <div className="flow">
            {FLOW.map((f) => (
              <Reveal key={f.t} className="flow-step">
                <h3>{f.t}</h3>
                <p>{f.b}</p>
                <p style={{ marginTop: 12 }}>
                  <code>{f.c}</code>
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-violet">
        <div className="arcs" aria-hidden />
        <div className="wrap">
          <p className="eyebrow-blue mono">Continuity compiler</p>
          <Reveal as="h2" className="h2 two-tone">
            You press Rain. <span>Orbis reads this.</span>
          </Reveal>
          <p className="lede">
            The opening builds the world once. Every prompt after it names a single visible change in physical nouns and
            verbs. No negations, no redescribing. These are the exact strings the studio sends for The Corner.
          </p>
          <div className="script">
            <div className="script-row">
              <span className="script-tag">Opening</span>
              <p>{compileOpening(corner, corner.initial)}</p>
            </div>
            <div className="script-row">
              <span className="script-tag">Weather: Rain</span>
              <p>{rain}</p>
            </div>
            <div className="script-row">
              <span className="script-tag">Hour: Night</span>
              <p>{night}</p>
            </div>
            <div className="script-row">
              <span className="script-tag">Occupancy: Empty</span>
              <p>{empty}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap split">
          <div>
            <p className="eyebrow-blue mono">Chunk gated release</p>
            <Reveal as="h2" className="h2 two-tone">
              On the beat. <span>Never on top of it.</span>
            </Reveal>
            <p className="lede">
              Orbis generates in chunks of about 1.8 seconds and morphs at their edges. Send prompts faster than that and
              they compete. The studio holds directives in a visible queue and releases one every two chunks. A newer
              change to the same control replaces the older one.
            </p>
          </div>
          <div className="cadence">
            <div className="cadence-row">
              <span>Ungated</span>
              <div className="cadence-cells">
                {RAW.split("").map((c, i) => (
                  <i key={i} className={c === "s" ? (RAW[i - 1] === "s" || RAW[i - 2] === "s" ? "x" : "s") : ""} />
                ))}
              </div>
            </div>
            <div className="cadence-row">
              <span>UNSTILL</span>
              <div className="cadence-cells">
                {GATED.split("").map((c, i) => (
                  <i key={i} className={c === "s" ? "s" : c === "q" ? "q" : ""} />
                ))}
              </div>
            </div>
            <div className="legend">
              <span>
                <i style={{ background: "var(--warm)" }} /> Prompt lands
              </span>
              <span>
                <i style={{ background: "rgba(106,162,255,.35)" }} /> Settling, next one queued
              </span>
              <span>
                <i style={{ background: "rgba(255,59,48,.55)" }} /> Collides with a morph
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div>
            <p className="eyebrow-blue mono">Takes</p>
            <Reveal as="h2" className="h2 two-tone">
              Same seed. <span>Same world.</span>
            </Reveal>
            <p className="lede">
              Orbis is deterministic for the same seed and the same prompt sequence. A take stores both, with each beat
              stamped by chunk. Export it as a small file, import it anywhere, replay it.
            </p>
          </div>
          <pre className="code">{`{
  "number": 1,
  "watchId": "corner",
  "seed": 30837,
  "opening": "Wide shot, eye level, static camera...",
  "beats": [
    { "chunk": 22, "label": "Weather: Rain",
      "prompt": "Rain begins to fall..." },
    { "chunk": 24, "label": "Hour: Night",
      "prompt": "Night falls..." }
  ]
}`}</pre>
        </div>
      </section>

      <section className="band band-violet">
        <div className="wrap">
          <p className="eyebrow-blue mono">Proof</p>
          <Reveal as="h2" className="h2 two-tone">
            One session. <span>Three moments.</span>
          </Reveal>
          <Filmstrip />
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow-blue mono">Built for the judging criteria</p>
          <Reveal as="h2" className="h2 two-tone">
            Live is the product. <span>Not a feature.</span>
          </Reveal>
          <div className="judge">
            <div>
              <h3>Real time interaction</h3>
              <p>Every control steers a running stream. Take Orbis away and nothing in UNSTILL still works.</p>
            </div>
            <div>
              <h3>Creativity</h3>
              <p>Live place direction is a new category: one instrument for film, retail, robotics and your own photos.</p>
            </div>
            <div>
              <h3>Functionality</h3>
              <p>Roll, direct, run a cue sheet, cut, replay. A public build, nothing simulated.</p>
            </div>
          </div>
          <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/studio" className="pill pill-light pill-lg">
              Open the studio
            </Link>
            <Link href="/docs" className="pill pill-ghost pill-lg">
              Read the docs →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
