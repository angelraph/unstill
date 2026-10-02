// The continuity compiler. Turns directive state into Orbis prompts.
// Opening: build the world once. After that: one visible change per prompt.

import {
  AXIS_ORDER,
  optionFor,
  type Axis,
  type Watch,
  type WatchNouns,
  type WorldState,
} from "@/lib/watches";

export const PHOTO_NOUNS: WatchNouns = {
  ground: "the ground",
  lights: "the lights in the scene",
  people: "people",
  focus: "the center of the frame",
  aperture: null,
};

export function compileOpening(watch: Watch, state: WorldState): string {
  const n = watch.nouns;
  const camera = optionFor("camera", state.camera).state(n);
  const shot = `Wide shot, eye level, ${camera}, deep depth of field.`;
  const world = `${watch.setting}.`;
  const conditions = [
    optionFor("hour", state.hour).state(n),
    optionFor("weather", state.weather).state(n),
    optionFor("crowd", state.crowd).state(n),
  ].join(", ");
  return `${shot} ${world} ${capitalize(conditions)}. Photorealistic.`;
}

/**
 * Opening for a user photograph: the image pins the first frame, the text holds Orbis to it.
 * Without a description Orbis anchors frame one, then drifts to a place of its own within a
 * chunk or two, so the caption names what is in the photo and the prompt asks for continuity.
 */
export function compilePhotoOpening(caption: string, state: WorldState): string {
  const camera = optionFor("camera", state.camera).state(PHOTO_NOUNS);
  const subject = caption.trim() ? trimPeriod(caption.trim()) : "The place in the photograph";
  return `${subject}, exactly as in the first frame. The same place continues with gentle natural motion, ${camera}. Photorealistic.`;
}

export function compileShift(axis: Axis, value: string, nouns: WatchNouns): string {
  return optionFor(axis, value).shift(nouns);
}

export function changedAxes(from: WorldState, to: WorldState): Axis[] {
  return AXIS_ORDER.filter((a) => from[a] !== to[a]);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function trimPeriod(text: string) {
  return text.replace(/[.\s]+$/, "");
}
