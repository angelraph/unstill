import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about UNSTILL: what it is, how live direction works, credits, photographs, takes and privacy.",
};

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "The idea",
    items: [
      [
        "What is UNSTILL?",
        "A live direction deck for places. You choose a place or bring a photograph, Orbis streams it live, and you change the hour, weather, crowd and camera while it keeps running.",
      ],
      [
        "How is this different from a video generator?",
        "A generator gives you a finished clip. Change one thing and you render a new clip with a new street. UNSTILL keeps one world running and changes it in place, so the taxi you saw at dusk is still at the curb at night.",
      ],
      [
        "Who is it for?",
        "Filmmakers scouting and previsualizing, retail teams staging stores, robotics teams rehearsing edge cases, and anyone who wants to see a familiar place under different conditions.",
      ],
    ],
  },
  {
    title: "Live direction",
    items: [
      [
        "Is the video real or pre rendered?",
        "Real. Every frame comes from a live Visko Orbis session over WebRTC. Nothing in the studio is a stock loop or a recording.",
      ],
      [
        "Why does a change take a moment to appear?",
        "Orbis generates in chunks of about 1.8 seconds and morphs at their edges. The studio waits for the next boundary, and leaves two chunks between changes so each one lands cleanly.",
      ],
      [
        "Do I ever have to write a prompt?",
        "No. Every control writes its own prompt. If you want something the deck does not offer, Write a beat lets you add one line in plain words.",
      ],
      [
        "Can I see what is sent to Orbis?",
        "Yes. The inspector in the deck shows the exact prompt, and the Watch log lists every prompt with the chunk it landed on.",
      ],
    ],
  },
  {
    title: "Takes and photographs",
    items: [
      [
        "Will a replayed take look exactly the same?",
        "Orbis produces the same video for the same seed and prompt sequence. A replay uses the same seed and sends each beat at the same chunk, so it comes back as closely as the timing allows.",
      ],
      [
        "Where are my takes stored?",
        "In your browser. Export a take to keep it as a file or move it to another machine.",
      ],
      [
        "What happens to my photograph?",
        "It is cropped in your browser and uploaded only to your own Orbis session to be used as the first frame. UNSTILL has no database and keeps nothing.",
      ],
    ],
  },
  {
    title: "Access and cost",
    items: [
      [
        "Does it cost anything to use?",
        "Live sessions run on GPUs billed by Reactor per second. Cut when you are done and use Release GPU to end the session.",
      ],
      [
        "The studio says credits are depleted.",
        "The Reactor account behind this deployment is out of credits. Self host with your own key, or contact support@visko.ai.",
      ],
      [
        "Can I run it myself?",
        "Yes. Clone the repository, add a Reactor API key to .env.local and run npm run dev. The docs cover Vercel too.",
      ],
    ],
  },
];

export default function Faq() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow-blue mono">FAQ</p>
          <h1 className="h1">
            Questions, <em>answered.</em>
          </h1>
          <p className="lede">The short version of how UNSTILL works, what it costs, and what happens to your photographs.</p>
        </div>
      </section>

      <div className="faq">
        {GROUPS.map((g) => (
          <section key={g.title} className="faq-group">
            <p className="kicker mono">{g.title}</p>
            {g.items.map(([q, a], i) => (
              <details key={q} className="qa" open={g.title === "The idea" && i === 0}>
                <summary>{q}</summary>
                <div className="qa-a">
                  <p>{a}</p>
                </div>
              </details>
            ))}
          </section>
        ))}

        <div className="faq-cta">
          <div>
            <h3>Still curious?</h3>
            <p>The docs cover every control, shortcut and setting.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/docs" className="pill pill-ghost">
              Read the docs
            </Link>
            <Link href="/studio" className="pill pill-light">
              Open the studio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
