"use client";

import { downloadClipAsFile, useReactor } from "@reactor-team/js-sdk";
import { useCallback, useState } from "react";

/**
 * Save the session as an MP4 recorded on Reactor's side: full frame rate and quality,
 * no encoding load on the viewer's machine.
 */
export function useServerRecording(getJwt: () => Promise<string>) {
  const requestRecording = useReactor((s) => s.requestRecording);
  const [state, setState] = useState<"idle" | "preparing" | "downloading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const save = useCallback(
    async (filename: string, opts: { trigger?: boolean } = {}) => {
      setState("preparing");
      setProgress(0);
      setError("");
      try {
        const clip = await requestRecording();
        setState("downloading");
        const jwt = await getJwt();
        const blob = await downloadClipAsFile(clip, opts.trigger === false ? null : filename, {
          jwt,
          onProgress: ({ fetched, total }) => setProgress(total ? Math.round((fetched / total) * 100) : 0),
        });
        setState("done");
        setTimeout(() => setState("idle"), 2500);
        return blob;
      } catch (e) {
        setState("error");
        setError(e instanceof Error ? e.message : String(e));
        return null;
      }
    },
    [requestRecording, getJwt],
  );

  return { state, progress, error, save };
}
