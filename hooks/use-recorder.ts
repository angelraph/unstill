"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { downloadBlob } from "@/lib/take";

/** Records the live Orbis tracks in the browser to a .webm file. */
export function useRecorder(tracks: Record<string, MediaStreamTrack>, filename: () => string) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const video = tracks.main_video;
  const audio = tracks.main_audio;
  const supported = typeof window !== "undefined" && "MediaRecorder" in window;

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!video || recorderRef.current) return;
    const stream = new MediaStream([video, ...(audio ? [audio] : [])]);
    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) =>
      MediaRecorder.isTypeSupported(m),
    );
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    recorder.onstop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current = null;
      setRecording(false);
      if (chunksRef.current.length) {
        downloadBlob(new Blob(chunksRef.current, { type: "video/webm" }), filename());
      }
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [video, audio, filename]);

  // Stop cleanly if the stream goes away.
  useEffect(() => {
    if (!video && recorderRef.current) stop();
  }, [video, stop]);

  useEffect(() => () => recorderRef.current?.stop(), []);

  return { supported, canRecord: Boolean(video), recording, seconds, start, stop };
}
