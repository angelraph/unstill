"use client";

import { useReactor, useReactorMessage } from "@reactor-team/js-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { compileOpening, compilePhotoOpening, compileShift, PHOTO_NOUNS } from "@/lib/compiler";
import { cropTo169 } from "@/lib/image";
import { SETTLE_CHUNKS, unwrapOrbisMessage, type OrbisMessage } from "@/lib/orbis";
import { loadTakes, newSeed, saveTakes, type Take } from "@/lib/take";
import {
  AXES,
  optionFor,
  PHOTO_WATCH_ID,
  WATCHES,
  watchById,
  type Axis,
  type CueStep,
  type WorldState,
} from "@/lib/watches";

export type Phase = "idle" | "rolling" | "live" | "paused";

type QueueItem =
  | { id: string; kind: "axis"; axis: Axis; value: string }
  | { id: string; kind: "event"; eventId: string; label: string; prompt: string }
  | { id: string; kind: "line"; label: string; prompt: string };

export type LogEntry = {
  id: string;
  chunk: number;
  label: string;
  prompt: string;
  kind: "opening" | "axis" | "event" | "line" | "replay" | "system";
  at: number;
};

export type QueueView = { id: string; label: string };

const DEFAULT_WORLD: WorldState = { hour: "dusk", weather: "clear", crowd: "sparse", camera: "static" };

let idCounter = 0;
const uid = () => `${Date.now().toString(36)}${(idCounter++).toString(36)}`;

function labelFor(item: QueueItem) {
  if (item.kind === "axis") return `${AXES[item.axis].label}: ${optionFor(item.axis, item.value).label}`;
  return item.label;
}

