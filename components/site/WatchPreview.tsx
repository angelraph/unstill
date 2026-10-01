"use client";

import { useState } from "react";

import { Animatic } from "@/components/studio/Animatic";
import { AXES, AXIS_ORDER, type WorldState } from "@/lib/watches";

/** A Watch you can play with before opening the studio. Same vocabulary, drawn not generated. */
export function WatchPreview({ watchId, initial }: { watchId: string; initial: WorldState }) {
  const [world, setWorld] = useState<WorldState>(initial);

  return (
    <div className="wp">
      <div className="wp-frame">
        <Animatic watchId={watchId} world={world} />
      </div>
      <div className="wp-controls">
        {AXIS_ORDER.map((axis) => (
          <div key={axis} className="wp-row" role="radiogroup" aria-label={AXES[axis].label}>
            <span className="wp-axis mono">{AXES[axis].label}</span>
            <div className="wp-options">
              {AXES[axis].options.map((o) => (
                <button
                  key={o.value}
                  role="radio"
                  aria-checked={world[axis] === o.value}
                  className={world[axis] === o.value ? "on" : ""}
                  onClick={() => setWorld((w) => ({ ...w, [axis]: o.value }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
