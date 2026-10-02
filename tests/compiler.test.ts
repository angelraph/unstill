import { describe, expect, it } from "vitest";

import { compileOpening, compilePhotoOpening, compileShift } from "@/lib/compiler";
import { AXES, AXIS_ORDER, WATCHES, optionFor } from "@/lib/watches";

const words = (s: string) => s.trim().split(/\s+/).length;
// The Orbis prompt guide: negations render the noun ("no people" draws people).
const NEGATION = /\b(no|not|without|never|none)\b/i;

describe("opening prompts", () => {
  for (const w of WATCHES) {
    it(`${w.name} builds the world in one prompt under 120 words`, () => {
      const p = compileOpening(w, w.initial);
      expect(words(p)).toBeLessThanOrEqual(120);
      expect(p).toMatch(/^Wide shot/);
      expect(p).toMatch(/Photorealistic\.$/);
      expect(p).not.toMatch(NEGATION);
    });
  }

  it("photo opening uses the caption and the camera", () => {
    const p = compilePhotoOpening("A quiet harbor at low tide", WATCHES[0].initial);
    expect(p.startsWith("A quiet harbor at low tide, exactly as in the first frame.")).toBe(true);
    expect(p).not.toMatch(NEGATION);
    expect(p).toContain(optionFor("camera", WATCHES[0].initial.camera).state(WATCHES[0].nouns));
  });
});

describe("shift prompts", () => {
  for (const w of WATCHES) {
    for (const axis of AXIS_ORDER) {
      for (const o of AXES[axis].options) {
        it(`${w.id} ${axis}:${o.value} is one short visible change with no negation`, () => {
          const p = compileShift(axis, o.value, w.nouns);
          expect(words(p)).toBeLessThanOrEqual(40);
          expect(p).not.toMatch(NEGATION);
          expect(p.endsWith(".")).toBe(true);
          // Never redescribes the whole scene.
          expect(p).not.toContain(w.setting.slice(0, 30));
        });
      }
    }
  }
});

describe("watches", () => {
  for (const w of WATCHES) {
    it(`${w.name} cue sheet only references real axes, values and events`, () => {
      for (const step of w.cue.steps) {
        if (step.kind === "axis") {
          expect(AXES[step.axis].options.map((o) => o.value)).toContain(step.value);
        } else {
          expect(w.events.map((e) => e.id)).toContain(step.id);
        }
        expect(step.hold).toBeGreaterThanOrEqual(2);
      }
    });

    it(`${w.name} event prompts are single actions without negation`, () => {
      for (const e of w.events) {
        expect(e.prompt).not.toMatch(NEGATION);
        expect(words(e.prompt)).toBeLessThanOrEqual(30);
      }
    });
  }

  it("keyboard shortcuts are unique across the deck", () => {
    const keys = AXIS_ORDER.flatMap((a) => AXES[a].options.map((o) => o.key));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
