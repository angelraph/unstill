import { describe, expect, it } from "vitest";

import {
  CAP_REASON,
  IDLE_CONNECTED_MS,
  IDLE_LIVE_MS,
  IDLE_REASON,
  MAX_RUN_MS,
  PARKED_REASON,
  WARN_MS,
  guardStep,
  type GuardState,
} from "@/hooks/use-credit-guard";

const base: GuardState = { phase: "live", connected: true, busy: false, autoplay: false, lastAt: 0, runStart: 0, idleSince: null, now: 0 };
const at = (now: number, over: Partial<GuardState> = {}) => guardStep({ ...base, ...over, now });

describe("credit guard", () => {
  it("leaves a directed run alone", () => {
    expect(at(30_000)).toEqual({ warning: null });
  });

  it("warns before cutting an idle run, then releases it", () => {
    expect(at(IDLE_LIVE_MS - WARN_MS - 1000).warning).toBeNull();
    expect(at(IDLE_LIVE_MS - 15_000).warning).toEqual({ kind: "idle", seconds: 15 });
    expect(at(IDLE_LIVE_MS).release).toBe(IDLE_REASON);
  });

  it("counts a held world as idle too", () => {
    expect(at(IDLE_LIVE_MS, { phase: "paused" }).release).toBe(IDLE_REASON);
  });

  it("treats a running cue sheet or replay as direction", () => {
    expect(at(IDLE_LIVE_MS + 60_000, { autoplay: true, runStart: IDLE_LIVE_MS })).toEqual({ warning: null });
  });

  it("caps every run, even a busy one", () => {
    const busy = { lastAt: MAX_RUN_MS - 1000 };
    expect(at(MAX_RUN_MS - 10_000, busy).warning).toEqual({ kind: "cap", seconds: 10 });
    expect(at(MAX_RUN_MS, busy).release).toBe(CAP_REASON);
  });

  it("releases a GPU left connected after a Cut", () => {
    const parked = { phase: "idle", runStart: null, idleSince: 0 };
    expect(at(IDLE_CONNECTED_MS - 1000, parked)).toEqual({ warning: null });
    expect(at(IDLE_CONNECTED_MS + 1000, parked).release).toBe(PARKED_REASON);
    expect(at(IDLE_CONNECTED_MS + 1000, { ...parked, busy: true })).toEqual({ warning: null });
    expect(at(IDLE_CONNECTED_MS + 1000, { ...parked, connected: false })).toEqual({ warning: null });
  });

  it("never acts while a world is still rolling", () => {
    expect(at(MAX_RUN_MS * 2, { phase: "rolling" })).toEqual({ warning: null });
  });
});
