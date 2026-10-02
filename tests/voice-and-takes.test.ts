import { describe, expect, it } from "vitest";

import { featuredTake } from "@/lib/featured";
import { SETTLE_CHUNKS } from "@/lib/orbis";
import { decodeTake, encodeTake } from "@/lib/take";
import { parseVoice } from "@/lib/voice";
import { watchById } from "@/lib/watches";

const corner = watchById("corner")!;
const labels = (text: string) => parseVoice(text, corner).map((a) => a.label);

describe("voice direction", () => {
  it("reads directives in the order they were spoken", () => {
    expect(labels("Okay, rain, then night")).toEqual(["Weather: Rain", "Hour: Night"]);
  });

  it("understands set language", () => {
    expect(labels("Action!")).toEqual(["Roll"]);
    expect(labels("cut")).toEqual(["Cut"]);
    expect(labels("give me a slow push in")).toEqual(["Camera: Push in"]);
    expect(labels("let's go handheld")).toEqual(["Camera: Handheld"]);
  });

  it("maps spoken words to Watch events", () => {
    expect(labels("have the taxi pull up")).toEqual(["Cab stops"]);
    expect(labels("send a cyclist through")).toEqual(["Cyclist"]);
  });

  it("does not confuse an empty street with clear weather", () => {
    expect(labels("clear the street")).toEqual(["Occupancy: Empty"]);
    expect(labels("make it clear")).toEqual(["Weather: Clear"]);
  });

  it("never pauses or cuts by accident inside a sentence", () => {
    expect(labels("hold on, make it rain")).toEqual(["Weather: Rain"]);
    expect(labels("cut to night")).toEqual(["Hour: Night"]);
    expect(labels("I want to pause and think")).toEqual([]);
    expect(labels("let me take an action shot of the cab")).toEqual(["Cab stops"]);
  });

  it("pauses, cuts and rolls on deliberate calls", () => {
    expect(labels("hold")).toEqual(["Hold"]);
    expect(labels("hold the shot")).toEqual(["Hold"]);
    expect(labels("and cut")).toEqual(["Cut"]);
    expect(labels("that's a wrap")).toEqual(["Cut"]);
    expect(labels("okay action")).toEqual(["Roll"]);
    expect(labels("resume")).toEqual(["Resume"]);
  });

  it("handles the founder's real test phrases", () => {
    // From the recorded test session that froze on "hold and resume".
    expect(labels("hold and resume")).toEqual(["Resume"]);
    expect(labels("lock it up")).toEqual(["Camera: Locked"]);
    expect(labels("pan over")).toEqual(["Camera: Pan"]);
    expect(labels("run the queue sheets")).toEqual(["Run cue sheet"]);
    expect(labels("close the shop")).toEqual(["Shop closes"]);
    expect(labels("send a cyclist")).toEqual(["Cyclist"]);
  });

  it("ignores chatter", () => {
    expect(labels("what do you think of this shot")).toEqual([]);
  });
});

describe("shareable takes", () => {
  it("round trips through a link", () => {
    const t = featuredTake();
    const back = decodeTake(encodeTake(t))!;
    expect(back.seed).toBe(t.seed);
    expect(back.opening).toBe(t.opening);
    expect(back.beats).toEqual(t.beats);
    expect(back.watchId).toBe("corner");
  });

  it("rejects garbage", () => {
    expect(decodeTake("not-a-take")).toBeNull();
  });

  it("featured take beats are ordered and spaced at least one settle window apart", () => {
    const chunks = featuredTake().beats.map((b) => b.chunk);
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i] - chunks[i - 1]).toBeGreaterThanOrEqual(SETTLE_CHUNKS);
    }
  });
});
