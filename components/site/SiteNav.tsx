"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/Logo";

const LINKS = [
  { href: "/watches", label: "Watches" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
];

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`nav ${scrolled || open ? "nav-solid" : ""} ${open ? "nav-open" : ""}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-mark" aria-label="UNSTILL home">
          <Logo size={26} animated />
        </Link>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? "on" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/studio" className="pill pill-light nav-cta">
          Open the studio
        </Link>
        <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
          <span />
          <span />
        </button>
      </div>
      <nav className="nav-sheet" aria-label="Mobile" hidden={!open}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/studio" className="pill pill-light">
          Open the studio
        </Link>
      </nav>
    </header>
  );
}
