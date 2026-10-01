"use client";

import { useCallback } from "react";

import { useRecorder } from "@/hooks/use-recorder";
import type { Unstill } from "@/hooks/use-unstill";

export function Transport({ u }: { u: Unstill }) {
  const name = useCallback(
    () => `unstill-${u.watch?.id ?? "photo"}-seed${u.seed}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.webm`,
    [u.watch, u.seed],
  );
  const rec = useRecorder(u.tracks, name);
  const idle = u.phase === "idle";
  const running = u.phase === "live" || u.phase === "paused";
  const needsPhoto = !u.watch && !u.photo;

  return (
    <div className="transport">
      <div className="transport-main">
        {idle ? (
          <button
            className="btn btn-roll"
            onClick={u.roll}
            disabled={u.busy || needsPhoto || u.status === "connecting"}
            title={needsPhoto ? "Add a photograph first" : "Start the world (Space)"}
          >
            <span className="roll-dot" aria-hidden />
            {u.busy || u.status === "connecting" ? "Connecting" : "Roll"}
            <kbd className="mono btn-kbd">Space</kbd>
          </button>
        ) : u.phase === "rolling" ? (
          <button className="btn btn-roll" disabled>
            <span className="roll-dot" aria-hidden />
            Rolling
          </button>
        ) : (
          <>
            {u.phase === "paused" ? (
              <button className="btn" onClick={u.resume} disabled={u.busy} title="Resume (Space)">
                Resume
                <kbd className="mono btn-kbd">Space</kbd>
              </button>
            ) : (
              <button className="btn" onClick={u.pause} disabled={u.busy} title="Hold the picture (Space)">
                Hold
                <kbd className="mono btn-kbd">Space</kbd>
              </button>
            )}
            <button className="btn btn-cut" onClick={u.cut} disabled={u.busy}>
              Cut
            </button>
          </>
        )}

        <button className={`btn ${u.muted ? "" : "btn-on"}`} onClick={u.toggleMuted} aria-pressed={!u.muted}>
          {u.muted ? "Sound off" : "Sound on"}
        </button>

        {rec.supported && (
          <button
            className={`btn ${rec.recording ? "btn-rec" : ""}`}
            onClick={rec.recording ? rec.stop : rec.start}
            disabled={!running || !rec.canRecord}
            title="Record the live picture to a .webm file"
          >
            {rec.recording ? `Stop ${fmt(rec.seconds)}` : "Record"}
          </button>
        )}
      </div>

      <div className="transport-side">
        <label className="field-inline">
          <span className="mono">Seed</span>
          <input
            type="number"
            min={0}
            value={u.seed}
            disabled={!idle}
            onChange={(e) => u.setSeed(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
        <label className="field-inline">
          <span className="mono">Out</span>
          <select value={u.resolution} disabled={!idle} onChange={(e) => u.setResolution(e.target.value)}>
            <option value="">Default</option>
            {u.availableResolutions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        {u.connected && idle && (
          <button className="btn btn-quiet" onClick={u.disconnect} disabled={u.busy}>
            Release GPU
          </button>
        )}
      </div>
    </div>
  );
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
