"use client";

import dynamic from "next/dynamic";

// The studio is a live WebRTC instrument; it renders in the browser only.
export const ClientStudio = dynamic(() => import("@/components/studio/Studio").then((m) => m.Studio), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100dvh", background: "var(--night)" }} />,
});
