"use client";

import { useEffect, useRef } from "react";

/** Adds `is-in` when the element scrolls into view. Apple style statement reveals. */
export function Reveal({
  as: Tag = "div",
  className = "",
  children,
  threshold = 0.35,
}: {
  as?: "div" | "p" | "h2" | "section" | "li";
  className?: string;
  children: React.ReactNode;
  threshold?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && (el.classList.add("is-in"), io.disconnect()),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return (
    // @ts-expect-error polymorphic ref
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
