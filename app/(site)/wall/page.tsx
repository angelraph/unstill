import type { Metadata } from "next";

import { WallGrid } from "@/components/site/WallGrid";

export const metadata: Metadata = {
  title: "The wall",
  description: "Takes people directed in UNSTILL and chose to share. Replay any of them on Orbis, or branch a new future from any beat.",
};

export default function WallPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow-blue mono">The wall</p>
          <h1 className="h1">
            Directed by people. <em>Replayed by anyone.</em>
          </h1>
          <p className="lede">
            Every card is a real take: a seed and the beats someone called, stamped by chunk. Open one and Orbis builds the
            same world again, frame for frame. Then take it somewhere they never did.
          </p>
        </div>
      </section>
      <WallGrid />
    </>
  );
}
