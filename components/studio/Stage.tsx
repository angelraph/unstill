"use client";

import { ReactorView } from "@reactor-team/js-sdk";

import type { Unstill } from "@/hooks/use-unstill";
import type { useVoice } from "@/hooks/use-voice";

export function Stage({ u, voice }: { u: Unstill; voice: ReturnType<typeof useVoice> }) {
  const running = u.phase !== "idle";
  const latest = u.log[0];
  const showPicture = running && u.connected;
  const heard = voice.heard;

  return (
    <div className="stage">
      <div className="frame">
        {showPicture ? (
          <ReactorView
            track="main_video"
            audioTrack="main_audio"
            muted={u.muted}
            videoObjectFit="cover"
            className="picture"
          />
        ) : u.watch ? (
          <div className="poster">
            <p className="poster-sector mono">{u.watch.sector}</p>
            <h2 className="poster-name serif">{u.watch.name}</h2>
            <p className="poster-line">{u.watch.logline}</p>
            {u.phase === "idle" && (
              <button className="poster-roll" onClick={u.roll} disabled={u.busy}>
                <span className="roll-dot" aria-hidden />
                {u.busy ? "Connecting" : "Roll · go live"}
              </button>
            )}
          </div>
        ) : u.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.photoUrl} alt="Your photograph, cropped to the frame Orbis will open on" className="picture still" />
        ) : (
          <div className="poster">
            <p className="poster-sector mono">Your photograph</p>
            <h2 className="poster-name serif">Bring a still.</h2>
            <p className="poster-line">Any place you have stood. Orbis opens on that exact frame, then you direct it.</p>
          </div>
        )}

        {u.phase === "rolling" && (
          <div className="veil">
            <span className="spinner" aria-hidden />
            <span className="mono">{u.photo && !u.watch ? "Anchoring the photograph" : "Building the world"}</span>
          </div>
        )}

        {running && u.phase !== "rolling" && (
          <>
            <div className="overlay-top">
              <span className="chip mono">
                {u.anchored ? "Anchored to photo" : "Text opening"}
                {u.chunkSeconds ? ` · ${u.chunkSeconds.toFixed(1)}s chunks` : ""}
              </span>
              {u.queue.length > 0 && <span className="chip mono">{u.queue.length} queued</span>}
            </div>
            {latest && (
              <div className="caption" key={latest.id}>
                <span className="caption-chunk mono">Ch {String(latest.chunk).padStart(3, "0")}</span>
                <span className="caption-label">{latest.label}</span>
              </div>
            )}
          </>
        )}

        {voice.listening && (
          <div className="voice-caption" key={heard?.id ?? "live"}>
            <span className="voice-dot" aria-hidden />
            {voice.interim ? (
              <span className="voice-text">{voice.interim}…</span>
            ) : heard ? (
              <>
                <span className="voice-text">“{heard.text}”</span>
                <span className="voice-arrow">{heard.actions.length ? "→" : ""}</span>
                <span className="voice-acts">
                  {heard.actions.length ? heard.actions.map((a) => a.label).join(" · ") : "No cue heard"}
                </span>
              </>
            ) : (
              <span className="voice-text">Say “action”, then “rain”, “night”, “cab stops”, “cut”</span>
            )}
          </div>
        )}
      </div>
      <ChunkRail chunk={u.chunk} running={running && u.phase !== "rolling"} lastAt={latest?.chunk ?? 0} />
    </div>
  );
}

/** One tick per chunk. Ticks since the last directive show the morph settling. */
function ChunkRail({ chunk, running, lastAt }: { chunk: number; running: boolean; lastAt: number }) {
  const span = 24;
  const start = Math.max(0, chunk - span + 1);
  return (
    <div className="rail" aria-hidden>
      {Array.from({ length: span }, (_, i) => {
        const index = start + i;
        const past = running && index <= chunk;
        const mark = running && index === lastAt;
        return <span key={i} className={`tick ${past ? "past" : ""} ${mark ? "mark" : ""}`} />;
      })}
    </div>
  );
}
