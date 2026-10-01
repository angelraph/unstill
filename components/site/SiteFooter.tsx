import Link from "next/link";

import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="foot-top">
        <p className="foot-line">
          Stop rendering clips.
          <br />
          <em>Start keeping watch.</em>
        </p>
        <Link href="/studio" className="pill pill-light pill-lg">
          Open the studio
        </Link>
      </div>
      <div className="foot-grid">
        <div>
          <div className="foot-mark">
            <Logo size={34} tagline />
          </div>
          <p className="foot-note">Live place direction on Visko Orbis. Made for the Visko Orbis Online Challenge, 2026.</p>
        </div>
        <nav aria-label="Product">
          <p className="foot-head">Product</p>
          <Link href="/studio">Studio</Link>
          <Link href="/watches">Watches</Link>
          <Link href="/how-it-works">How it works</Link>
        </nav>
        <nav aria-label="Help">
          <p className="foot-head">Help</p>
          <Link href="/docs">Docs</Link>
          <Link href="/docs#shortcuts">Shortcuts</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <nav aria-label="Built on">
          <p className="foot-head">Built on</p>
          <a href="https://visko.ai" target="_blank" rel="noreferrer">
            Visko Orbis
          </a>
          <a href="https://reactor.inc" target="_blank" rel="noreferrer">
            Reactor
          </a>
          <a href="https://github.com/angelraph/unstill" target="_blank" rel="noreferrer">
            Source
          </a>
        </nav>
      </div>
      <p className="foot-base mono">
        <span>Generated live at 18 fps · 832 × 480 · delivered up to 4K</span>
        <span>© 2026 UNSTILL</span>
      </p>
    </footer>
  );
}
