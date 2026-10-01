import Link from "next/link";

import { Logo } from "@/components/site/Logo";

const COLUMNS = [
  {
    title: "Direct",
    links: [
      { href: "/studio", label: "Studio" },
      { href: "/watches", label: "Watches" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/docs#quickstart", label: "Quickstart" },
      { href: "/docs#controls", label: "Controls and keys" },
      { href: "/docs#takes", label: "Take files" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/docs#run-locally", label: "Run it locally" },
      { href: "/docs#deploy", label: "Deploy" },
      { href: "/docs#orbis", label: "Orbis command flow" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-call">
          <p className="foot-line serif">
            Stop rendering clips.
            <br />
            <em>Start keeping watch.</em>
          </p>
          <Link href="/studio" className="btn-pill btn-pill-light">
            Open the studio
          </Link>
        </div>
        <div className="foot-cols">
          <div className="foot-brand">
            <Logo tagline className="foot-logo" />
            <p>A live direction deck for places, built on Visko Orbis.</p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="foot-title mono">{c.title}</p>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="foot-small">
          <span>Live picture by Visko Orbis Stable, streamed through Reactor.</span>
          <span>Made for the Visko Orbis Online Challenge, 2026.</span>
        </div>
      </div>
    </footer>
  );
}
