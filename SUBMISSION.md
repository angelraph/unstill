# UNSTILL: Visko Orbis Online Challenge submission

**Live app:** https://unstill-pied.vercel.app
**Studio:** https://unstill-pied.vercel.app/studio
**Code:** https://github.com/angelraph/unstill

## Project name

UNSTILL

## Tagline

The photograph is the first frame.

## Short description (one line)

A live direction deck for places: lock a location, then change the hour, the weather, the crowd and the camera while Orbis keeps the world running, without a single cut.

## What it is

UNSTILL treats video as a place, not a clip. You choose a Watch (a city corner, a flagship store, a warehouse floor) or upload your own photograph, and Orbis opens on it live. From there you direct it. Press Rain and rain starts falling on the street that is already there. Press Night and the light falls while the same taxi stays at the curb. Empty the sidewalk, go handheld, push in toward the door. Every change lands on the next chunk of the running stream.

You never write a video prompt. A continuity compiler turns each directive into the kind of prompt Orbis reads best: the opening builds the world once, and every prompt after it describes one visible change in physical terms.

## Why it needs real time generation

A clip is finished the moment it renders. To make it rain you render a new one, and you get a new street. UNSTILL depends on the thing only a Live Model can do: changing a world while it keeps running, so the place you started with is the place you end with. Take Orbis away and the product does not exist.

## How it uses Orbis

- **Session:** the server exchanges the Reactor API key for a short lived JWT scoped to `reactor/visko-orbis-stable`. The browser connects over WebRTC with `@reactor-team/js-sdk`.
- **Opening:** for your own photo we crop it to 16:9 in the browser, then `uploadFile`, `set_image`, wait for `has_image`. Then `set_seed`, `set_prompt`, wait for `conditions_ready`, and `start`.
- **Direction:** mid stream `set_prompt` calls that morph the scene at chunk boundaries.
- **Pacing:** the studio listens for `chunk_complete` and releases at most one directive per settle window of two chunks, so changes land cleanly instead of fighting each other. Queued changes to the same control replace each other, and you can see and drop them.
- **Takes:** every run records its seed, opening and each beat stamped with the chunk it landed on. Orbis returns the same video for the same seed and prompt sequence, so a take can be replayed, exported as JSON and imported on another machine.
- **Controls:** pause, resume, reset, delivery resolution, picture driven sound, and in browser recording to .webm.

## Three Watches, one instrument

- **The Corner (film and media):** previsualize a location. Dusk to rain to night to an empty street in one take.
- **The Aisle (retail):** walk a flagship store at any hour and any crowd, and swap the display before it is built.
- **The Bay (robotics and training):** drop edge cases in front of a warehouse robot (a fallen box, a forklift, a spill) while the world keeps running.
- **Your photograph:** any place you have stood becomes a place you can direct.

## Judging criteria

- **Real time interaction:** the whole product is live steering of a running stream. Each change is timed to Orbis chunk boundaries, and the watch log shows the chunk every prompt landed on.
- **Creativity:** a new category, live place direction. It is not a prompt box and not a single demo. It is one instrument that serves film, retail and robotics, and it can also start from your own photo.
- **Functionality:** a working app on a public URL. Roll The Corner, press Run cue sheet, and the 90 second demo plays itself.

## How to try it (60 seconds)

1. Open the studio and keep The Corner selected.
2. Press Roll. The street appears at dusk.
3. Press Rain (or E), then Night (or 4), then Cab stops (or 5).
4. Or press Run cue sheet and watch it direct itself.
5. Press Cut. Your take is saved under Takes, ready to replay.

## Demo video script (about 90 seconds)

1. **0:00** The brief page: "The photograph is the first frame."
2. **0:08** Studio, The Corner, Roll. Dusk, dry street.
3. **0:18** Run cue sheet. Rain begins and the asphalt turns wet.
4. **0:30** Night falls. Signs and lamps glow, and the taxi is still there.
5. **0:42** Cab stops and a passenger steps out.
6. **0:52** The camera goes handheld.
7. **1:02** The street empties.
8. **1:10** Push in toward the bodega door.
9. **1:20** Cut, show the take in the watch log with chunk stamps, and press Replay.

## Built with

Next.js 16, React 19, TypeScript, `@reactor-team/js-sdk`, and Visko Orbis Stable on Reactor. Deployed on Vercel.

## Team

angelraph
