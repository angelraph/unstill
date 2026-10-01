# UNSTILL

**The photograph is the first frame.**

UNSTILL is a live direction deck for places, built on Visko Orbis. Lock a location, then change the hour, the weather, the crowd and the camera while the world keeps running. Orbis carries every change into the live picture at the next chunk, without a cut.

Made for the Visko Orbis Online Challenge, 2026.

## Why it needs a Live Model

A clip is finished the moment it renders. To make it rain, you render another one. In UNSTILL you make it rain on the street that is already there, then let night fall on it, then empty it, in one continuous shot. That only exists with real time generation.

## What is in the studio

| Feature | What it does |
| --- | --- |
| Watches | Three locked worlds: The Corner (film and media), The Aisle (retail), The Bay (robotics and training) |
| Your photograph | Cropped to 16:9 in the browser, uploaded, and set as the first frame with `set_image` |
| Direction deck | Hour, weather, occupancy and camera, four event pads per Watch, keyboard shortcuts, and a free beat line |
| Continuity compiler | The opening prompt builds the world once. Every prompt after it describes one visible change, following the Orbis prompt guide |
| Chunk gated release | Listens for `chunk_complete` and releases at most one directive per settle window so morphs never collide |
| Cue sheets | A scripted sequence per Watch that plays on chunk timing |
| Takes | Seed, opening and every beat stamped with its chunk. Export, import and replay: same seed and same prompts give the same world |
| Record | Saves the live picture and sound to a .webm file in the browser |

## Run it locally

```bash
npm install
cp .env.example .env.local   # then add your Reactor API key
npm run dev
```

Open http://localhost:3000 for the brief and http://localhost:3000/studio for the studio.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `REACTOR_API_KEY` | Yes | From the Reactor dashboard at reactor.inc. Starts with `rk_`. Server side only |

The key never reaches the browser. `app/api/token/route.ts` exchanges it for a one hour JWT scoped to `reactor/visko-orbis-stable` and a single session.

## Deploy on Vercel

1. Import this repository at vercel.com/new. The framework preset is Next.js and no build settings need changing.
2. Under Environment Variables add `REACTOR_API_KEY`.
3. Deploy.

## Project map

```
app/page.tsx                 The brief
app/studio/page.tsx          The studio
app/api/token/route.ts       JWT minting
hooks/use-unstill.ts         Session engine: roll, direct, queue, cue, takes, replay
lib/watches.ts               Worlds, directive vocabulary, events, cue sheets
lib/compiler.ts              Opening and shift prompts
lib/take.ts                  Take storage, export, import
lib/image.ts                 16:9 crop
components/studio/           Stage, deck, transport, log and takes
```

## Built with

Next.js 16, React 19, `@reactor-team/js-sdk`, and Visko Orbis Stable served by Reactor.
