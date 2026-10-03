// Minimal Upstash Redis REST client (the store Vercel's Upstash integration provisions).
// Server side only. Reads KV_REST_API_* (Vercel naming) or UPSTASH_REDIS_REST_* (Upstash naming).

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function kvEnabled() {
  return config() !== null;
}

/** Runs commands in one round trip and returns each result. */
export async function kv(...commands: (string | number)[][]): Promise<unknown[]> {
  const c = config();
  if (!c) throw new Error("Storage is not connected.");
  const response = await fetch(`${c.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands.map((cmd) => cmd.map(String))),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Storage request failed (${response.status}).`);
  const results = (await response.json()) as { result?: unknown; error?: string }[];
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error);
  return results.map((r) => r.result);
}
