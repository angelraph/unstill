export const ORBIS_MODEL_NAME = "reactor/visko-orbis-stable";
export const REACTOR_API_URL = "https://api.reactor.inc";

export const ORBIS_TRACKS = [
  { name: "main_video", kind: "video", direction: "recvonly" },
  { name: "main_audio", kind: "audio", direction: "recvonly" },
] as const;

export const RESOLUTIONS = ["1080p", "2k", "4k"];

/** Chunks to wait after a prompt lands before the next one is released. */
export const SETTLE_CHUNKS = 2;

export type OrbisMessage = {
  type?: string;
  command?: string;
  reason?: string;
  prompt?: string;
  available_resolutions?: string[];
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  frames_per_chunk?: number;
  max_chunks?: number;
  chunk_index?: number;
  current_chunk?: number;
  frames_emitted?: number;
  total_chunks?: number;
  has_image?: boolean;
  has_prompt?: boolean;
  image_conditioned?: boolean;
  started?: boolean;
  running?: boolean;
  paused?: boolean;
  seed?: number;
};

export function unwrapOrbisMessage(raw: unknown): OrbisMessage {
  const envelope = raw as { type?: string; data?: Record<string, unknown> };
  if (envelope?.data && typeof envelope.data === "object") {
    return { ...envelope.data, type: envelope.type } as OrbisMessage;
  }
  return (raw ?? {}) as OrbisMessage;
}

export async function requestReactorJwt() {
  const response = await fetch("/api/token", { method: "POST" });
  const result = (await response.json().catch(() => ({}))) as { jwt?: string; error?: string };
  if (!response.ok || !result.jwt) {
    throw new Error(result.error || "Could not create a Reactor session token.");
  }
  return result.jwt;
}
