import type { Metadata } from "next";
import Link from "next/link";

import { WatchesHero } from "@/components/site/WatchesHero";
import { compileOpening } from "@/lib/compiler";
import { AXES, optionFor, WATCHES } from "@/lib/watches";

export const metadata: Metadata = {
  title: "Watches",
  description: "The Corner, The Aisle, The Bay and your own photograph. Three live worlds and one you bring.",
};

const USE: Record<string, { tag: string; lead: string; why: string[] }> = {
  corner: {
    tag: "never cuts.",
    lead: "Scout a location before anyone travels to it. Rain on it, darken it, empty it, all in one continuous take.",
    why: ["Previsualize a scene at every hour", "Pitch a look to a director in real time", "Block camera moves on a living street"],
  },
  aisle: {
    tag: "opens before it is built.",
    lead: "Walk a flagship store at noon, at night, empty or slammed, and swap the display before a single plinth is built.",
    why: ["Test merchandising under any crowd", "Preview a product launch night", "Stage window displays from the street"],
  },
  bay: {
    tag: "meets its edge cases.",
    lead: "Throw edge cases in front of a warehouse robot while the world keeps running. A fallen box, a forklift, a spill.",
    why: ["Rehearse rare events for training", "Show stakeholders failure cases safely", "Teach robotics with a world that reacts"],
  },
};

const CLIP: Record<string, string> = {
  corner: "dusk turns to night on the same street",
  aisle: "a red drop lands on the plinth",
  bay: "a box falls in the lane",
  photo: "a photograph of a lake, now moving",
};

export default function WatchesPage() {
  const items = [
    ...WATCHES.map((w) => ({ id: w.id, name: w.name, sector: w.sector, opening: compileOpening(w, w.initial) })),
    {
      id: "photo",
      name: "Your photograph",
      sector: "Anyone",
      opening: "Your still is cropped to 16:9, uploaded, and set as the first frame. Then it starts to move.",
    },
  ];

  return (
    <>
      <WatchesHero items={items} />

      {WATCHES.map((w) => (
        <section key={w.id} id={w.id} className="wx-detail">
          <div className="wrap wx-detail-grid">
            <div className="wx-detail-side">
              <p className="eyebrow-blue mono">{w.sector}</p>
              <h2>
                {w.name}
                <br />
                <em>{USE[w.id].tag}</em>
              </h2>
              <p>{USE[w.id].lead}</p>
              <Link href={`/studio?watch=${w.id}`} className="pill pill-light">
                Open {w.name} in the studio
              </Link>
            </div>
            <div>
              <div className="wx-media">
                <video
                  src={`/clips/${w.id}.mp4`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${w.name}, recorded live on Orbis: ${CLIP[w.id]}`}
                />
                <p className="wx-media-cap mono">Recorded live on Orbis · {CLIP[w.id]}</p>
              </div>
              <div className="panel">
                <h3>Opening prompt</h3>
                <p className="mono">{compileOpening(w, w.initial)}</p>
              </div>
              <div className="panel">
                <h3>Starts at</h3>
                <div className="chips">
                  {(["hour", "weather", "crowd", "camera"] as const).map((a) => (
                    <span key={a}>
                      {AXES[a].label}: {optionFor(a, w.initial[a]).label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>Events</h3>
                <div className="chips">
                  {w.events.map((e) => (
                    <span key={e.id}>{e.label}</span>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>Cue sheet · {w.cue.title}</h3>
                <ol className="steps-list">
                  {w.cue.steps.map((s, i) => (
                    <li key={i}>
                      {s.kind === "axis"
                        ? `${AXES[s.axis].label}: ${optionFor(s.axis, s.value).label}`
                        : w.events.find((e) => e.id === s.id)?.label}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="panel">
                <h3>Good for</h3>
                <ol className="steps-list">
                  {USE[w.id].why.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section id="photo" className="wx-detail">
        <div className="wrap wx-detail-grid">
          <div className="wx-detail-side">
            <p className="eyebrow-blue mono">Anyone</p>
            <h2>
              Your photograph
              <br />
              <em>becomes a place.</em>
            </h2>
            <p>
              A harbor, a kitchen, the street outside your window. Orbis opens on that exact frame, and every control in the
              deck works on it.
            </p>
            <Link href="/studio?watch=photo" className="pill pill-light">
              Bring a photograph
            </Link>
          </div>
          <div>
            <div className="wx-media">
              <video src="/clips/photo.mp4" autoPlay muted loop playsInline preload="metadata" aria-label={`Your photograph, recorded live on Orbis: ${CLIP.photo}`} />
              <p className="wx-media-cap mono">Recorded live on Orbis · {CLIP.photo}</p>
            </div>
            <div className="panel">
              <h3>What happens to it</h3>
              <ol className="steps-list">
                <li>Cropped to 16:9 in your browser so nothing is squashed</li>
                <li>Uploaded to the Orbis session and set as the first frame</li>
                <li>Your one line description holds Orbis to that place after the first frame</li>
                <li>Roll, then direct hour, weather, crowd and camera</li>
              </ol>
            </div>
            <div className="panel">
              <h3>Tips</h3>
              <p>
                Landscape and close to photoreal works best. Describe what is in the photo in plain words: a quiet harbor
                with fishing boats at low tide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
