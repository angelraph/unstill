"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Unstill } from "@/hooks/use-unstill";

/** A live world with nobody directing it is cut after this long. */
export const IDLE_LIVE_MS = 120_000;
/** No single run lasts longer than this. */
export const MAX_RUN_MS = 10 * 60_000;
/** A GPU left connected after a Cut is released after this long. */
export const IDLE_CONNECTED_MS = 60_000;
/** How long the warning shows before the guard acts. */
export const WARN_MS = 20_000;

export type GuardWarning = { kind: "idle" | "cap"; seconds: number };

export type GuardState = {
  phase: string;
  connected: boolean;
  busy: boolean;
  /** A cue sheet or replay is directing on the user's behalf. */
  autoplay: boolean;
  lastAt: number;
  runStart: number | null;
  idleSince: number | null;
  now: number;
};

export const IDLE_REASON = "Two minutes without direction, so the run was cut and the GPU released to save credits. The take is saved below.";
export const CAP_REASON = "This run reached ten minutes, so it was cut and the GPU released to save credits. The take is saved below.";
export const PARKED_REASON = "The GPU was released after a minute without a run. Press Go live to start again.";

/** One tick of the guard: release with a reason, warn, or do nothing. */
export function guardStep(s: GuardState): { release?: string; warning: GuardWarning | null } {
  if (s.phase === "live" || s.phase === "paused") {
    const last = s.autoplay ? s.now : s.lastAt;
    const idleLeft = IDLE_LIVE_MS - (s.now - last);
    const capLeft = s.runStart === null ? Infinity : MAX_RUN_MS - (s.now - s.runStart);
    if (capLeft <= 0) return { release: CAP_REASON, warning: null };
    if (idleLeft <= 0) return { release: IDLE_REASON, warning: null };
    if (capLeft <= WARN_MS) return { warning: { kind: "cap", seconds: Math.ceil(capLeft / 1000) } };
    if (idleLeft <= WARN_MS) return { warning: { kind: "idle", seconds: Math.ceil(idleLeft / 1000) } };
    return { warning: null };
  }
  if (s.connected && s.phase === "idle" && !s.busy && s.idleSince !== null && s.now - s.idleSince > IDLE_CONNECTED_MS) {
    return { release: PARKED_REASON, warning: null };
  }
  return { warning: null };
}

/**
 * Keeps a session from spending credits when nobody is directing it. Any click, key, voice
 * command or new beat counts as direction; a running cue sheet or replay counts as well.
 */
export function useCreditGuard(u: Unstill, activity: unknown) {
  const uRef = useRef(u);
  uRef.current = u;
  const lastAt = useRef(Date.now());
  const runStart = useRef<number | null>(null);
  const idleSince = useRef<number | null>(null);
  const acting = useRef(false);
  const [warning, setWarning] = useState<GuardWarning | null>(null);

  const running = u.phase !== "idle";
  const parked = u.connected && u.phase === "idle";

  useEffect(() => {
    lastAt.current = Date.now();
  }, [activity]);

  useEffect(() => {
    const bump = () => {
      lastAt.current = Date.now();
    };
    window.addEventListener("pointerdown", bump);
    window.addEventListener("keydown", bump);
    return () => {
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
    };
  }, []);

  useEffect(() => {
    runStart.current = running ? Date.now() : null;
    lastAt.current = Date.now();
  }, [running]);

  useEffect(() => {
    idleSince.current = parked ? Date.now() : null;
  }, [parked]);

  useEffect(() => {
    const act = (reason: string) => {
      if (acting.current) return;
      acting.current = true;
      setWarning(null);
      void uRef.current.release(reason).finally(() => {
        acting.current = false;
      });
    };
    const id = setInterval(() => {
      const x = uRef.current;
      const now = Date.now();
      const autoplay = x.cueIndex !== null || Boolean(x.replayTake);
      if (autoplay) lastAt.current = now;
      const step = guardStep({
        phase: x.phase,
        connected: x.connected,
        busy: x.busy,
        autoplay,
        lastAt: lastAt.current,
        runStart: runStart.current,
        idleSince: idleSince.current,
        now,
      });
      if (step.release) {
        idleSince.current = null;
        act(step.release);
      } else {
        setWarning(step.warning);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Closing or leaving the tab ends the session instead of leaving it running.
  useEffect(() => {
    const leave = () => {
      if (uRef.current.connected) void uRef.current.release("");
    };
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, []);

  const keepGoing = useCallback(() => {
    lastAt.current = Date.now();
    setWarning(null);
  }, []);

  return { warning, keepGoing };
}
