import type { Metadata } from "next";
import Link from "next/link";

import { compileShift } from "@/lib/compiler";
import { AXES, AXIS_ORDER, WATCHES } from "@/lib/watches";

export const metadata: Metadata = {
  title: "Docs",
  description: "Quickstart, studio controls, keyboard shortcuts, directives, takes, photographs, self hosting and troubleshooting for UNSTILL.",
};

const NAV = [
  { group: "Start", items: [["quickstart", "Quickstart"], ["studio", "Studio tour"], ["shortcuts", "Keyboard shortcuts"]] },
  { group: "Direct", items: [["directives", "Directives"], ["voice", "Direct by voice"], ["events", "Events and cue sheets"], ["queue", "The queue"]] },
  { group: "Keep", items: [["takes", "Takes and replay"], ["branch", "Branching: what if"], ["share", "Share a take"], ["photo", "Your photograph"], ["record", "Recording"]] },
  { group: "Build", items: [["self-host", "Self hosting"], ["troubleshooting", "Troubleshooting"]] },
];

export default function Docs() {
  const corner = WATCHES[0];
  return (
    <div className="docs">
      <aside className="docs-side" aria-label="Docs navigation">
        <Link href="/studio" className="pill pill-light">
          + Open the studio
        </Link>
        {NAV.map((g) => (
          <div key={g.group} style={{ display: "contents" }}>
            <p>{g.group}</p>
            {g.items.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </aside>

      <article className="docs-body">
        <p className="eyebrow-blue mono">Documentation</p>
        <h1>Everything the studio does.</h1>
        <p>
          UNSTILL is a direction deck for Visko Orbis. You lock a place, roll a live session, and change the world while it
          runs. This page covers every control.
        </p>
        <div className="quick">
          <a href="#quickstart">
            <span>↳</span> Roll your first take in a minute
          </a>
          <a href="#shortcuts">
            <span>↳</span> Play the deck from the keyboard
          </a>
          <a href="#takes">
            <span>↳</span> Replay a take beat for beat
          </a>
          <a href="#troubleshooting">
            <span>↳</span> Fix a session that will not start
          </a>
        </div>

        <section id="quickstart">
          <h2>Quickstart</h2>
          <ol>
            <li>
              Open the <Link href="/studio">studio</Link>. The Corner is selected.
            </li>
            <li>
              Press <strong>Roll</strong>. A session connects and the street appears at dusk, usually within thirty seconds.
            </li>
            <li>
              Press <kbd>E</kbd> for Rain, then <kbd>4</kbd> for Night. Each change lands at the next chunk boundary.
            </li>
            <li>
              Or press <strong>Run cue sheet</strong> and let the sequence play.
            </li>
            <li>
              Press <strong>Cut</strong>. The take is saved under Takes.
            </li>
          </ol>
          <div className="callout">
            <strong>Sessions use credits while they run.</strong> Cut as soon as you are done, and use Release GPU to close
            the session entirely.
          </div>
        </section>

        <section id="studio">
          <h2>Studio tour</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Slate</td>
                  <td>Watch, take number, seed and the current chunk. The tally reads Ready, Rolling, Live or Held.</td>
                </tr>
                <tr>
                  <td>Stage</td>
                  <td>The live picture, the last directive caption and the chunk rail. The amber tick marks the last change.</td>
                </tr>
                <tr>
                  <td>Transport</td>
                  <td>Roll, Hold, Resume, Cut, sound, Record, seed and output resolution.</td>
                </tr>
                <tr>
                  <td>Deck</td>
                  <td>Watch picker, the four directive axes, events, cue sheet, free beats, the queue and the prompt inspector.</td>
                </tr>
                <tr>
                  <td>Watch log</td>
                  <td>Every prompt sent, newest first, stamped with the chunk it landed on.</td>
                </tr>
                <tr>
                  <td>Takes</td>
                  <td>Saved runs. Replay, export, import and delete.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="shortcuts">
          <h2>Keyboard shortcuts</h2>
          <p>Shortcuts work whenever focus is not in a text field.</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Axis</th>
                  <th>Keys</th>
                </tr>
              </thead>
              <tbody>
                {AXIS_ORDER.map((a) => (
                  <tr key={a}>
                    <td>{AXES[a].label}</td>
                    <td>
                      {AXES[a].options.map((o) => (
                        <span key={o.value} style={{ marginRight: 12, whiteSpace: "nowrap" }}>
                          <kbd>{o.key.toUpperCase()}</kbd> {o.label}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>Events</td>
                  <td>
                    <kbd>5</kbd> <kbd>6</kbd> <kbd>7</kbd> <kbd>8</kbd> fire the four events of the current Watch
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="directives">
          <h2>Directives</h2>
          <p>
            Before you roll, directives shape the opening prompt. While live, each change becomes one follow up prompt. This
            is what each one sends on The Corner.
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Directive</th>
                  <th>Prompt sent</th>
                </tr>
              </thead>
              <tbody>
                {AXIS_ORDER.flatMap((a) =>
                  AXES[a].options.map((o) => (
                    <tr key={`${a}-${o.value}`}>
                      <td>
                        {AXES[a].label}: {o.label}
                      </td>
                      <td>{compileShift(a, o.value, corner.nouns)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section id="voice">
          <h2>Direct by voice</h2>
          <p>
            Press <strong>Direct by voice</strong> and call the shot like you would on set. The studio listens, shows what it
            heard on the picture, and turns each phrase into deck actions in the order you said them. Recognition runs in your
            browser; Chrome and Edge support it.
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Say</th>
                  <th>What happens</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>“Action”</td>
                  <td>Roll the current Watch</td>
                </tr>
                <tr>
                  <td>“Rain, then night”</td>
                  <td>Weather: Rain, then Hour: Night, released on the beat</td>
                </tr>
                <tr>
                  <td>“Clear the street”</td>
                  <td>Occupancy: Empty</td>
                </tr>
                <tr>
                  <td>“Give me a slow push in”</td>
                  <td>Camera: Push in</td>
                </tr>
                <tr>
                  <td>“Have the taxi pull up”</td>
                  <td>The Cab stops event on The Corner</td>
                </tr>
                <tr>
                  <td>“Run the cue sheet”</td>
                  <td>Plays the Watch cue sheet</td>
                </tr>
                <tr>
                  <td>“Hold the shot” · “Resume”</td>
                  <td>Pause and continue the world</td>
                </tr>
                <tr>
                  <td>“And cut” · “That’s a wrap”</td>
                  <td>End the take</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="callout">
            Calls that stop or start a session are deliberate. “Action”, “cut” and “hold” only count when said on their own,
            the way they are called on set, so “hold on” or “cut to night” never pauses or ends a take.
          </div>
          <div className="table-wrap" style={{ display: "none" }}>
            <table className="table">
              <tbody>
              </tbody>
            </table>
          </div>
        </section>

        <section id="events">
          <h2>Events and cue sheets</h2>
          <p>Each Watch has four events. One action per event, so it reads clearly in the picture.</p>
          {WATCHES.map((w) => (
            <div key={w.id}>
              <h3>{w.name}</h3>
              <ul>
                {w.events.map((e) => (
                  <li key={e.id}>
                    <strong style={{ color: "var(--text)" }}>{e.label}.</strong> {e.prompt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p>
            A cue sheet releases its steps automatically, holding about five chunks after each one. Stop it at any time.
            Directives you press during a cue join the queue.
          </p>
        </section>

        <section id="queue">
          <h2>The queue</h2>
          <p>
            Orbis morphs at chunk boundaries, roughly every 1.8 seconds. The studio releases at most one directive every two
            chunks so changes do not collide. Pressing another option on the same axis replaces the queued one. Use Drop to
            remove any item.
          </p>
        </section>

        <section id="takes">
          <h2>Takes and replay</h2>
          <p>
            Every roll creates a take: the seed, the opening prompt and each beat with its chunk. Takes are kept in your
            browser. Export saves a JSON file. Import loads one back.
          </p>
          <p>
            Replay resets to the same seed, sends the same opening, then sends each beat when the stream reaches its chunk.
            Orbis produces the same video for the same seed and prompt sequence, so the take comes back.
          </p>
          <div className="callout">
            Takes that opened on a photograph replay only while that photograph is still loaded in the studio.
          </div>
        </section>

        <section id="branch">
          <h2>Branching: what if</h2>
          <p>
            Every take can fork. Under a take, pick a beat in <strong>What if, after</strong> and press <strong>Branch</strong>.
            The studio replays the same seed and the same beats up to that point, so the world arrives where it was, then hands
            control back to you. Direct a different future: snow instead of rain, a cyclist instead of a cab. The branch is
            saved as its own take, labelled with the take it came from.
          </p>
          <div className="callout">
            This is the counterfactual Live Models make possible: one shared past, two futures of the same street.
          </div>
        </section>

        <section id="share">
          <h2>Share a take</h2>
          <p>
            <strong>Copy link</strong> on any take creates a link that carries the seed, the opening and every beat. Anyone who
            opens it gets the take in their studio, ready to replay.
          </p>
          <p>
            Try one of our live test takes: <Link href="/studio#take=featured">open the featured Corner take</Link> (seed
            75256, the Dusk to an empty night cue sheet), then press Replay.
          </p>
        </section>

        <section id="photo">
          <h2>Your photograph</h2>
          <ol>
            <li>Select Photo in the Watch picker and choose an image.</li>
            <li>It is cropped to 16:9 in your browser. Orbis squashes other ratios, so this keeps proportions true.</li>
            <li>Describe what is in it in one line. That becomes the opening prompt.</li>
            <li>Roll. The badge on the stage reads Anchored to photo when Orbis confirms the image.</li>
          </ol>
          <p>Landscape images close to photoreal give the most faithful openings.</p>
        </section>

        <section id="record">
          <h2>Recording</h2>
          <p>
            <strong>Save HD video</strong> downloads the session as a full quality 1080p MP4 with the stream&apos;s own sound,
            recorded on Reactor&apos;s servers, so your computer does no encoding and the frame rate stays smooth. It is ready
            a few seconds after you press it. <strong>Record</strong> captures the picture in your browser instead and
            downloads a .webm when you stop.
          </p>
        </section>

        <section id="self-host">
          <h2>Self hosting</h2>
          <pre className="code">{`git clone https://github.com/angelraph/unstill
cd unstill
npm install
echo REACTOR_API_KEY=rk_your_key > .env.local
npm run dev`}</pre>
          <p>
            On Vercel, add <code>REACTOR_API_KEY</code> under Environment Variables and redeploy. The key stays on the
            server. <code>/api/token</code> exchanges it for a one hour token scoped to <code>reactor/visko-orbis-stable</code>{" "}
            and a single session.
          </p>
        </section>

        <section id="troubleshooting">
          <h2>Troubleshooting</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Fix</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>REACTOR_API_KEY is not set</td>
                  <td>Add the key to .env.local or to Vercel Environment Variables, then restart or redeploy.</td>
                </tr>
                <tr>
                  <td>Credits depleted (402)</td>
                  <td>The Reactor account is out of credits. Add credits on reactor.inc, or contact support@visko.ai.</td>
                </tr>
                <tr>
                  <td>Stuck on Rolling</td>
                  <td>A GPU is being allocated. Give it thirty seconds, then Release GPU and roll again.</td>
                </tr>
                <tr>
                  <td>Text opening instead of Anchored</td>
                  <td>Orbis started without the image. Re-select the photograph and roll again.</td>
                </tr>
                <tr>
                  <td>No sound</td>
                  <td>Browsers start muted. Press Sound off to turn it on.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  );
}
