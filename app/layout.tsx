import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://unstill-pied.vercel.app"),
  title: {
    default: "UNSTILL · The photograph is the first frame",
    template: "%s · UNSTILL",
  },
  description: "Direct a live place in real time. Change the hour, the weather, the crowd and the camera while Visko Orbis keeps the world running, without a cut.",
  openGraph: {
    title: "UNSTILL",
    description: "The photograph is the first frame. Live place direction on Visko Orbis.",
    images: ["/stills/corner-dusk.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
