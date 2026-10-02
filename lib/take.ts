// A take is everything needed to reproduce a run: seed, opening prompt and
// the chunk at which every following prompt landed. Orbis is deterministic for
// the same seed and the same prompt sequence, so a take replays.

export type Beat = {
  chunk: number;
  label: string;
  prompt: string;
};

export type Take = {
  id: string;
  number: number;
  watchId: string;
  watchName: string;
  seed: number;
  opening: string;
  openingLabel: string;
  anchored: boolean;
  createdAt: string;
  beats: Beat[];
};

const STORAGE_KEY = "unstill.takes.v1";

export function newSeed() {
  return Math.floor(Math.random() * 99_999) + 1;
}

export function loadTakes(): Take[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Take[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTakes(takes: Take[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(takes.slice(0, 24)));
  } catch {
    // storage blocked; takes live for this session only
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function exportTake(take: Take) {
  const blob = new Blob([JSON.stringify(take, null, 2)], { type: "application/json" });
  downloadBlob(blob, `unstill-take-${take.number}-${take.watchId}.json`);
}

/** Compact, URL safe encoding so a take can travel in a link. */
export function encodeTake(take: Take): string {
  const compact = {
    w: take.watchId,
    n: take.watchName,
    s: take.seed,
    o: take.opening,
    b: take.beats.map((b) => [b.chunk, b.label, b.prompt]),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  let bin = "";
  bytes.forEach((x) => (bin += String.fromCharCode(x)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTake(code: string): Take | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const c = JSON.parse(new TextDecoder().decode(bytes)) as { w: string; n: string; s: number; o: string; b: [number, string, string][] };
    if (typeof c.s !== "number" || typeof c.o !== "string" || !Array.isArray(c.b)) return null;
    return {
      id: `shared-${c.s}-${c.b.length}`,
      number: 0,
      watchId: c.w,
      watchName: c.n,
      seed: c.s,
      opening: c.o,
      openingLabel: c.n,
      anchored: false,
      createdAt: new Date().toISOString(),
      beats: c.b.map(([chunk, label, prompt]) => ({ chunk, label, prompt })),
    };
  } catch {
    return null;
  }
}

export function takeLink(take: Take, origin = typeof window !== "undefined" ? window.location.origin : "https://unstill-pied.vercel.app") {
  return `${origin}/studio#take=${encodeTake(take)}`;
}

export function parseTake(text: string): Take | null {
  try {
    const t = JSON.parse(text) as Take;
    if (typeof t.seed !== "number" || typeof t.opening !== "string" || !Array.isArray(t.beats)) {
      return null;
    }
    return t;
  } catch {
    return null;
  }
}
