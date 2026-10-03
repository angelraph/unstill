import { describe, expect, it } from "vitest";

import { limited } from "@/lib/rate-limit";
import { featuredTake } from "@/lib/featured";
import { decodeTake, encodeTake } from "@/lib/take";
import { makePost, postToTake, type WallPost } from "@/lib/wall";

const take = featuredTake();

describe("the wall", () => {
  it("accepts a real take and keeps it replayable", () => {
    const post = makePost({ take, title: "  Rain on the corner  ", author: "Raphael" }) as WallPost;
    expect(typeof post).toBe("object");
    expect(post.title).toBe("Rain on the corner");
    expect(post.author).toBe("Raphael");
    expect(post.beats).toEqual(take.beats);
    const back = decodeTake(encodeTake(postToTake(post)))!;
    expect(back.seed).toBe(take.seed);
    expect(back.opening).toBe(take.opening);
    expect(back.beats).toEqual(take.beats);
  });

  it("gives the same take the same id, so reposts do not duplicate", () => {
    const a = makePost({ take }) as WallPost;
    const b = makePost({ take, title: "Another name" }) as WallPost;
    expect(a.id).toBe(b.id);
  });

  it("fills a title and an author when left empty", () => {
    const post = makePost({ take }) as WallPost;
    expect(post.title).toBe(`The Corner, seed ${take.seed}`);
    expect(post.author).toBe("Anonymous");
  });

  it("refuses photo takes, unknown worlds, empty takes and bad seeds", () => {
    expect(typeof makePost({ take: { ...take, anchored: true } })).toBe("string");
    expect(typeof makePost({ take: { ...take, watchId: "photo" } })).toBe("string");
    expect(typeof makePost({ take: { ...take, beats: [] } })).toBe("string");
    expect(typeof makePost({ take: { ...take, seed: -4 } })).toBe("string");
    expect(typeof makePost({ take: { ...take, seed: 1.5 } })).toBe("string");
    expect(typeof makePost({})).toBe("string");
  });

  it("caps lengths and strips control characters", () => {
    const post = makePost({ take, title: "a\u0000b".padEnd(200, "x"), author: "n".repeat(80) }) as WallPost;
    expect(post.title.length).toBe(60);
    expect(post.title.startsWith("a b")).toBe(true);
    expect(post.author.length).toBe(24);
  });

  it("blocks obvious abuse", () => {
    expect(typeof makePost({ take, title: "fuck this" })).toBe("string");
  });
});

describe("rate limit", () => {
  it("allows up to the limit inside the window, then refuses, then recovers", () => {
    const k = `test-${Math.random()}`;
    expect(limited(k, 2, 1000, 0)).toBe(false);
    expect(limited(k, 2, 1000, 10)).toBe(false);
    expect(limited(k, 2, 1000, 20)).toBe(true);
    expect(limited(k, 2, 1000, 2000)).toBe(false);
  });
});
