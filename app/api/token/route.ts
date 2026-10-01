import { NextResponse } from "next/server";

import { ORBIS_MODEL_NAME, REACTOR_API_URL } from "@/lib/orbis";

export const dynamic = "force-dynamic";

// Exchanges the server side API key for a short lived JWT scoped to Orbis only.
// The API key never reaches the browser.
export async function POST() {
  const apiKey = process.env.REACTOR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "REACTOR_API_KEY is not set. Add it to .env.local and restart the server." },
      { status: 500 },
    );
  }

  const response = await fetch(`${REACTOR_API_URL}/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Reactor-API-Key": apiKey },
    body: JSON.stringify({
      expires_after: 3600,
      authorization_details: [
        {
          type: "session",
          resources: { models: { match: [ORBIS_MODEL_NAME] } },
          constraints: { max_sessions: 1 },
        },
      ],
    }),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    return NextResponse.json(
      { error: `Reactor token request failed (${response.status}): ${text}` },
      { status: response.status },
    );
  }

  const result = JSON.parse(text) as { jwt?: string };
  if (!result.jwt) {
    return NextResponse.json({ error: "Reactor returned no token." }, { status: 502 });
  }

  return NextResponse.json({ jwt: result.jwt }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
