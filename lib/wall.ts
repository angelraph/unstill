// The wall: takes people chose to share, so anyone can replay them or branch a new future.
import type { Beat, Take } from "@/lib/take";
import { WATCHES } from "@/lib/watches";

export type WallPost = {
  id: string;
  at: string;
  title: string;
  author: string;
  watchId: string;
  watchName: string;
  seed: number;
  opening: string;
  beats: Beat[];
};

export const WALL_KEY = "unstill:wall";
export const WALL_MAX = 200;

const LIMITS = { title: 60, author: 24, opening: 900, label: 60, prompt: 240, beats: 40 };
// Kept short on purpose: blocks the obvious, everything else is handled by the admin delete.
const BLOCKED = /\b(fuck|shit|cunt|nigg|fag|rape|porn|nazi|kill yourself)\w*/i;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** Validates an incoming post. Returns the stored shape, or a reason it was refused. */
export function makePost(input: { take?: Partial<Take>; title?: unknown; author?: unknown }, now = new Date()): WallPost | string {
  const t = input.take;
  if (!t || typeof t !== "object") return "No take was sent.";
  if (t.anchored) return "Takes that open on a photograph stay private, since the photo never leaves your browser.";
  const watch = WATCHES.find((w) => w.id === t.watchId);
  if (!watch) return "Only takes from The Corner, The Aisle or The Bay can go on the wall.";
  if (typeof t.seed !== "number" || !Number.isInteger(t.seed) || t.seed < 0 || t.seed > 1_000_000) return "The take has no valid seed.";
  const opening = clean(t.opening, LIMITS.opening);
  if (!opening) return "The take has no opening.";
  if (!Array.isArray(t.beats) || t.beats.length === 0) return "Direct at least one beat before posting a take.";
  if (t.beats.length > LIMITS.beats) return `A take on the wall can hold up to ${LIMITS.beats} beats.`;
  const beats: Beat[] = [];
  for (const b of t.beats) {
    if (!b || typeof b.chunk !== "number" || !Number.isInteger(b.chunk) || b.chunk < 0 || b.chunk > 100_000) return "A beat has no valid chunk.";
    const label = clean(b.label, LIMITS.label);
    const prompt = clean(b.prompt, LIMITS.prompt);
    if (!label || !prompt) return "A beat is empty.";
    beats.push({ chunk: b.chunk, label, prompt });
  }
  const title = clean(input.title, LIMITS.title) || `${watch.name}, seed ${t.seed}`;
  const author = clean(input.author, LIMITS.author) || "Anonymous";
  const text = [title, author, opening, ...beats.flatMap((b) => [b.label, b.prompt])].join(" ");
  if (BLOCKED.test(text)) return "That take cannot go on the wall.";
  return {
    id: hash(`${t.watchId}|${t.seed}|${opening}|${beats.map((b) => `${b.chunk}:${b.prompt}`).join("|")}`),
    at: now.toISOString(),
    title,
    author,
    watchId: watch.id,
    watchName: watch.name,
    seed: t.seed,
    opening,
    beats,
  };
}

/** A wall post as a take the studio can replay or branch. */
export function postToTake(p: WallPost): Take {
  return {
    id: `wall-${p.id}`,
    number: 0,
    watchId: p.watchId,
    watchName: p.watchName,
    seed: p.seed,
    opening: p.opening,
    openingLabel: p.watchName,
    anchored: false,
    createdAt: p.at,
    beats: p.beats,
  };
}

export function parsePosts(raw: unknown[]): WallPost[] {
  const out: WallPost[] = [];
  for (const r of raw) {
    try {
      const p = JSON.parse(String(r)) as WallPost;
      if (p && p.id && Array.isArray(p.beats)) out.push(p);
    } catch {
      // skip a damaged entry
    }
  }
  return out;
}
