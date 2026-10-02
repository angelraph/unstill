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
