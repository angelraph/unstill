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