export function useUnstill(getJwt: () => Promise<string>) {
  const status = useReactor((s) => s.status);
  const lastError = useReactor((s) => s.lastError);
  const tracks = useReactor((s) => s.tracks);
  const connect = useReactor((s) => s.connect);
  const disconnect = useReactor((s) => s.disconnect);
  const sendCommand = useReactor((s) => s.sendCommand);
  const uploadFile = useReactor((s) => s.uploadFile);

  // Selection and directive state as the director sees it.
  const [watchId, setWatchId] = useState<string>(WATCHES[0].id);
  const [target, setTarget] = useState<WorldState>(WATCHES[0].initial);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [seed, setSeed] = useState<number>(0);
  const [resolution, setResolution] = useState("");
  const [availableResolutions, setAvailableResolutions] = useState<string[]>(["1080p", "2k", "4k"]);
  const [muted, setMuted] = useState(true);

  // Session state as Orbis reports it.
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [chunk, setChunk] = useState(0);
  const [fps, setFps] = useState(18);
  const [framesPerChunk, setFramesPerChunk] = useState(0);
  const [anchored, setAnchored] = useState<boolean | null>(null);
  const [queueView, setQueueView] = useState<QueueView[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [takes, setTakes] = useState<Take[]>([]);
  const [activeTakeId, setActiveTakeId] = useState<string | null>(null);
  const [cueIndex, setCueIndex] = useState<number | null>(null);
  const [replayTake, setReplayTake] = useState<Take | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  // Engine refs, read inside the message handler without stale closures.
  const phaseRef = useRef<Phase>("idle");
  const chunkRef = useRef(0);
  const lastSendChunkRef = useRef(-99);
  const liveRef = useRef<WorldState>(WATCHES[0].initial);
  const queueRef = useRef<QueueItem[]>([]);
  const sendingRef = useRef(false);
  const takeRef = useRef<Take | null>(null);
  const takesRef = useRef<Take[]>([]);
  const cueRef = useRef<{ steps: CueStep[]; index: number; releasedAt: number } | null>(null);
  const replayRef = useRef<{ take: Take; index: number; branch?: boolean } | null>(null);
  const pausePendingRef = useRef(false);
  const resumeWantedRef = useRef(false);
  const sendCommandRef = useRef(sendCommand);
  sendCommandRef.current = sendCommand;
  const photosByTake = useRef<Map<string, File>>(new Map());
  const conditionsResolver = useRef<(() => void) | null>(null);
  const imageResolver = useRef<(() => void) | null>(null);
  const prevStatus = useRef(status);

  const watch = watchId === PHOTO_WATCH_ID ? null : watchById(watchId) ?? null;
  const nouns = watch ? watch.nouns : PHOTO_NOUNS;
  const connected = status === "ready";

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  useEffect(() => {
    setSeed(newSeed());
    const stored = loadTakes();
    takesRef.current = stored;
    setTakes(stored);
  }, []);

  useEffect(() => {
    if (!photo) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    if (lastError) setError(lastError.message);
  }, [lastError]);

  const opening = useMemo(
    () => (watch ? compileOpening(watch, target) : compilePhotoOpening(caption, target)),
    [watch, target, caption],
  );

  const pushLog = useCallback((entry: Omit<LogEntry, "id" | "at">) => {
    setLog((current) => [{ ...entry, id: uid(), at: Date.now() }, ...current].slice(0, 80));
  }, []);

  const syncQueueView = useCallback(() => {
    setQueueView(queueRef.current.map((q) => ({ id: q.id, label: labelFor(q) })));
  }, []);

  const persistTake = useCallback(() => {
    const take = takeRef.current;
    if (!take) return;
    const others = takesRef.current.filter((t) => t.id !== take.id);
    const next = [{ ...take, beats: [...take.beats] }, ...others];
    takesRef.current = next;
    setTakes(next);
    saveTakes(next);
  }, []);

  const endRun = useCallback(
    (reason?: string) => {
      setPhase("idle");
      queueRef.current = [];
      cueRef.current = null;
      replayRef.current = null;
      sendingRef.current = false;
      setCueIndex(null);
      setReplayTake(null);
      syncQueueView();
      takeRef.current = null;
      setActiveTakeId(null);
      if (reason) setNotice(reason);
    },
    [setPhase, syncQueueView],
  );

  useEffect(() => {
    if (status === "disconnected" && prevStatus.current !== "disconnected") {
      if (phaseRef.current !== "idle") endRun("Session closed.");
    }
    prevStatus.current = status;
  }, [status, endRun]);

  /** Sends one following prompt and records it as a beat of the active take. */
  const sendBeat = useCallback(
    async (prompt: string, label: string, kind: LogEntry["kind"]) => {
      sendingRef.current = true;
      const at = chunkRef.current;
      lastSendChunkRef.current = at;
      try {
        const raw = await sendCommand("set_prompt", { prompt });
        const reply = raw ? unwrapOrbisMessage(raw) : null;
        if (reply?.type === "command_error") {
          setError(`set_prompt: ${reply.reason || "rejected"}`);
          return false;
        }
        setLastPrompt(prompt);
        pushLog({ chunk: at, label, prompt, kind });
        if (takeRef.current && kind !== "replay") {
          takeRef.current.beats.push({ chunk: at, label, prompt });
          persistTake();
        }
        return true;
      } finally {
        sendingRef.current = false;
      }
    },
    [sendCommand, pushLog, persistTake],
  );

  /** Releases at most one prompt per settle window. Called on every chunk boundary. */
  const pump = useCallback(async () => {
    if (phaseRef.current !== "live" || sendingRef.current) return;
    const now = chunkRef.current;
    if (now - lastSendChunkRef.current < SETTLE_CHUNKS) return;

    const replay = replayRef.current;
    if (replay) {
      const beat = replay.take.beats[replay.index];
      if (!beat) {
        replayRef.current = null;
        setReplayTake(null);
        setNotice(
          replay.branch
            ? `Branch point reached at chunk ${now}. Same world so far. Direct a different future.`
            : `Take ${replay.take.number} replayed in full.`,
        );
        return;
      }
      if (now >= beat.chunk) {
        replay.index += 1;
        await sendBeat(beat.prompt, beat.label, "replay");
      }
      return;
    }

    const cue = cueRef.current;
    if (cue && queueRef.current.length === 0) {
      const prev = cue.steps[cue.index - 1];
      const due = cue.index === 0 || now - cue.releasedAt >= (prev?.hold ?? 5);
      if (due) {
        const step = cue.steps[cue.index];
        if (!step) {
          cueRef.current = null;
          setCueIndex(null);
          setNotice("Cue sheet complete.");
        } else {
          cue.index += 1;
          cue.releasedAt = now;
          setCueIndex(cue.index);
          if (step.kind === "axis") {
            setTarget((t) => ({ ...t, [step.axis]: step.value }));
            queueRef.current.push({ id: uid(), kind: "axis", axis: step.axis, value: step.value });
          } else {
            const ev = watch?.events.find((e) => e.id === step.id);
            if (ev) queueRef.current.push({ id: uid(), kind: "event", eventId: ev.id, label: ev.label, prompt: ev.prompt });
          }
        }
      }
    }

    const item = queueRef.current.shift();
    syncQueueView();
    if (!item) return;

    if (item.kind === "axis") {
      if (liveRef.current[item.axis] === item.value) return;
      const prompt = compileShift(item.axis, item.value, nouns);
      const ok = await sendBeat(prompt, labelFor(item), "axis");
      if (ok) liveRef.current = { ...liveRef.current, [item.axis]: item.value };
    } else {
      await sendBeat(item.prompt, item.label, item.kind);
    }
  }, [sendBeat, syncQueueView, nouns, watch]);

  const pumpRef = useRef(pump);
  pumpRef.current = pump;

  const handleMessage = useCallback(
    (message: OrbisMessage) => {
      switch (message.type) {
        case "conditions_ready":
          conditionsResolver.current?.();
          conditionsResolver.current = null;
          break;
        case "state":
          if (message.has_image) {
            imageResolver.current?.();
            imageResolver.current = null;
          }
          if (message.available_resolutions?.length) {
            setAvailableResolutions(message.available_resolutions.map(String));
          }
          if (typeof message.current_chunk === "number") {
            chunkRef.current = message.current_chunk;
            setChunk(message.current_chunk);
          }
          if (message.started && message.paused && phaseRef.current === "live") setPhase("paused");
          break;
        case "generation_started":
          if (message.fps) setFps(message.fps);
          if (message.frames_per_chunk) setFramesPerChunk(message.frames_per_chunk);
          setAnchored(Boolean(message.image_conditioned));
          chunkRef.current = 0;
          setChunk(0);
          lastSendChunkRef.current = 0;
          setPhase("live");
          break;
        case "chunk_complete":
          if (typeof message.chunk_index === "number") {
            chunkRef.current = message.chunk_index;
            setChunk(message.chunk_index);
          }
          void pumpRef.current();
          break;
        case "generation_paused":
          pausePendingRef.current = false;
          setPhase("paused");
          // A resume asked for while the pause was still landing wins.
          if (resumeWantedRef.current) {
            resumeWantedRef.current = false;
            void sendCommandRef.current("resume", {});
          }
          break;
        case "generation_resumed":
          setPhase("live");
          break;
        case "generation_complete":
          endRun("The run reached its maximum length.");
          break;
        case "generation_reset":
          if (phaseRef.current !== "rolling") endRun();
          break;
        case "command_error":
          setError(`${message.command || "command"}: ${message.reason || "rejected"}`);
          if (message.command === "start" && phaseRef.current === "rolling") setPhase("idle");
          break;
      }
    },
    [endRun, setPhase],
  );

  useReactorMessage((raw) => handleMessage(unwrapOrbisMessage(raw)));

  const waitFor = (resolver: { current: (() => void) | null }, name: string, ms = 20_000) => {
    let timer: ReturnType<typeof setTimeout>;
    const promise = new Promise<void>((resolve, reject) => {
      timer = setTimeout(() => {
        resolver.current = null;
        reject(new Error(`Orbis did not report ${name} in time.`));
      }, ms);
      resolver.current = () => {
        clearTimeout(timer);
        resolve();
      };
    });
    return { promise, cancel: () => (clearTimeout(timer), (resolver.current = null)) };
  };

  const guard = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }, []);

  /** Upload, condition, prompt, start. The ordering Orbis requires for image to video. */
  const roll = useCallback(
    async (opts?: { prompt?: string; seed?: number; image?: File | null; take?: Take; label?: string; branchOf?: Take }) => {
      const runPrompt = opts?.prompt ?? opening;
      const runSeed = opts?.seed ?? seed;
      const runImage = opts?.image === undefined ? (watchId === PHOTO_WATCH_ID ? photo : null) : opts.image;
      if (watchId === PHOTO_WATCH_ID && !runImage && !opts?.take) {
        throw new Error("Add a photograph first.");
      }
      if (watchId === PHOTO_WATCH_ID && runImage && !opts?.take && caption.trim().length < 3) {
        throw new Error("Say what is in the photograph first, in a few words. Orbis holds to it.");
      }

      if (status !== "ready") await connect(await getJwt());
      setPhase("rolling");
      setAnchored(null);

      try {
        if (runImage) {
          const fileRef = await uploadFile(runImage, { name: runImage.name });
          const imageReady = waitFor(imageResolver, "the image");
          const raw = await sendCommand("set_image", { image: fileRef });
          const reply = raw ? unwrapOrbisMessage(raw) : null;
          if (!reply || reply.type === "command_error") {
            imageReady.cancel();
            throw new Error(`Orbis rejected the photograph${reply?.reason ? `: ${reply.reason}` : "."}`);
          }
          await imageReady.promise;
        }

        await sendCommand("set_seed", { seed: runSeed });
        if (resolution) await sendCommand("set_resolution", { resolution });

        const ready = waitFor(conditionsResolver, "conditions_ready");
        const raw = await sendCommand("set_prompt", { prompt: runPrompt });
        const reply = raw ? unwrapOrbisMessage(raw) : null;
        if (reply?.type === "command_error") {
          ready.cancel();
          throw new Error(`set_prompt: ${reply.reason || "rejected"}`);
        }
        await ready.promise;

        liveRef.current = { ...target };
        queueRef.current = [];
        syncQueueView();
        setLastPrompt(runPrompt);
        setLog([]);
        pushLog({ chunk: 0, label: opts?.label ?? "Opening", prompt: runPrompt, kind: "opening" });

        if (!opts?.take || opts.branchOf) {
          const number = (takesRef.current[0]?.number ?? 0) + 1;
          const parent = opts?.branchOf;
          const take: Take = {
            id: uid(),
            number,
            watchId: parent ? parent.watchId : watchId,
            watchName: parent ? `${parent.watchName.replace(/ · branch of .*$/, "")} · branch of ${parent.number}` : watch ? watch.name : "Your photograph",
            seed: runSeed,
            opening: runPrompt,
            openingLabel: parent ? parent.openingLabel : watch ? watch.name : "Your photograph",
            anchored: Boolean(runImage),
            createdAt: new Date().toISOString(),
            // A branch keeps the shared past; the new future is appended as it is directed.
            beats: opts?.take ? [...opts.take.beats] : [],
          };
          takeRef.current = take;
          setActiveTakeId(take.id);
          if (runImage) photosByTake.current.set(take.id, runImage);
          persistTake();
        }

        await sendCommand("start", {});
      } catch (caught) {
        setPhase("idle");
        throw caught;
      }
    },
    [opening, seed, watchId, photo, caption, status, connect, getJwt, setPhase, uploadFile, sendCommand, resolution, target, syncQueueView, pushLog, watch, persistTake],
  );

  // Public actions

  const chooseWatch = useCallback(
    (id: string) => {
      if (phaseRef.current !== "idle") return;
      setWatchId(id);
      const w = watchById(id);
      const next = w ? w.initial : DEFAULT_WORLD;
      setTarget(next);
      liveRef.current = next;
    },
    [],
  );

  const choosePhoto = useCallback(
    (file: File | null) =>
      guard(async () => {
        if (!file) {
          setPhoto(null);
          return;
        }
        const cropped = await cropTo169(file);
        setPhoto(cropped);
        chooseWatch(PHOTO_WATCH_ID);
      }),
    [guard, chooseWatch],
  );

  const direct = useCallback(
    (axis: Axis, value: string) => {
      setTarget((t) => ({ ...t, [axis]: value }));
      if (phaseRef.current === "idle" || phaseRef.current === "rolling") return;
      if (replayRef.current) return;
      const q = queueRef.current.filter((item) => !(item.kind === "axis" && item.axis === axis));
      if (liveRef.current[axis] !== value) q.push({ id: uid(), kind: "axis", axis, value });
      queueRef.current = q;
      syncQueueView();
      void pumpRef.current();
    },
    [syncQueueView],
  );

  const trigger = useCallback(
    (eventId: string) => {
      const ev = watch?.events.find((e) => e.id === eventId);
      if (!ev || phaseRef.current === "idle" || replayRef.current) return;
      if (queueRef.current.some((q) => q.kind === "event" && q.eventId === eventId)) return;
      queueRef.current.push({ id: uid(), kind: "event", eventId, label: ev.label, prompt: ev.prompt });
      syncQueueView();
      void pumpRef.current();
    },
    [watch, syncQueueView],
  );

  const writeBeat = useCallback(
    (text: string) => {
      const prompt = text.trim();
      if (!prompt || phaseRef.current === "idle" || replayRef.current) return false;
      const label = prompt.length > 32 ? `${prompt.slice(0, 30).trim()}...` : prompt;
      queueRef.current.push({ id: uid(), kind: "line", label, prompt });
      syncQueueView();
      void pumpRef.current();
      return true;
    },
    [syncQueueView],
  );

  const dropQueued = useCallback(
    (id: string) => {
      queueRef.current = queueRef.current.filter((q) => q.id !== id);
      syncQueueView();
    },
    [syncQueueView],
  );

  const runCue = useCallback(() => {
    if (!watch || phaseRef.current !== "live" || replayRef.current) return;
    cueRef.current = { steps: watch.cue.steps, index: 0, releasedAt: chunkRef.current };
    setCueIndex(0);
    setNotice(`Cue sheet running: ${watch.cue.title}.`);
    void pumpRef.current();
  }, [watch]);

  const stopCue = useCallback(() => {
    cueRef.current = null;
    setCueIndex(null);
  }, []);

  const replay = useCallback(
    /** keep: replay only the first N beats, then hand control back. The run is saved as a branch take. */
    (original: Take, keep?: number) =>
      guard(async () => {
        const branching = keep !== undefined && keep < original.beats.length;
        const take = branching ? { ...original, beats: original.beats.slice(0, keep) } : original;
        if (phaseRef.current !== "idle") throw new Error("Cut the current run before replaying a take.");
        const image = take.anchored ? photosByTake.current.get(take.id) ?? null : null;
        if (take.anchored && !image) {
          throw new Error("This take opened on a photograph that is no longer loaded. Add the photo and roll it again.");
        }
        if (take.watchId !== PHOTO_WATCH_ID && watchById(take.watchId)) {
          setWatchId(take.watchId);
          setTarget(watchById(take.watchId)!.initial);
        }
        setSeed(take.seed);
        replayRef.current = { take, index: 0, branch: branching };
        setReplayTake(take);
        await roll({
          prompt: take.opening,
          seed: take.seed,
          image,
          take,
          label: branching ? `Branch of take ${original.number} after ${take.beats.at(-1)?.label ?? "the opening"}` : `Replay of take ${take.number}`,
          branchOf: branching ? original : undefined,
        });
      }).finally(() => {
        if (phaseRef.current === "idle") {
          replayRef.current = null;
          setReplayTake(null);
        }
      }),
    [guard, roll],
  );

  const importTake = useCallback((take: Take) => {
    const others = takesRef.current.filter((t) => t.id !== take.id);
    const next = [take, ...others];
    takesRef.current = next;
    setTakes(next);
    saveTakes(next);
    setNotice(`Take ${take.number} imported. Replay it to reproduce the run.`);
  }, []);

  const deleteTake = useCallback((id: string) => {
    const next = takesRef.current.filter((t) => t.id !== id);
    takesRef.current = next;
    setTakes(next);
    saveTakes(next);
  }, []);

  return {
    // session
    status,
    connected,
    phase,
    busy,
    chunk,
    fps,
    framesPerChunk,
    chunkSeconds: framesPerChunk && fps ? framesPerChunk / fps : null,
    anchored,
    error,
    notice,
    tracks,
    muted,
    resolution,
    availableResolutions,
    // direction
    watch,
    watchId,
    target,
    opening,
    lastPrompt,
    queue: queueView,
    log,
    cueIndex,
    photo,
    photoUrl,
    caption,
    /** A photo world needs the photo and a few words on what is in it. */
    ready: watchId !== PHOTO_WATCH_ID || (Boolean(photo) && caption.trim().length > 2),
    seed,
    // takes
    takes,
    activeTakeId,
    replayTake,
    // actions
    connect: () => guard(async () => connect(await getJwt())),
    disconnect: () =>
      guard(async () => {
        endRun();
        await disconnect();
      }),
    roll: () => guard(() => roll()),
    pause: () =>
      guard(async () => {
        resumeWantedRef.current = false;
        pausePendingRef.current = true;
        await sendCommand("pause", {});
      }),
    resume: () =>
      guard(async () => {
        // Orbis pauses at the end of the current chunk. If that has not landed yet, resume when it does.
        if (phaseRef.current !== "paused" && pausePendingRef.current) {
          resumeWantedRef.current = true;
          return;
        }
        // Already running: nothing to resume, so stay quiet instead of surfacing "Not paused".
        if (phaseRef.current !== "paused") return;
        await sendCommand("resume", {});
      }),
    cut: () =>
      guard(async () => {
        await sendCommand("reset", {});
        endRun("Cut. The take is saved below.");
        setSeed(newSeed());
      }),
    /** Credit guard: end any run, keep its take, and give the GPU back. */
    release: (reason: string) =>
      guard(async () => {
        if (phaseRef.current !== "idle") {
          try {
            await sendCommand("reset", {});
          } catch {
            // The session is closing either way.
          }
          setSeed(newSeed());
        }
        endRun(reason);
        await disconnect();
      }),
    chooseWatch,
    choosePhoto,
    setCaption,
    setSeed,
    setResolution,
    toggleMuted: () => setMuted((m) => !m),
    direct,
    trigger,
    writeBeat,
    dropQueued,
    runCue,
    stopCue,
    replay,
    importTake,
    deleteTake,
    clearError: () => setError(""),
  };
}

export type Unstill = ReturnType<typeof useUnstill>;
