"use client";

import { useEffect, useState } from "react";

export type DocsGroup = { title: string; items: { id: string; label: string }[] };

/** Sidebar that follows the reader down the page. */
export function DocsNav({ groups }: { groups: DocsGroup[] }) {
  const [active, setActive] = useState(groups[0]?.items[0]?.id ?? "");

  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [groups]);

  return (
    <nav className="docs-nav" aria-label="Documentation">
      {groups.map((g) => (
        <div key={g.title} className="docs-nav-group">
          <p className="docs-nav-title mono">{g.title}</p>
          <ul>
            {g.items.map((i) => (
              <li key={i.id}>
                <a href={`#${i.id}`} aria-current={active === i.id ? "location" : undefined}>
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
