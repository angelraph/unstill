import { NextResponse } from "next/server";

import { kv, kvEnabled } from "@/lib/kv";
import { clientIp, limited } from "@/lib/rate-limit";
import { WALL_KEY, WALL_MAX, makePost, parsePosts } from "@/lib/wall";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  if (!kvEnabled()) return NextResponse.json({ enabled: false, posts: [] }, { headers: NO_STORE });
  try {
    const [raw] = await kv(["LRANGE", WALL_KEY, 0, 59]);
    return NextResponse.json({ enabled: true, posts: parsePosts((raw as unknown[]) ?? []) }, { headers: NO_STORE });
  } catch (e) {
    return NextResponse.json({ enabled: true, posts: [], error: (e as Error).message }, { status: 502, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  if (!kvEnabled()) return NextResponse.json({ error: "The wall is not connected yet." }, { status: 503 });
  if (limited(`wall:${clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "That is a lot of takes. Try again in a few minutes." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "The request was not valid JSON." }, { status: 400 });
  }
  if (JSON.stringify(body).length > 40_000) return NextResponse.json({ error: "That take is too large." }, { status: 413 });
  const post = makePost(body as Parameters<typeof makePost>[0]);
  if (typeof post === "string") return NextResponse.json({ error: post }, { status: 400 });
  try {
    const [raw] = await kv(["LRANGE", WALL_KEY, 0, WALL_MAX - 1]);
    if (parsePosts((raw as unknown[]) ?? []).some((p) => p.id === post.id)) {
      return NextResponse.json({ ok: true, post, duplicate: true });
    }
    await kv(["LPUSH", WALL_KEY, JSON.stringify(post)], ["LTRIM", WALL_KEY, 0, WALL_MAX - 1]);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

/** Moderation: DELETE /api/wall?id=...&key=WALL_ADMIN_KEY */
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const admin = process.env.WALL_ADMIN_KEY;
  if (!admin || url.searchParams.get("key") !== admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!kvEnabled()) return NextResponse.json({ error: "The wall is not connected yet." }, { status: 503 });
  const id = url.searchParams.get("id");
  const [raw] = await kv(["LRANGE", WALL_KEY, 0, WALL_MAX - 1]);
  const match = ((raw as unknown[]) ?? []).find((r) => parsePosts([r])[0]?.id === id);
  if (!match) return NextResponse.json({ removed: 0 });
  const [removed] = await kv(["LREM", WALL_KEY, 1, String(match)]);
  return NextResponse.json({ removed });
}
