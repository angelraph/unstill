import type { Metadata } from "next";
import Link from "next/link";

import { DocsNav, type DocsGroup } from "@/components/site/DocsNav";
import { SETTLE_CHUNKS } from "@/lib/orbis";
import { AXES, AXIS_ORDER } from "@/lib/watches";

import "./docs.css";

export const metadata: Metadata = {
  title: "Docs",
  description: "Quickstart, controls and keys, the take file format, the Orbis command flow, and how to run and deploy UNSTILL.",
};

const GROUPS: DocsGroup[] = [
  {
    title: "Start",
    items: [
      { id: "quickstart", label: "Quickstart" },
      { id: "run-locally", label: "Run it locally" },
      { id: "deploy", label: "Deploy" },
    ],
  },
  {
    title: "Studio",
    items: [
      { id: "controls", label: "Transport" },
      { id: "keys", label: "Keyboard" },
      { id: "queue", label: "Queue and release" },
      { id: "photo", label: "Your photograph" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "takes", label: "Take files" },
      { id: "orbis", label: "Orbis command flow" },
      { id: "security", label: "Keys and tokens" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "project", label: "Project map" },
    ],
  },
];

export default function Docs() {
  return (
    <>
      <header className="page-head wrap docs-head">
        <p className="eyebrow">Documentation</p>
        <div className="page-head-row">
          <h1 className="display">
            The manual.
            <br />
            <em>Every control, explained.</em>
          </h1>
          <p className="lede">
            Everything you need to direct a take, keep it, hand it to someone else, or run your own copy of UNSTILL.
            Short on purpose. If something is missing, the <Link href="/faq" className="text-link">FAQ</Link> probably has it.
          </p>
        </div>
      </header>

      <div className="docs wrap">
        <aside className="docs-side">
          <DocsNav groups={GROUPS} />
        </aside>

        <article className="docs-body">
          <Doc id="quickstart" kicker="Start" title="Quickstart">
            <p>Sixty seconds from the home page to a kept take.</p>
            <ol className="steps">
              <li>
                <b>Open the studio.</b> The Corner is selected. The frame plays an animatic of the shot you are about to roll.
              </li>
              <li>
                <b>Press Roll</b> or Space. The world is built from one opening prompt and starts streaming. The tally in the
                top right turns red.
              </li>
              <li>
                <b>Direct.</b> Press <kbd>E</kbd> for rain, then <kbd>4</kbd> for night, then <kbd>5</kbd> for the cab. Each
                change lands at the next chunk boundary. Or press <b>Run cue sheet</b> and watch it direct itself.
              </li>
              <li>
                <b>Cut.</b> The take is saved under Takes with its seed and every beat. Press Replay to get the same world back.
              </li>
            </ol>
            <Callout>Each Roll opens a live GPU session. Hold pauses the picture. Cut ends the run. Release GPU closes the session when you are idle.</Callout>
          </Doc>

          <Doc id="run-locally" kicker="Start" title="Run it locally">
            <p>You need Node 20 or newer and a Reactor API key from reactor.inc. The key starts with rk_.</p>
            <Code
              file="terminal"
              text={`npm install
cp .env.example .env.local   # add REACTOR_API_KEY
npm run dev`}
            />
            <p>
              Open <code>http://localhost:3000</code> for the site and <code>/studio</code> for the studio.
            </p>
            <Table
              head={["Variable", "Required", "Notes"]}
              rows={[["REACTOR_API_KEY", "Yes", "Server side only. Exchanged for a one hour session token, never sent to the browser."]]}
            />
          </Doc>

          <Doc id="deploy" kicker="Start" title="Deploy">
            <ol className="steps">
              <li>Import the repository on Vercel. The Next.js preset needs no changes.</li>
              <li>
                Add <code>REACTOR_API_KEY</code> under Environment Variables.
              </li>
              <li>Deploy. The token route runs on demand, every other page is static.</li>
            </ol>
          </Doc>

          <Doc id="controls" kicker="Studio" title="Transport">
            <Table
              head={["Control", "When", "What it does"]}
              rows={[
                ["Roll", "Idle", "Connects if needed, sets the seed, the photo if any, and the opening prompt, then starts the stream."],
                ["Hold / Resume", "Live", "Pauses and resumes generation. Queued directives wait while held."],
                ["Cut", "Live or held", "Resets the run and saves the take. A new seed is drawn for the next one."],
                ["Sound", "Always", "Plays the sound Orbis generates from the picture. Off by default."],
                ["Record", "Live", "Records picture and sound to a .webm file in your browser. Nothing is uploaded."],
                ["Seed", "Idle", "Fix it to reproduce a world. Changes are locked while a take runs."],
                ["Out", "Idle", "Delivery resolution, from the list Orbis reports."],
                ["Release GPU", "Idle", "Closes the session so it stops holding a GPU."],
              ]}
            />
          </Doc>

          <Doc id="keys" kicker="Studio" title="Keyboard">
            <p>Keys work anywhere in the studio except while typing in a field.</p>
            <div className="keys">
              {AXIS_ORDER.map((axis) => (
                <div key={axis} className="keys-group">
                  <p className="keys-title mono">{AXES[axis].label}</p>
                  <ul>
                    {AXES[axis].options.map((o) => (
                      <li key={o.value}>
                        <kbd>{o.key.toUpperCase()}</kbd>
                        {o.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="keys-group">
                <p className="keys-title mono">Transport and events</p>
                <ul>
                  <li>
                    <kbd>Space</kbd>Roll, Hold, Resume
                  </li>
                  <li>
                    <kbd>5</kbd>
                    <kbd>6</kbd>
                    <kbd>7</kbd>
                    <kbd>8</kbd>The four events of the Watch
                  </li>
                </ul>
              </div>
            </div>
          </Doc>

          <Doc id="queue" kicker="Studio" title="Queue and release">
            <p>
              Orbis changes the picture at chunk boundaries. The studio listens for every finished chunk and releases at
              most one directive, then waits {SETTLE_CHUNKS} chunks before the next.
            </p>
            <Table
              head={["Rule", "Effect"]}
              rows={[
                ["Same control twice", "The newer value replaces the queued one. Only the last word counts."],
                ["Back to what is showing", "The queued change is removed. Nothing is sent."],
                ["Same event twice", "Ignored while the first is still queued."],
                ["Drop", "Removes any queued item before it is sent."],
                ["Filled vs outlined", "A filled control is on screen. An outlined one is queued, with a countdown in chunks."],
                ["Cue sheet", "Releases its steps on chunk timing. Your own directives go first."],
              ]}
            />
          </Doc>

          <Doc id="photo" kicker="Studio" title="Your photograph">
            <p>
              Choose Photo, then drop an image on the frame or pick one. It is cropped to 16:9 in your browser, uploaded to
              the session, and set as the first frame before the opening prompt. Add one line saying what is in it. That
              line becomes the subject of the opening.
            </p>
            <Callout>Photos live only for the browser session. A take that opened on a photo can be replayed while that photo is still loaded.</Callout>
          </Doc>

          <Doc id="takes" kicker="Reference" title="Take files">
            <p>
              Every run is a take. The last 24 are kept in this browser. Export writes one as JSON; Import reads it back on
              any machine.
            </p>
            <Table
              head={["Field", "Type", "Meaning"]}
              rows={[
                ["number", "number", "Take number shown in the studio."],
                ["watchId", "string", "corner, aisle, bay or photo."],
                ["seed", "number", "The seed Orbis ran with."],
                ["opening", "string", "The exact opening prompt."],
                ["anchored", "boolean", "True when the take opened on a photograph."],
                ["beats", "Beat[]", "Each with chunk, label and prompt, in the order they landed."],
                ["createdAt", "string", "ISO timestamp."],
              ]}
            />
            <Code
              file="unstill-take-7-corner.json"
              text={`{
  "number": 7,
  "watchId": "corner",
  "seed": 13664,
  "anchored": false,
  "opening": "Wide shot, eye level, static camera on a tripod...",
  "beats": [
    { "chunk": 2, "label": "Weather: Rain", "prompt": "Rain begins to fall..." },
    { "chunk": 7, "label": "Hour: Night", "prompt": "Night falls..." }
  ]
}`}
            />
            <p>An import needs at least seed, opening and beats. Anything else is rejected with a message.</p>
          </Doc>

          <Doc id="orbis" kicker="Reference" title="Orbis command flow">
            <p>The order Orbis needs for a run, as the studio sends it.</p>
            <ol className="flow">
              {[
                ["uploadFile", "Photo takes only. The cropped still goes to the session."],
                ["set_image", "Sets it as the first frame. The studio waits for has_image."],
                ["set_seed", "Fixes the world so a take can come back."],
                ["set_resolution", "Only if you chose one."],
                ["set_prompt", "The opening. The studio waits for conditions_ready."],
                ["start", "Streaming begins. generation_started reports fps and frames per chunk."],
                ["set_prompt", "Every directive after that, released on chunk_complete."],
                ["pause / resume / reset", "Hold, Resume and Cut."],
              ].map(([cmd, note], i) => (
                <li key={i}>
                  <code>{cmd}</code>
                  <span>{note}</span>
                </li>
              ))}
            </ol>
          </Doc>

          <Doc id="security" kicker="Reference" title="Keys and tokens">
            <p>
              The API key stays on the server. The browser asks <code>/api/token</code> for a session token. The server
              exchanges the key for a JWT that lasts one hour, is scoped to the Orbis model only, and allows a single session.
              A fresh token is fetched after every disconnect.
            </p>
          </Doc>

          <Doc id="troubleshooting" kicker="Reference" title="Troubleshooting">
            <Table
              head={["You see", "Do this"]}
              rows={[
                ["REACTOR_API_KEY is not set", "Add the key to .env.local, or to Vercel Environment Variables, then redeploy."],
                ["Orbis did not report conditions_ready in time", "Press Roll again. If it repeats, Release GPU and roll fresh."],
                ["This take opened on a photograph that is no longer loaded", "Add the photo again and roll it as a new take."],
                ["That file is not an UNSTILL take", "The JSON is missing seed, opening or beats."],
                ["The run reached its maximum length", "Orbis ended the stream. The take is saved. Roll again to continue."],
                ["A control stays outlined", "It is queued. It lands after the settle window, or after Resume if held."],
              ]}
            />
          </Doc>

          <Doc id="project" kicker="Reference" title="Project map">
            <Code
              file="unstill/"
              text={`app/(site)/              Home, Watches, How it works, Docs, FAQ
app/studio/page.tsx      The studio
app/api/token/route.ts   Session token minting
hooks/use-unstill.ts     Session engine: roll, direct, queue, cue, takes, replay
lib/watches.ts           Worlds, directive vocabulary, events, cue sheets
lib/compiler.ts          Opening and shift prompts
lib/take.ts              Take storage, export, import
components/studio/       Stage, animatic, deck, transport, log and takes
components/site/         Site navigation and motion pieces`}
            />
          </Doc>
        </article>
      </div>
    </>
  );
}

function Doc({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="doc">
      <p className="doc-kicker mono">{kicker}</p>
      <h2 className="doc-title serif">
        <a href={`#${id}`}>{title}</a>
      </h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, k) => (
                <td key={k}>{k === 0 ? <b>{c}</b> : c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ file, text }: { file: string; text: string }) {
  return (
    <figure className="code">
      <figcaption className="mono">{file}</figcaption>
      <pre className="mono">{text}</pre>
    </figure>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return <p className="callout">{children}</p>;
}
