"use client";

import { ReactorProvider } from "@reactor-team/js-sdk";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Deck } from "@/components/studio/Deck";
import { Ledger } from "@/components/studio/Ledger";
import { Stage } from "@/components/studio/Stage";
import { Transport } from "@/components/studio/Transport";
import { useUnstill, type Unstill } from "@/hooks/use-unstill";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, REACTOR_API_URL, requestReactorJwt } from "@/lib/orbis";

import "./studio.css";

// Stable references: the provider rebuilds its Reactor when these change identity.
const TRACKS = [...ORBIS_TRACKS];
const CONNECT_OPTIONS = { autoConnect: false };

export function Studio() {
  const jwt = useRef<Promise<string> | null>(null);
  const getJwt = useCallback(() => {
    jwt.current ??= requestReactorJwt().catch((e) => {
      jwt.current = null;
      throw e;
    });
    return jwt.current;
  }, []);
  const clearJwt = useCallback(() => {
    jwt.current = null;
  }, []);

  return (
    <ReactorProvider
      apiUrl={REACTOR_API_URL}
      modelName={ORBIS_MODEL_NAME}
      modelTracks={TRACKS}
      connectOptions={CONNECT_OPTIONS}
      jwtToken={getJwt}
    >
      <StudioBody getJwt={getJwt} onDisconnect={clearJwt} />
    </ReactorProvider>
  );
}

type Tab = "direct" | "takes" | "log";

function StudioBody({ getJwt, onDisconnect }: { getJwt: () => Promise<string>; onDisconnect: () => void }) {
  const u = useUnstill(getJwt);
  const [tab, setTab] = useState<Tab>("direct");

  // A fresh session needs a fresh token.
  useEffect(() => {
    if (u.status === "disconnected") onDisconnect();
  }, [u.status, onDisconnect]);

  return (
    <div className="studio" data-tab={tab}>
      <Masthead u={u} />
      <main className="studio-grid">
        <section className="stage-col" aria-label="Live picture">
          <Stage u={u} />
          <Transport u={u} />
          {(u.error || u.notice) && (
            <div className={`banner ${u.error ? "banner-error" : ""}`} role={u.error ? "alert" : "status"}>
              <span>{u.error || u.notice}</span>
              {u.error && (
                <button className="banner-close" onClick={u.clearError} aria-label="Dismiss">
                  Dismiss
                </button>
              )}
            </div>
          )}
        </section>

        <nav className="tabs" aria-label="Panels">
          {(["direct", "takes", "log"] as Tab[]).map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)} aria-pressed={tab === t}>
              {t === "direct" ? "Direct" : t === "takes" ? `Takes${u.takes.length ? ` ${u.takes.length}` : ""}` : "Watch log"}
            </button>
          ))}
        </nav>

        <aside className="deck-col panel-direct" aria-label="Direction deck">
          <Deck u={u} />
        </aside>

        <Ledger u={u} />
      </main>
    </div>
  );
}

function Masthead({ u }: { u: Unstill }) {
  const take = u.takes.find((t) => t.id === u.activeTakeId);
  const live = u.phase === "live";
  return (
    <header className="masthead">
      <Link href="/" className="wordmark" aria-label="UNSTILL, back to the brief">
        UNSTILL
      </Link>
      <dl className="slate mono">
        <div>
          <dt>Watch</dt>
          <dd>{u.watch ? u.watch.name.replace("The ", "") : "Photo"}</dd>
        </div>
        <div>
          <dt>Take</dt>
          <dd>{u.replayTake ? `${u.replayTake.number}R` : take ? take.number : "--"}</dd>
        </div>
        <div>
          <dt>Seed</dt>
          <dd>{u.seed}</dd>
        </div>
        <div>
          <dt>Chunk</dt>
          <dd>{u.phase === "idle" ? "--" : String(u.chunk).padStart(3, "0")}</dd>
        </div>
      </dl>
      <div className={`tally ${live ? "on" : ""} ${u.phase === "paused" ? "held" : ""}`}>
        <span className="tally-dot" aria-hidden />
        <span className="mono">
          {u.phase === "live" ? "Live" : u.phase === "paused" ? "Held" : u.phase === "rolling" ? "Rolling" : u.connected ? "Ready" : "Offline"}
        </span>
      </div>
    </header>
  );
}
