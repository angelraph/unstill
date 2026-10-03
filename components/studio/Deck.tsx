"use client";

import { useEffect, useRef, useState } from "react";

import type { Unstill } from "@/hooks/use-unstill";
import { AXES, AXIS_ORDER, PHOTO_WATCH_ID, WATCHES, optionFor, type Axis } from "@/lib/watches";

const EVENT_KEYS = ["5", "6", "7", "8"];
const SHORT: Record<string, string> = { corner: "Street", aisle: "Store", bay: "Warehouse" };
const PHOTO_LINE = "Upload any photograph. It becomes the first frame, then the world starts moving.";

export function Deck({ u }: { u: Unstill }) {
  const idle = u.phase === "idle";
  const live = u.phase === "live" || u.phase === "paused";
  useShortcuts(u);

  return (
    <div className="deck">
      <Section title="Watch" hint={idle ? "Lock a place" : "Locked for this take"}>
        <div className="watches" role="radiogroup" aria-label="Watch">
          {WATCHES.map((w) => (
            <button
              key={w.id}
              role="radio"
              aria-checked={u.watchId === w.id}
              className={`watch ${u.watchId === w.id ? "on" : ""}`}
              onClick={() => u.chooseWatch(w.id)}
              disabled={!idle}
            >
              <span className="watch-name serif">{w.name.replace("The ", "")}</span>
              <span className="watch-sector mono">{SHORT[w.id] ?? w.sector}</span>
            </button>
          ))}
          <button
            role="radio"
            aria-checked={u.watchId === PHOTO_WATCH_ID}
            className={`watch ${u.watchId === PHOTO_WATCH_ID ? "on" : ""}`}
            onClick={() => u.chooseWatch(PHOTO_WATCH_ID)}
            disabled={!idle}
          >
            <span className="watch-name serif">Photo</span>
            <span className="watch-sector mono">Upload</span>
          </button>
        </div>
        <WatchAbout watchId={u.watchId} />
        {u.watchId === PHOTO_WATCH_ID && <PhotoInput u={u} disabled={!idle} />}
      </Section>

      {AXIS_ORDER.map((axis) => (
        <AxisRow key={axis} axis={axis} u={u} />
      ))}

      {u.watch && (
        <Section title="Events" hint={live ? "One action, then let it land" : "Available once live"}>
          <div className="pads">
            {u.watch.events.map((ev, i) => (
              <button key={ev.id} className="pad" onClick={() => u.trigger(ev.id)} disabled={!live || Boolean(u.replayTake)} title={ev.prompt}>
                <span>{ev.label}</span>
                <kbd className="mono">{EVENT_KEYS[i]}</kbd>
              </button>
            ))}
          </div>
        </Section>
      )}

      {u.watch && (
        <Section title="Cue sheet" hint={u.watch.cue.title}>
          <ol className="cue">
            {u.watch.cue.steps.map((step, i) => {
              const label =
                step.kind === "axis"
                  ? `${AXES[step.axis].label}: ${optionFor(step.axis, step.value).label}`
                  : u.watch!.events.find((e) => e.id === step.id)?.label ?? step.id;
              const state = u.cueIndex === null ? "" : i < u.cueIndex ? "done" : i === u.cueIndex ? "next" : "";
              return (
                <li key={i} className={state}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </li>
              );
            })}
          </ol>
          {u.cueIndex === null ? (
            <button className="btn btn-wide" onClick={u.runCue} disabled={!live || Boolean(u.replayTake)}>
              Run cue sheet
            </button>
          ) : (
            <button className="btn btn-wide" onClick={u.stopCue}>
              Stop cue sheet
            </button>
          )}
        </Section>
      )}

      <BeatInput u={u} live={live} />

      <Section title="Queue" hint="Released one per settle window">
        {u.queue.length === 0 ? (
          <p className="empty">{live ? "Clear. The next directive goes out at the next chunk boundary." : "Directives queue here while the world runs."}</p>
        ) : (
          <ul className="queue">
            {u.queue.map((q, i) => (
              <li key={q.id}>
                <span className="mono">{i === 0 ? "Next" : `+${i}`}</span>
                <span>{q.label}</span>
                <button className="x" onClick={() => u.dropQueued(q.id)} aria-label={`Drop ${q.label}`}>
                  Drop
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={idle ? "Opening prompt" : "Last prompt sent"} hint="Exactly what Orbis receives">
        <p className="inspector mono">{idle ? u.opening : u.lastPrompt}</p>
      </Section>
    </div>
  );
}

function WatchAbout({ watchId }: { watchId: string }) {
  const w = WATCHES.find((x) => x.id === watchId);
  return (
    <p className="watch-about">
      {w ? w.logline : PHOTO_LINE}
      <span className="mono">{w ? `For ${w.sector.toLowerCase()}` : "Your own place"}</span>
    </p>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <header className="section-head">
        <h3>{title}</h3>
        {hint && <span className="section-hint">{hint}</span>}
      </header>
      {children}
    </section>
  );
}

function AxisRow({ axis, u }: { axis: Axis; u: Unstill }) {
  const { label, options } = AXES[axis];
  const queued = u.queue.some((q) => q.label.startsWith(`${label}:`));
  return (
    <Section title={label} hint={queued ? "Queued" : undefined}>
      <div className="seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={u.target[axis] === o.value}
            className={u.target[axis] === o.value ? "on" : ""}
            onClick={() => u.direct(axis, o.value)}
            disabled={u.phase === "rolling" || Boolean(u.replayTake)}
          >
            <span>{o.label}</span>
            <kbd className="mono">{o.key.toUpperCase()}</kbd>
          </button>
        ))}
      </div>
    </Section>
  );
}

function PhotoInput({ u, disabled }: { u: Unstill; disabled: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="photo">
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void u.choosePhoto(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <button className="btn btn-wide" onClick={() => input.current?.click()} disabled={disabled}>
        {u.photo ? "Replace photograph" : "Choose a photograph"}
      </button>
      <label className="field">
        <span>What is in it (needed, Orbis holds to these words)</span>
        <input
          type="text"
          placeholder={u.describing ? "Describing the photograph…" : "A quiet harbor with fishing boats at low tide"}
          value={u.caption}
          maxLength={160}
          disabled={disabled || u.describing}
          onChange={(e) => u.setCaption(e.target.value)}
        />
      </label>
      <p className="fine">
        Cropped to 16:9 in your browser before upload, so nothing is squashed. When set up, the description is written for
        you; change any word you like.
      </p>
    </div>
  );
}

function BeatInput({ u, live }: { u: Unstill; live: boolean }) {
  const [text, setText] = useState("");
  return (
    <Section title="Write a beat" hint="One visible change">
      <form
        className="beat"
        onSubmit={(e) => {
          e.preventDefault();
          if (u.writeBeat(text)) setText("");
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A dog runs across the street"
          disabled={!live || Boolean(u.replayTake)}
          maxLength={240}
          aria-label="Beat"
        />
        <button className="btn" type="submit" disabled={!live || !text.trim() || Boolean(u.replayTake)}>
          Queue
        </button>
      </form>
    </Section>
  );
}

function useShortcuts(u: Unstill) {
  const ref = useRef(u);
  ref.current = u;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      const key = e.key.toLowerCase();
      const cur = ref.current;
      for (const axis of AXIS_ORDER) {
        const hit = AXES[axis].options.find((o) => o.key === key);
        if (hit) {
          e.preventDefault();
          cur.direct(axis, hit.value);
          return;
        }
      }
      const ev = EVENT_KEYS.indexOf(key);
      if (ev >= 0 && cur.watch?.events[ev]) {
        e.preventDefault();
        cur.trigger(cur.watch.events[ev].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
