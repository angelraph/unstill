"use client";

import { ReactorProvider } from "@reactor-team/js-sdk";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Deck } from "@/components/studio/Deck";
import { Ledger } from "@/components/studio/Ledger";
import { Stage } from "@/components/studio/Stage";
import { Transport } from "@/components/studio/Transport";
import { useUnstill, type Unstill } from "@/hooks/use-unstill";
import { useServerRecording } from "@/hooks/use-server-recording";
import { useVoice } from "@/hooks/use-voice";
import { featuredTake } from "@/lib/featured";
import { decodeTake, loadTakes } from "@/lib/take";
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
  const voice = useVoice(u);
  const [tab, setTab] = useState<Tab>("direct");
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  // Full quality MP4 of the session, recorded on Reactor's side.
  const hd = useServerRecording(getJwt);
  const { save: saveHd } = hd;
  // Test entry point (only with ?voicetest=1).
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("voicetest")) return;
    const w = window as unknown as { __unstillRecording?: () => Promise<string | null> };
    w.__unstillRecording = async () => {
      const blob = await saveHd("test.mp4", { trigger: false });
      return blob ? URL.createObjectURL(blob) : null;
    };
    return () => { delete w.__unstillRecording; };
  }, [saveHd]);

  // A fresh session needs a fresh token.
  useEffect(() => {
    if (u.status === "disconnected") onDisconnect();
  }, [u.status, onDisconnect]);

  // Open a Watch from a link such as /studio?watch=bay, or a shared take from /studio#take=...
  const { chooseWatch, importTake } = u;
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("watch");
    if (id) chooseWatch(id);
    const code = new URLSearchParams(window.location.hash.slice(1)).get("take");
    if (!code) return;
    const take = code === "featured" ? featuredTake() : decodeTake(code);
    if (!take) return;
    const stored = loadTakes();
    const number = stored.find((t) => t.id === take.id)?.number ?? (stored[0]?.number ?? 0) + 1;
    importTake({ ...take, number });
    chooseWatch(take.watchId);
    setTab("takes");
  }, [chooseWatch, importTake]);

  // Filmstrip: grab a frame from the live picture once each beat has had time to land.
  const latestId = u.log[0]?.id;
  useEffect(() => {
    if (!latestId) return;
    const timer = setTimeout(() => {
      const video = document.querySelector<HTMLVideoElement>(".frame video");
      if (!video || !video.videoWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 135;
      canvas.getContext("2d")?.drawImage(video, 0, 0, 240, 135);
      try {
        const data = canvas.toDataURL("image/jpeg", 0.7);
        setThumbs((t) => ({ ...t, [latestId]: data }));
      } catch {
        // a tainted canvas leaves the log without a thumbnail
      }
    }, 3600);
    return () => clearTimeout(timer);
  }, [latestId]);

  const message = u.error ? friendly(u.error) : u.notice;

  return (
    <div className="studio" data-tab={tab}>
      <Masthead u={u} />
      <main className="studio-grid">
        <section className="stage-col" aria-label="Live picture">
          <Stage u={u} voice={voice} />
          <Transport u={u} voice={voice} hd={hd} />
          {hd.state === "error" && (
            <div className="banner banner-error" role="alert">
              <span>The HD video could not be saved: {hd.error}</span>
            </div>
          )}
          {voice.error && <div className="banner banner-error" role="alert"><span>{voice.error}</span></div>}
          {(u.error || u.notice) && (
            <div className={`banner ${u.error ? "banner-error" : ""}`} role={u.error ? "alert" : "status"}>
              <span>{message}</span>
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

        <Ledger u={u} thumbs={thumbs} />
      </main>
    </div>
  );
}

function friendly(error: string) {
  if (/credits_depleted|402/.test(error)) {
    return "The Reactor account behind this studio is out of credits, so a live session cannot start. Add credits at reactor.inc or contact support@visko.ai.";
  }
  if (/REACTOR_API_KEY/.test(error)) return error;
  if (/401|unauthori/i.test(error)) return "The Reactor key was rejected. Check REACTOR_API_KEY and redeploy.";
  return error;
}

function Masthead({ u }: { u: Unstill }) {
  const take = u.takes.find((t) => t.id === u.activeTakeId);
  const live = u.phase === "live";
  return (
    <header className="masthead">
      <Link href="/" className="wordmark" aria-label="UNSTILL home">
        <Logo size={24} />
      </Link>
      <nav className="studio-links" aria-label="Site">
        <Link href="/watches">Watches</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/faq">FAQ</Link>
      </nav>
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
      {u.phase === "idle" ? (
        <button className="tally tally-go" onClick={u.roll} disabled={u.busy || (!u.watch && !u.photo)}>
          <span className="tally-dot" aria-hidden />
          <span className="mono">{u.busy ? "Connecting" : "Go live"}</span>
        </button>
      ) : (
        <div className={`tally ${live ? "on" : ""} ${u.phase === "paused" ? "held" : ""}`}>
          <span className="tally-dot" aria-hidden />
          <span className="mono">{u.phase === "live" ? "Live" : u.phase === "paused" ? "Held" : "Rolling"}</span>
        </div>
      )}
    </header>
  );
}
