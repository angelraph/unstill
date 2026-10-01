import type { Metadata } from "next";
import Link from "next/link";

import "./faq.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about UNSTILL: live direction, Orbis sessions, photos, takes, privacy and running your own copy.",
};

const FAQ: { id: string; title: string; items: [string, React.ReactNode][] }[] = [
  {
    id: "idea",
    title: "The idea",
    items: [
      [
        "What is UNSTILL, in one line?",
        "A live direction deck for places. You lock a location, then change its hour, weather, crowd and camera while the picture keeps running.",
      ],
      [
        "How is this different from a video generator?",
        "A generator hands you a finished clip. To make it rain you render again and get a different street. UNSTILL keeps one world running and changes it in place, so the corner you started with is the corner you end with.",
      ],
      [
        "Why does it need a live model?",
        "The whole product is changing a world while it runs. Take real time generation away and there is nothing left to direct. Orbis is the engine, UNSTILL is the instrument.",
      ],
      [
        "Who is it for?",
        "Filmmakers scouting and previsualizing a location, retail teams walking a store before it is built, and robotics teams who need edge cases in front of a robot on demand. And anyone with a photograph of a place they care about.",
      ],
    ],
  },
  {
    id: "studio",
    title: "Using the studio",
    items: [
      [
        "Do I have to write prompts?",
        "No. You press Rain or Night or Push in. A continuity compiler turns each press into the sentence Orbis reads best. You can still write your own beat when you want something specific.",
      ],
      [
        "Why does a change take a moment to appear?",
        "Orbis changes the picture at chunk boundaries, and the studio waits two chunks between directives so they do not fight. A control drawn in outline is queued and shows how many chunks until it lands.",
      ],
      [
        "What is the moving picture before I press Roll?",
        "An animatic: a drawn rehearsal of your shot that follows every control. It costs nothing, so you can block the take first. It is labelled so nobody mistakes it for Orbis output.",
      ],
      [
        "Are there keyboard shortcuts?",
        <>
          Every control has one. Space rolls, holds and resumes. 1 to 4 set the hour, Q to T the weather, A to D the crowd,
          Z to B the camera, and 5 to 8 fire events. The full list is in the <Link href="/docs#keys">docs</Link>.
        </>,
      ],
      [
        "What does the cue sheet do?",
        "It plays a scripted sequence for the Watch on chunk timing, so a whole scene directs itself. Anything you press while it runs goes first.",
      ],
    ],
  },
  {
    id: "orbis",
    title: "Orbis and GPU time",
    items: [
      [
        "When am I using GPU time?",
        "From Roll until Cut, a live session is generating. Hold pauses the picture. Release GPU closes the session when you are idle. The animatic, the site and the takes list use none.",
      ],
      [
        "How long can a run be?",
        "As long as Orbis allows for a session. When it reaches its limit the studio says so, ends the run and keeps the take.",
      ],
      [
        "Can I change the resolution?",
        "Yes, before you roll. The Out menu lists the resolutions Orbis reports for the session.",
      ],
    ],
  },
  {
    id: "takes",
    title: "Takes and replay",
    items: [
      [
        "What is a take?",
        "The record of a run: seed, opening prompt and every beat with the chunk it landed on. It is saved when you roll and updated with each beat.",
      ],
      [
        "Will a replay look exactly the same?",
        "Orbis returns the same video for the same seed and the same prompt sequence, and replay releases each beat at its original chunk. That is the whole point of keeping takes.",
      ],
      [
        "Where are takes stored?",
        "In your browser. The last 24 are kept. Export one as a small JSON file to keep it longer or to send it to someone, and Import it on any machine.",
      ],
      [
        "Can I record a video file?",
        "Yes. Record saves the live picture and sound to a .webm file in your browser while the take runs.",
      ],
    ],
  },
  {
    id: "privacy",
    title: "Photos and privacy",
    items: [
      [
        "What happens to my photograph?",
        "It is cropped to 16:9 in your browser, then uploaded to your live session so Orbis can open on it. UNSTILL keeps no copy on its own servers.",
      ],
      [
        "Why can’t I replay a photo take after a reload?",
        "Photos only live for the browser session. Add the photo again and roll it as a fresh take.",
      ],
      [
        "Is my API key exposed?",
        "No. The key stays on the server. The browser gets a token that lasts one hour, works only for Orbis, and allows a single session.",
      ],
    ],
  },
  {
    id: "build",
    title: "Building on it",
    items: [
      [
        "Can I run my own copy?",
        <>
          Yes. Install, add a Reactor API key, run. It deploys to Vercel with one environment variable. The steps are in the{" "}
          <Link href="/docs#run-locally">docs</Link>.
        </>,
      ],
      [
        "Can I add my own Watch?",
        "A Watch is a setting, a few nouns, a starting state, four events and a cue sheet, all in one file. Add an entry and the studio, the compiler and the site pick it up.",
      ],
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="page-paper">
      <header className="page-head wrap">
        <p className="eyebrow">Questions</p>
        <div className="page-head-row">
          <h1 className="display">
            Asked,
            <br />
            <em>and answered.</em>
          </h1>
          <p className="lede">
            The things people ask after their first take. If yours is not here, the{" "}
            <Link href="/docs" className="text-link">
              docs
            </Link>{" "}
            go deeper.
          </p>
        </div>
        <nav className="faq-chips" aria-label="Topics">
          {FAQ.map((g) => (
            <a key={g.id} href={`#${g.id}`}>
              {g.title}
              <span className="mono">{g.items.length}</span>
            </a>
          ))}
        </nav>
      </header>

      <div className="faq wrap">
        {FAQ.map((g, i) => (
          <section key={g.id} id={g.id} className="faq-group">
            <div className="faq-group-head">
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="serif">{g.title}</h2>
            </div>
            <div className="faq-items">
              {g.items.map(([q, a], k) => (
                <details key={k} name={g.id} open={i === 0 && k === 0}>
                  <summary>
                    <span>{q}</span>
                    <i aria-hidden />
                  </summary>
                  <div className="faq-answer">{a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
