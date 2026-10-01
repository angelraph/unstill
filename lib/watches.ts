// The three locked worlds and the directive vocabulary.
// Opening prompts follow the Orbis guide: camera + WHERE + WHO in under 100 words.
// Shift lines describe only what visibly changes, one step at a time, never negated.

export type Hour = "dawn" | "noon" | "dusk" | "night";
export type Weather = "clear" | "overcast" | "rain" | "fog" | "snow";
export type Crowd = "empty" | "sparse" | "busy";
export type Camera = "static" | "push" | "handheld" | "pan" | "overhead";

export type Axis = "hour" | "weather" | "crowd" | "camera";

export type WorldState = {
  hour: Hour;
  weather: Weather;
  crowd: Crowd;
  camera: Camera;
};

export type WatchNouns = {
  /** the ground surface the light and water land on */
  ground: string;
  /** artificial lights in the scene */
  lights: string;
  /** who moves through the place */
  people: string;
  /** the thing a push-in moves toward */
  focus: string;
  /** how the sky is seen; null for open air */
  aperture: string | null;
};

export type WatchEvent = {
  id: string;
  label: string;
  prompt: string;
};

export type CueStep =
  | { kind: "axis"; axis: Axis; value: string; hold: number }
  | { kind: "event"; id: string; hold: number };

export type Watch = {
  id: string;
  name: string;
  sector: string;
  logline: string;
  setting: string;
  nouns: WatchNouns;
  initial: WorldState;
  events: WatchEvent[];
  cue: { title: string; steps: CueStep[] };
};

type AxisOption<V extends string> = {
  value: V;
  label: string;
  key: string;
  state: (n: WatchNouns) => string;
  shift: (n: WatchNouns) => string;
};

const sky = (n: WatchNouns, text: string) =>
  n.aperture ? `Through ${n.aperture}, ${text}` : text.charAt(0).toUpperCase() + text.slice(1);

export const HOURS: AxisOption<Hour>[] = [
  {
    value: "dawn",
    label: "Dawn",
    key: "1",
    state: (n) => `${sky(n, "the sky is pale blue at early dawn")}, low cool sunlight`,
    shift: (n) =>
      `The light shifts to early dawn. ${sky(n, "the sky turns pale blue")}, and low cool sunlight rakes across ${n.ground}.`,
  },
  {
    value: "noon",
    label: "Noon",
    key: "2",
    state: (n) => `${sky(n, "bright midday sun")}, short hard shadows`,
    shift: (n) =>
      `The sun climbs to midday. Hard white light falls from overhead and shadows shorten on ${n.ground}.`,
  },
  {
    value: "dusk",
    label: "Dusk",
    key: "3",
    state: (n) => `${sky(n, "a warm amber dusk sky")}, long soft shadows, ${n.lights} glowing`,
    shift: (n) =>
      `The light falls to dusk. ${sky(n, "the sky warms to amber")}, shadows stretch long and ${n.lights} begin to glow.`,
  },
  {
    value: "night",
    label: "Night",
    key: "4",
    state: (n) => `${sky(n, "a black night sky")}, ${n.lights} casting warm pools of light`,
    shift: (n) =>
      `Night falls. ${sky(n, "the sky turns black")}, and ${n.lights} cast warm pools of light on ${n.ground}.`,
  },
];

export const WEATHERS: AxisOption<Weather>[] = [
  {
    value: "clear",
    label: "Clear",
    key: "q",
    state: () => "dry clear air",
    shift: (n) => `The weather clears. ${sky(n, "the sky opens up")} and ${n.ground} dries to a matte finish.`,
  },
  {
    value: "overcast",
    label: "Overcast",
    key: "w",
    state: () => "a flat grey overcast sky",
    shift: (n) => `Clouds roll in. ${sky(n, "the sky turns flat grey")} and the light goes soft and even.`,
  },
  {
    value: "rain",
    label: "Rain",
    key: "e",
    state: (n) => `steady rain, ${n.ground} wet and reflective`,
    shift: (n) =>
      `Rain begins to fall. ${n.ground.charAt(0).toUpperCase() + n.ground.slice(1)} darkens and turns wet, reflecting ${n.lights}.`,
  },
  {
    value: "fog",
    label: "Fog",
    key: "r",
    state: () => "thick low fog softening the distance",
    shift: () => `A thick low fog rolls in, swallowing the far background and softening every light into a halo.`,
  },
  {
    value: "snow",
    label: "Snow",
    key: "t",
    state: (n) => `light snow falling, a thin white layer on ${n.ground}`,
    shift: (n) => `Snow starts to fall in large slow flakes and a thin white layer settles on ${n.ground}.`,
  },
];

