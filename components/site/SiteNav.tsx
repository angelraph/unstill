"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/site/Logo";

export const PAGES = [
  { href: "/watches", label: "Watches" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
];

// Pages printed on paper. Everything else sits in the dark room.
const PAPER = ["/watches", "/faq"];

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const paper = PAPER.some((p) => path.startsWith(p));

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${paper ? "nav-paper" : ""} ${scrolled ? "nav-scrolled" : ""} ${open ? "nav-open" : ""}`}>
      <div className="nav-row">
        <Link href="/" className="nav-mark" aria-label="UNSTILL home">
          <Logo animate />
        </Link>
        <nav className="nav-links" aria-label="Site">
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} aria-current={path.startsWith(p.href) ? "page" : undefined}>
              {p.label}
            </Link>
          ))}
        </nav>
        <Link href="/studio" className="nav-cta">
          <span className="nav-cta-dot" aria-hidden />
          Open the studio
        </Link>
        <button className="nav-menu" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
          <span />
          <span />
        </button>
      </div>
      <nav className="nav-sheet" aria-label="Site, mobile">
        {PAGES.map((p, i) => (
          <Link key={p.href} href={p.href} aria-current={path.startsWith(p.href) ? "page" : undefined}>
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            {p.label}
          </Link>
        ))}
        <Link href="/studio" className="nav-sheet-cta">
          Open the studio
        </Link>
      </nav>
    </header>
  );
}
