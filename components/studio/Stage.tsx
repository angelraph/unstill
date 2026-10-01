"use client";

import { ReactorView } from "@reactor-team/js-sdk";
import { useRef, useState } from "react";

import { Animatic } from "@/components/studio/Animatic";

import type { Unstill } from "@/hooks/use-unstill";

export function Stage({ u }: { u: Unstill }) {
  const running = u.phase !== "idle";
  const latest = u.log[0];
  const showPicture = running && u.connected;
  const picker = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const canDrop = u.phase === "idle" && !u.busy;

  const takeFile = (file: File | undefined | null) => {
    if (file && file.type.startsWith("image/")) void u.choosePhoto(file);
  };

  return (
    <div className="stage">
      <div
        className={`frame ${dragging ? "dropping" : ""}`}
        onDragOver={(e) => {
          if (!canDrop || !Array.from(e.dataTransfer.types).includes("Files")) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(e) => {
          if (!canDrop) return;
          e.preventDefault();
          setDragging(false);
          takeFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={picker}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            takeFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {showPicture ? (
          <ReactorView
            track="main_video"
            audioTrack="main_audio"
            muted={u.muted}
            videoObjectFit="cover"
            className="picture"
          />
        ) : u.watch ? (
          <>
            <Animatic watchId={u.watch.id} world={u.target} />
            <div className="poster">
              <p className="poster-sector mono">{u.watch.sector}</p>
              <h2 className="poster-name serif">{u.watch.name}</h2>
              <p className="poster-line">{u.watch.logline}</p>
            </div>
          </>
        ) : u.photoUrl ? (
          <>
            <Animatic watchId={null} world={u.target} photoUrl={u.photoUrl} />
            <div className="poster poster-photo">
              <p className="poster-sector mono">Your photograph · first frame</p>
              <button className="btn btn-small btn-glass" onClick={() => picker.current?.click()} disabled={!canDrop}>
                Replace
              </button>
            </div>
          </>
        ) : (
          <button className="poster poster-empty" onClick={() => picker.current?.click()} disabled={!canDrop}>
            <p className="poster-sector mono">Your photograph</p>
            <h2 className="poster-name serif">Bring a still.</h2>
            <p className="poster-line">
              Drop an image anywhere on this frame, or click to choose one. Orbis opens on that exact frame, then you
              direct it.
            </p>
          </button>
        )}

        {dragging && (
          <div className="dropzone">
            <span className="serif">Drop to set the first frame</span>
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
              {u.phase === "paused" ? (
                <span className="chip chip-held mono">Held</span>
              ) : (
                u.queue.length > 0 && <span className="chip mono">{u.queue.length} queued</span>
              )}
            </div>
            {latest && (
              <div className="caption" key={latest.id}>
                <span className="caption-chunk mono">Ch {String(latest.chunk).padStart(3, "0")}</span>
                <span className="caption-label">{latest.label}</span>
              </div>
            )}
          </>
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
