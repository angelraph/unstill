import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Playfair_Display } from "next/font/google";

import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Wordmark only: wide, high contrast capitals to match the logo.
const logo = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-logo" });

export const metadata: Metadata = {
  title: { default: "UNSTILL", template: "%s · UNSTILL" },
  description: "The photograph is the first frame. Direct a live place in real time with Visko Orbis.",
  metadataBase: new URL("https://unstill-pied.vercel.app"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e0d0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
