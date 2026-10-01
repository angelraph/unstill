"use client";

import { useEffect, useRef, useState } from "react";

import type { Unstill } from "@/hooks/use-unstill";
import { exportTake, parseTake } from "@/lib/take";

export function Ledger({ u }: { u: Unstill }) {
  return (
    <div className="ledger">
      <WatchLog u={u} />
      <Takes u={u} />
    </div>
  );
}

function WatchLog({ u }: { u: Unstill }) {
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
  // Delete asks twice. The second press has to come within a few seconds.
  const [arming, setArming] = useState<string | null>(null);
  useEffect(() => {
    if (!arming) return;
    const timer = setTimeout(() => setArming(null), 3500);
    return () => clearTimeout(timer);
  }, [arming]);

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
          u.importTake(parseTake(await file.text()));
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
                <button className="btn btn-small" onClick={() => exportTake(t)}>
                  Export
                </button>
                <button
                  className={`btn btn-small btn-quiet ${arming === t.id ? "btn-armed" : ""}`}
                  onClick={() => {
                    if (arming === t.id) {
                      u.deleteTake(t.id);
                      setArming(null);
                    } else setArming(t.id);
                  }}
                  disabled={t.id === u.activeTakeId}
                >
                  {arming === t.id ? "Press again to delete" : "Delete"}
                </button>
              </div>
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
