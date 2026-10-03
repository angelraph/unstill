import { NextResponse } from "next/server";

import { clientIp, limited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
const PROMPT = [
  "You write the opening line for a live video model that will animate this exact photograph.",
  "Describe the place in one plain sentence of 8 to 18 words: where it is and the main things visible,",
  "with the light and season if they are obvious. Name only what is in the picture.",
  "Use no negations, no camera words, no mood words and no quotes. Reply with the sentence only.",
].join(" ");

/** GET tells the studio whether automatic descriptions are available. */
export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) }, { headers: { "Cache-Control": "no-store" } });
}

/** POST { image: base64 JPEG } returns { caption }. The photo is not stored. */
export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "Automatic descriptions are not set up." }, { status: 501 });
  if (limited(`describe:${clientIp(request)}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many photos at once. Try again in a minute." }, { status: 429 });
  }
  let image = "";
  try {
    image = String(((await request.json()) as { image?: unknown }).image ?? "");
  } catch {
    return NextResponse.json({ error: "The request was not valid JSON." }, { status: 400 });
  }
  image = image.replace(/^data:image\/\w+;base64,/, "");
  if (!image || image.length > 3_000_000 || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return NextResponse.json({ error: "Send one JPEG under 2 MB." }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 80,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: `The description service failed (${response.status}).` }, { status: 502 });
  }
  const result = (await response.json()) as { content?: { type: string; text?: string }[] };
  const caption = tidyCaption(result.content?.find((c) => c.type === "text")?.text ?? "");
  if (!caption) return NextResponse.json({ error: "No description came back." }, { status: 502 });
  return NextResponse.json({ caption });
}

function tidyCaption(text: string) {
  return text
    .replace(/["“”]/g, "")
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.\s]+$/, "")
    .slice(0, 160);
}