export const CROWDS: AxisOption<Crowd>[] = [
  {
    value: "empty",
    label: "Empty",
    key: "a",
    state: (n) => `${n.ground} empty and still`,
    shift: (n) => `The ${n.people} walk out of frame one by one, leaving ${n.ground} empty and still.`,
  },
  {
    value: "sparse",
    label: "A few",
    key: "s",
    state: (n) => `a few ${n.people} passing at a walking pace`,
    shift: (n) => `A few ${n.people} enter the frame and pass through at a walking pace.`,
  },
  {
    value: "busy",
    label: "Busy",
    key: "d",
    state: (n) => `a crowd of ${n.people} moving in both directions`,
    shift: (n) => `More ${n.people} arrive until a crowd fills the frame, moving in both directions.`,
  },
];

export const CAMERAS: AxisOption<Camera>[] = [
  {
    value: "static",
    label: "Locked",
    key: "z",
    state: () => "static camera on a tripod",
    shift: () => `The camera comes to rest, locked off on a tripod, perfectly still.`,
  },
  {
    value: "push",
    label: "Push in",
    key: "x",
    state: (n) => `slow push in toward ${n.focus}`,
    shift: (n) => `The camera begins a slow steady push forward toward ${n.focus}.`,
  },
  {
    value: "handheld",
    label: "Handheld",
    key: "c",
    state: () => "handheld camera with a gentle natural sway",
    shift: () => `The camera goes handheld at eye level with a gentle natural sway.`,
  },
  {
    value: "pan",
    label: "Pan",
    key: "v",
    state: () => "slow pan from left to right",
    shift: () => `The camera pans slowly from left to right across the scene.`,
  },
  {
    value: "overhead",
    label: "Overhead",
    key: "b",
    state: () => "high overhead angle looking down",
    shift: () => `The camera cranes up to a high overhead angle, looking straight down at the scene.`,
  },
];

export const AXES = {
  hour: { label: "Hour", options: HOURS },
  weather: { label: "Weather", options: WEATHERS },
  crowd: { label: "Occupancy", options: CROWDS },
  camera: { label: "Camera", options: CAMERAS },
} as const;

export const AXIS_ORDER: Axis[] = ["hour", "weather", "crowd", "camera"];

export function optionFor(axis: Axis, value: string) {
  const options = AXES[axis].options as AxisOption<string>[];
  return options.find((o) => o.value === value) ?? options[0];
}

