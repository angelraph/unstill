"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { takeLink } from "@/lib/take";
import { postToTake, type WallPost } from "@/lib/wall";

const STILL: Record<string, string> = { corner: "/stills/corner.jpg", aisle: "/stills/aisle.jpg", bay: "/stills/bay.jpg" };

type State = { status: "loading" } | { status: "off" } | { status: "error"; message: string } | { status: "ready"; posts: WallPost[] };

export function WallGrid() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let live = true;
    fetch("/api/wall", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { enabled?: boolean; posts?: WallPost[]; error?: string }) => {
        if (!live) return;
        if (!j.enabled) setState({ status: "off" });
        else if (j.error) setState({ status: "error", message: j.error });
        else setState({ status: "ready", posts: j.posts ?? [] });
      })
      .catch((e: Error) => live && setState({ status: "error", message: e.message }));
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="wall">
      <div className="wrap">
        {state.status === "loading" && <p className="wall-note mono">Loading the wall…</p>}
        {state.status === "off" && (
          <div className="panel">
            <h3>The wall is warming up</h3>
            <p>Storage is being connected. Until then, share any take with Copy link in the studio.</p>
          </div>
        )}
        {state.status === "error" && <p className="wall-note mono">The wall could not load: {state.message}</p>}
        {state.status === "ready" && state.posts.length === 0 && (
          <div className="panel">
            <h3>Nothing here yet</h3>
            <p>
              Direct a run in the studio, press Cut, then Post to the wall on your take. The first card is yours.
            </p>
            <Link href="/studio" className="pill pill-light">
              Open the studio
            </Link>
          </div>
        )}
        {state.status === "ready" && state.posts.length > 0 && (
          <ul className="wall-grid">
            {state.posts.map((p) => {
              const link = takeLink(postToTake(p));
              const path = link.slice(link.indexOf("/studio"));
              return (
                <li key={p.id} className="wall-card">
                  <a href={path} className="wall-still" aria-label={`Replay ${p.title}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={STILL[p.watchId] ?? STILL.corner} alt="" loading="lazy" />
                    <span className="wall-seed mono">Seed {p.seed}</span>
                  </a>
                  <div className="wall-body">
                    <p className="wall-meta mono">
                      {p.watchName} · {p.beats.length} {p.beats.length === 1 ? "beat" : "beats"} ·{" "}
                      {new Date(p.at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </p>
                    <h3>{p.title}</h3>
                    <p className="wall-author">by {p.author}</p>
                    <ol className="wall-beats">
                      {p.beats.slice(0, 6).map((b, i) => (
                        <li key={i}>
                          <span className="mono">{String(b.chunk).padStart(3, "0")}</span> {b.label}
                        </li>
                      ))}
                      {p.beats.length > 6 && <li className="wall-more mono">and {p.beats.length - 6} more</li>}
                    </ol>
                    <a href={path} className="pill pill-light">
                      Replay or branch it
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
