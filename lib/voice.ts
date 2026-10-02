// Voice direction: turns what a director says on set into studio actions.
// Pure and synchronous so it can be tested without a browser.

import type { Axis, Watch } from "@/lib/watches";

export type VoiceAction =
  | { kind: "axis"; axis: Axis; value: string; label: string }
  | { kind: "event"; id: string; label: string }
  | { kind: "transport"; action: "roll" | "cut" | "hold" | "resume" | "cue"; label: string };

type Rule = { words: string[]; action: VoiceAction };

const AXIS_RULES: Rule[] = [
  { words: ["dawn", "sunrise", "first light", "morning"], action: { kind: "axis", axis: "hour", value: "dawn", label: "Hour: Dawn" } },
  { words: ["noon", "midday", "daylight", "day time", "daytime"], action: { kind: "axis", axis: "hour", value: "noon", label: "Hour: Noon" } },
  { words: ["dusk", "sunset", "evening", "golden hour"], action: { kind: "axis", axis: "hour", value: "dusk", label: "Hour: Dusk" } },
  { words: ["night", "nighttime", "midnight"], action: { kind: "axis", axis: "hour", value: "night", label: "Hour: Night" } },
  { words: ["clear sky", "clear skies", "sunny", "dry", "stop the rain", "weather clear"], action: { kind: "axis", axis: "weather", value: "clear", label: "Weather: Clear" } },
  { words: ["overcast", "cloudy", "clouds", "grey sky", "gray sky"], action: { kind: "axis", axis: "weather", value: "overcast", label: "Weather: Overcast" } },
  { words: ["rain", "raining", "rainy", "downpour", "storm"], action: { kind: "axis", axis: "weather", value: "rain", label: "Weather: Rain" } },
  { words: ["fog", "foggy", "mist", "misty", "haze"], action: { kind: "axis", axis: "weather", value: "fog", label: "Weather: Fog" } },
  { words: ["snow", "snowing", "snowy", "blizzard"], action: { kind: "axis", axis: "weather", value: "snow", label: "Weather: Snow" } },
  { words: ["empty", "clear the street", "clear the frame", "nobody", "deserted"], action: { kind: "axis", axis: "crowd", value: "empty", label: "Occupancy: Empty" } },
  { words: ["a few people", "few people", "a few", "some people", "light crowd"], action: { kind: "axis", axis: "crowd", value: "sparse", label: "Occupancy: A few" } },
  { words: ["busy", "crowd", "crowded", "packed", "rush hour"], action: { kind: "axis", axis: "crowd", value: "busy", label: "Occupancy: Busy" } },
  { words: ["lock it off", "locked", "lock the camera", "tripod", "static"], action: { kind: "axis", axis: "camera", value: "static", label: "Camera: Locked" } },
  { words: ["push in", "push", "dolly in", "move in", "move closer", "go closer"], action: { kind: "axis", axis: "camera", value: "push", label: "Camera: Push in" } },
  { words: ["handheld", "hand held"], action: { kind: "axis", axis: "camera", value: "handheld", label: "Camera: Handheld" } },
  { words: ["pan", "pan across", "pan left", "pan right"], action: { kind: "axis", axis: "camera", value: "pan", label: "Camera: Pan" } },
  { words: ["overhead", "top down", "top shot", "crane up", "birds eye", "bird's eye"], action: { kind: "axis", axis: "camera", value: "overhead", label: "Camera: Overhead" } },
];

// Transport words that stop or start a session must be deliberate. Bare "hold" or "cut" inside a
// sentence ("hold on", "cut to night") is ignored; see SHORT_ONLY below.
const TRANSPORT_RULES: Rule[] = [
  { words: ["roll it", "go live", "start rolling"], action: { kind: "transport", action: "roll", label: "Roll" } },
  { words: ["that's a wrap", "wrap it up", "end the take", "stop the take"], action: { kind: "transport", action: "cut", label: "Cut" } },
  { words: ["hold the shot", "hold the world", "pause the world", "pause the shot", "freeze the frame", "freeze the world"], action: { kind: "transport", action: "hold", label: "Hold" } },
  { words: ["resume", "keep rolling", "unpause", "unfreeze"], action: { kind: "transport", action: "resume", label: "Resume" } },
  { words: ["run the cue", "cue sheet", "run cue", "play the cue"], action: { kind: "transport", action: "cue", label: "Run cue sheet" } },
];

// One word calls that only count when they are the whole phrase, the way they are called on set.
const SHORT_ONLY: { words: string[]; action: VoiceAction }[] = [
  { words: ["action", "roll", "rolling"], action: { kind: "transport", action: "roll", label: "Roll" } },
  { words: ["cut", "and cut", "cut cut", "okay cut", "ok cut"], action: { kind: "transport", action: "cut", label: "Cut" } },
  { words: ["hold", "pause", "freeze"], action: { kind: "transport", action: "hold", label: "Hold" } },
];

// Extra spoken words for each Watch event, on top of the words in its label.
const EVENT_WORDS: Record<string, string[]> = {
  taxi: ["cab", "taxi", "car pulls up"],
  cyclist: ["cyclist", "bike", "bicycle"],
  steam: ["steam", "manhole"],
  shutter: ["shop closes", "close the shop", "shutter", "closing time"],
  spot: ["spotlight", "spot light", "light the plinth"],
  tryon: ["try on", "try it on", "laces up"],
  redline: ["red drop", "red sneakers", "swap the display"],
  queue: ["launch line", "line outside", "queue"],
  pallet: ["box falls", "fallen box", "drop a box", "box"],
  detour: ["detour", "go around", "avoid it", "steer around"],
  forklift: ["forklift"],
  spill: ["spill", "puddle", "water on the floor"],
};

export function normalize(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

function hits(phrase: string, words: string[]) {
  let best = -1;
  for (const w of words) {
    const i = phrase.lastIndexOf(` ${w} `);
    if (i > best) best = i;
  }
  return best;
}

/**
 * Parse one spoken phrase into actions, in the order they were said.
 * "rain, then night" gives [Rain, Night]. Unknown words are ignored.
 */
export function parseVoice(text: string, watch: Watch | null): VoiceAction[] {
  const phrase = normalize(text);
  const bare = phrase.trim().replace(/^(okay|ok|and|alright|right) /, "").replace(/ (please|now)$/, "");
  for (const s of SHORT_ONLY) {
    if (s.words.includes(bare) || s.words.includes(phrase.trim())) return [s.action];
  }
  const found: { at: number; action: VoiceAction }[] = [];
  const seen = new Set<string>();
  const add = (at: number, action: VoiceAction) => {
    const key = action.kind === "axis" ? `axis:${action.axis}` : action.kind === "event" ? `event:${action.id}` : `t:${action.action}`;
    if (at < 0 || seen.has(key)) return;
    seen.add(key);
    found.push({ at, action });
  };

  // Events first, so "cab stops" is not also read as "stop the rain".
  if (watch) {
    for (const ev of watch.events) {
      const words = [...(EVENT_WORDS[ev.id] ?? []), ev.label.toLowerCase()];
      add(hits(phrase, words), { kind: "event", id: ev.id, label: ev.label });
    }
  }
  for (const r of TRANSPORT_RULES) add(hits(phrase, r.words), r.action);
  for (const r of AXIS_RULES) add(hits(phrase, r.words), r.action);

  // "clear" alone means the weather; "clear the street" was matched above as Empty.
  if (!seen.has("axis:weather") && !seen.has("axis:crowd")) {
    add(hits(phrase, ["clear"]), { kind: "axis", axis: "weather", value: "clear", label: "Weather: Clear" });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.action);
}
