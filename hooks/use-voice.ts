"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Unstill } from "@/hooks/use-unstill";
import { parseVoice, type VoiceAction } from "@/lib/voice";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

export type Heard = { id: number; text: string; actions: VoiceAction[] };

/** Listens like a script supervisor: every final phrase becomes deck actions. */
export function useVoice(u: Unstill) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [heard, setHeard] = useState<Heard | null>(null);
  const [error, setError] = useState("");
  // none: waiting for the microphone, mic: audio is flowing, speech: a voice was detected
  const [hearing, setHearing] = useState<"none" | "mic" | "speech">("none");
  const rec = useRef<Recognition | null>(null);
  const want = useRef(false);
  const uRef = useRef(u);
  uRef.current = u;
  const seq = useRef(0);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const perform = useCallback((actions: VoiceAction[]) => {
    const s = uRef.current;
    for (const a of actions) {
      if (a.kind === "axis") s.direct(a.axis, a.value);
      else if (a.kind === "event") s.trigger(a.id);
      else if (a.action === "roll" && s.phase === "idle") void s.roll();
      else if (a.action === "cut" && s.phase !== "idle") void s.cut();
      else if (a.action === "hold" && s.phase === "live") void s.pause();
      else if (a.action === "resume" && s.phase === "paused") void s.resume();
      else if (a.action === "cue" && s.phase === "live") s.runCue();
    }
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    (r as unknown as { onaudiostart: () => void }).onaudiostart = () => setHearing("mic");
    (r as unknown as { onspeechstart: () => void }).onspeechstart = () => setHearing("speech");
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0].transcript.trim();
        if (res.isFinal) {
          const actions = parseVoice(text, uRef.current.watch);
          setHeard({ id: ++seq.current, text, actions });
          perform(actions);
        } else live += text + " ";
      }
      setInterim(live.trim());
    };
    r.onerror = (e) => {
      const messages: Record<string, string> = {
        "not-allowed": "Microphone access was blocked. Click the camera icon in the address bar, allow the microphone, then try again.",
        "service-not-allowed": "This browser does not allow speech recognition here. Use Chrome or Edge on desktop.",
        "audio-capture": "No microphone was found. Check that a microphone is connected and selected in your system sound settings.",
        network: "The browser could not reach its speech service. Check your connection and try again.",
        "language-not-supported": "English speech recognition is not available in this browser.",
      };
      if (e.error === "no-speech" || e.error === "aborted") return;
      want.current = false;
      setError(messages[e.error] ?? `Voice stopped: ${e.error}.`);
    };
    r.onend = () => {
      setInterim("");
      if (want.current) {
        try { r.start(); } catch { /* already restarting */ }
      } else setListening(false);
    };
    rec.current = r;
    want.current = true;
    setError("");
    setHearing("none");
    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [perform]);

  const stop = useCallback(() => {
    want.current = false;
    rec.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  useEffect(() => () => { want.current = false; rec.current?.stop(); }, []);

  return { supported, listening, interim, heard, error, hearing, start, stop, toggle: () => (listening ? stop() : start()) };
}