export const WATCHES: Watch[] = [
  {
    id: "corner",
    name: "The Corner",
    sector: "Film and media",
    logline: "A city block you can rain on, darken and empty without a single cut.",
    setting:
      "A street corner in an old city neighborhood: a red brick five storey building with black fire escapes, a corner bodega with a green awning and a lit sign, a yellow taxi at the curb, a painted crosswalk and cast iron lamp posts",
    nouns: {
      ground: "the asphalt and sidewalk",
      lights: "the shop signs and street lamps",
      people: "pedestrians in coats",
      focus: "the bodega doorway",
      aperture: null,
    },
    initial: { hour: "dusk", weather: "clear", crowd: "sparse", camera: "static" },
    events: [
      {
        id: "taxi",
        label: "Cab stops",
        prompt: "A yellow taxi pulls to the curb and a passenger in a long coat steps out onto the sidewalk.",
      },
      {
        id: "cyclist",
        label: "Cyclist",
        prompt: "A cyclist in a red jacket rides through the crosswalk from left to right.",
      },
      {
        id: "steam",
        label: "Steam",
        prompt: "White steam rises slowly from a manhole cover in the middle of the street.",
      },
      {
        id: "shutter",
        label: "Shop closes",
        prompt: "The bodega owner pulls the metal shutter down over the shop front and the sign goes dark.",
      },
    ],
    cue: {
      title: "Dusk to an empty night",
      steps: [
        { kind: "axis", axis: "weather", value: "rain", hold: 5 },
        { kind: "axis", axis: "hour", value: "night", hold: 5 },
        { kind: "event", id: "taxi", hold: 5 },
        { kind: "axis", axis: "camera", value: "handheld", hold: 5 },
        { kind: "axis", axis: "crowd", value: "empty", hold: 5 },
        { kind: "axis", axis: "camera", value: "push", hold: 5 },
      ],
    },
  },
  {
    id: "aisle",
    name: "The Aisle",
    sector: "Retail",
    logline: "Walk a flagship store at any hour, any crowd, any display, before it is built.",
    setting:
      "Inside a flagship sneaker store: long pale oak display tables, white sneakers on lit plinths, a polished concrete floor, warm track lighting and a tall glass storefront facing the street",
    nouns: {
      ground: "the polished concrete floor",
      lights: "the track lights and lit plinths",
      people: "shoppers",
      focus: "the center plinth",
      aperture: "the tall glass storefront",
    },
    initial: { hour: "noon", weather: "clear", crowd: "sparse", camera: "push" },
    events: [
      {
        id: "spot",
        label: "Spotlight",
        prompt: "A bright spotlight snaps on above the center plinth and the white sneaker on it glows.",
      },
      {
        id: "tryon",
        label: "Try on",
        prompt: "A shopper sits on the oak bench and laces up a white sneaker.",
      },
      {
        id: "redline",
        label: "Red drop",
        prompt: "Staff replace the white sneakers on the plinths with bright red sneakers.",
      },
      {
        id: "queue",
        label: "Launch line",
        prompt: "A line of shoppers forms outside the glass storefront, pressing toward the door.",
      },
    ],
    cue: {
      title: "Quiet noon to launch night",
      steps: [
        { kind: "event", id: "spot", hold: 5 },
        { kind: "event", id: "redline", hold: 5 },
        { kind: "axis", axis: "hour", value: "night", hold: 5 },
        { kind: "event", id: "queue", hold: 5 },
        { kind: "axis", axis: "crowd", value: "busy", hold: 5 },
        { kind: "axis", axis: "camera", value: "handheld", hold: 5 },
      ],
    },
  },
  {
    id: "bay",
    name: "The Bay",
    sector: "Robotics and training",
    logline: "Throw edge cases at a warehouse robot while the world keeps running.",
    setting:
      "Inside a warehouse proving ground: an orange autonomous mobile robot with a black lidar puck carries a blue plastic tote along a grey concrete floor marked with yellow lane lines, steel pallet racking on both sides, a large roller door open to the yard",
    nouns: {
      ground: "the concrete floor",
      lights: "the overhead high bay lamps",
      people: "workers in hi vis vests",
      focus: "the orange robot",
      aperture: "the open roller door",
    },
    initial: { hour: "noon", weather: "clear", crowd: "empty", camera: "static" },
    events: [
      {
        id: "pallet",
        label: "Fallen box",
        prompt: "A cardboard box falls from the racking and lands in the yellow lane ahead of the robot.",
      },
      {
        id: "detour",
        label: "Robot detours",
        prompt: "The orange robot slows, turns and steers around the obstacle, then rejoins the yellow lane.",
      },
      {
        id: "forklift",
        label: "Forklift",
        prompt: "A yellow forklift carrying a pallet crosses the lane in front of the robot.",
      },
      {
        id: "spill",
        label: "Spill",
        prompt: "A puddle of water spreads across the concrete floor in the robot's path, reflecting the lamps.",
      },
    ],
    cue: {
      title: "Edge case drill",
      steps: [
        { kind: "event", id: "pallet", hold: 5 },
        { kind: "event", id: "detour", hold: 5 },
        { kind: "axis", axis: "crowd", value: "sparse", hold: 5 },
        { kind: "event", id: "forklift", hold: 5 },
        { kind: "axis", axis: "hour", value: "night", hold: 5 },
        { kind: "event", id: "spill", hold: 5 },
      ],
    },
  },
];

export const PHOTO_WATCH_ID = "photo";

export function watchById(id: string) {
  return WATCHES.find((w) => w.id === id);
}
