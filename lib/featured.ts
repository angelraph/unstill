// A take recorded during our live tests on Visko Orbis: The Corner, seed 75256,
// the Dusk to an empty night cue sheet, each beat at the chunk it landed on.
import { compileOpening, compileShift } from "@/lib/compiler";
import type { Take } from "@/lib/take";
import { watchById } from "@/lib/watches";

export function featuredTake(): Take {
  const corner = watchById("corner")!;
  const taxi = corner.events.find((e) => e.id === "taxi")!;
  return {
    id: "featured-corner-75256",
    number: 0,
    watchId: "corner",
    watchName: "The Corner (featured live take)",
    seed: 75256,
    opening: compileOpening(corner, corner.initial),
    openingLabel: "The Corner",
    anchored: false,
    createdAt: "2026-10-01T19:00:00.000Z",
    beats: [
      { chunk: 11, label: "Weather: Rain", prompt: compileShift("weather", "rain", corner.nouns) },
      { chunk: 16, label: "Hour: Night", prompt: compileShift("hour", "night", corner.nouns) },
      { chunk: 21, label: taxi.label, prompt: taxi.prompt },
      { chunk: 26, label: "Camera: Handheld", prompt: compileShift("camera", "handheld", corner.nouns) },
      { chunk: 31, label: "Occupancy: Empty", prompt: compileShift("crowd", "empty", corner.nouns) },
      { chunk: 36, label: "Camera: Push in", prompt: compileShift("camera", "push", corner.nouns) },
    ],
  };
}
