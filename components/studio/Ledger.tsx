"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Unstill } from "@/hooks/use-unstill";
import { exportTake, parseTake, takeLink, type Take } from "@/lib/take";

/** Counterfactuals: replay the shared past up to a beat, then direct a different future. */
function Branch({ take, u, idle }: { take: Take; u: Unstill; idle: boolean }) {
  const [keep, setKeep] = useState(Math.max(0, take.beats.length - 1));
  if (take.beats.length === 0) return null;
  return (
    <div className="branch">
      <label className="branch-label mono" htmlFor={`br-${take.id}`}>
        What if, after
      </label>
      <select id={`br-${take.id}`} value={keep} onChange={(e) => setKeep(Number(e.target.value))} disabled={!idle}>
        <option value={0}>the opening</option>
        {take.beats.slice(0, -1).map((b, i) => (
          <option key={i} value={i + 1}>
            {b.label} (ch {b.chunk})
          </option>
        ))}
      </select>
      <button className="btn btn-small" onClick={() => u.replay(take, keep)} disabled={!idle || u.busy} title="Replay the same world up to this beat, then direct it differently">
        Branch
      </button>
    </div>
  );
}

function CopyLink({ take }: { take: Take }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn btn-small"
      disabled={take.anchored}
      title={take.anchored ? "Takes that open on a photograph cannot be shared as a link" : "Copy a link that replays this take"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(takeLink(take));
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          window.prompt("Copy this link", takeLink(take));
        }
      }}
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}

let wallProbe: Promise<boolean> | null = null;
function useWallEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    wallProbe ??= fetch("/api/wall")
      .then((r) => r.json())
      .then((j: { enabled?: boolean }) => Boolean(j.enabled))
      .catch(() => false);
    let live = true;
    void wallProbe.then((v) => live && setEnabled(v));
    return () => {
      live = false;
    };
  }, []);
  return enabled;
}

/** Share a take on the public wall, where anyone can replay it or branch it. */
function PostToWall({ take }: { take: Take }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`${take.watchName.replace(/ · branch of .*$/, "")}, seed ${take.seed}`);
  const [author, setAuthor] = useState("");
  const [state, setState] = useState<"idle" | "posting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const blocked = take.anchored ? "Photo takes stay private" : take.beats.length === 0 ? "Direct a beat first" : "";

  if (state === "done") {
    return (
      <p className="wall-posted mono">
        On the wall. <Link href="/wall">See it</Link>
      </p>
    );
  }
  if (!open) {
    return (
      <button className="btn btn-small btn-quiet" onClick={() => setOpen(true)} disabled={Boolean(blocked)} title={blocked || "Share this take so anyone can replay or branch it"}>
        Post to the wall
      </button>
    );
  }
  return (
    <form
      className="wall-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("posting");
        try {
          const r = await fetch("/api/wall", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ take, title, author }),
          });
          const j = (await r.json()) as { error?: string };
          if (!r.ok) throw new Error(j.error || "The wall did not take it.");
          setState("done");
        } catch (err) {
          setMessage((err as Error).message);
          setState("error");
        }
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="Title" aria-label="Title" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={24} placeholder="Your name (optional)" aria-label="Your name" />
      <button className="btn btn-small" type="submit" disabled={state === "posting"}>
        {state === "posting" ? "Posting" : "Post"}
      </button>
      <button className="btn btn-small btn-quiet" type="button" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {state === "error" && <p className="wall-error">{message}</p>}
    </form>
  );
}

export function Ledger({ u, thumbs }: { u: Unstill; thumbs: Record<string, string> }) {
  return (
    <div className="ledger">
      <WatchLog u={u} thumbs={thumbs} />
      <Takes u={u} />
    </div>
  );
}

function WatchLog({ u, thumbs }: { u: Unstill; thumbs: Record<string, string> }) {
  return (
    <section className="ledger-panel panel-log" aria-label="Watch log">
      <header className="section-head">
        <h3>Watch log</h3>
        <span className="section-hint">Every prompt, stamped with the chunk it landed on</span>
      </header>
      {u.log.length === 0 ? (
        <p className="empty">Nothing yet. Roll a Watch and every directive is written here as it lands.</p>
      ) : (
        <ol className="log">
          {u.log.map((entry) => (
            <li key={entry.id} className={`log-${entry.kind}`}>
              <span className="log-chunk mono">{String(entry.chunk).padStart(3, "0")}</span>
              <div>
                <p className="log-label">{entry.label}</p>
                <p className="log-prompt">{entry.prompt}</p>
              </div>
              {thumbs[entry.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="log-thumb" src={thumbs[entry.id]} alt={`Frame after ${entry.label}`} />
              ) : (
                <span className="log-thumb log-thumb-empty" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Takes({ u }: { u: Unstill }) {
  const input = useRef<HTMLInputElement>(null);
  const idle = u.phase === "idle";
  const wall = useWallEnabled();

  return (
    <section className="ledger-panel panel-takes" aria-label="Takes">
      <header className="section-head">
        <h3>Takes</h3>
        <span className="section-hint">Same seed, same beats, same world</span>
      </header>

      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const take = parseTake(await file.text());
          if (take) u.importTake(take);
        }}
      />

      {u.takes.length === 0 ? (
        <p className="empty">Every run is kept as a take. Replay one to get the same world back, beat for beat.</p>
      ) : (
        <ul className="takes">
          {u.takes.map((t) => (
            <li key={t.id} className={t.id === u.activeTakeId ? "active" : ""}>
              <div className="take-head">
                <span className="take-no serif">{t.number}</span>
                <div>
                  <p className="take-title">
                    {t.watchName}
                    {t.anchored && <span className="badge mono">Photo</span>}
                    {t.id === u.activeTakeId && <span className="badge badge-live mono">Recording</span>}
                  </p>
                  <p className="take-meta mono">
                    Seed {t.seed} · {t.beats.length} {t.beats.length === 1 ? "beat" : "beats"} ·{" "}
                    {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="take-actions">
                <button className="btn btn-small" onClick={() => u.replay(t)} disabled={!idle || u.busy}>
                  Replay
                </button>
                <CopyLink take={t} />
                <button className="btn btn-small" onClick={() => exportTake(t)}>
                  Export
                </button>
                <button className="btn btn-small btn-quiet" onClick={() => u.deleteTake(t.id)} disabled={t.id === u.activeTakeId}>
                  Delete
                </button>
              </div>
              <Branch take={t} u={u} idle={idle} />
              {wall && t.id !== u.activeTakeId && <PostToWall take={t} />}
            </li>
          ))}
        </ul>
      )}
      <button className="btn btn-quiet btn-wide" onClick={() => input.current?.click()}>
        Import a take
      </button>
    </section>
  );
}
