"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Infinite marquee whose speed and direction follow scroll velocity.
 * Idea adapted from ScrollVelocity in React Bits (https://reactbits.dev, MIT + Commons Clause, © David Haz).
 */
export default function Marquee({ items, dark = false, reverse = false }: { items: string[]; dark?: boolean; reverse?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dir = reverse ? 1 : -1;
    let x = 0;
    let boost = 0;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        boost = gsap.utils.clamp(-8, 8, self.getVelocity() / 250);
      },
    });
    const tick = (_t: number, dt: number) => {
      const half = el.scrollWidth / 2;
      boost *= 0.94;
      const d = boost < -0.3 ? -dir : dir;
      x += d * 0.05 * (1 + Math.abs(boost)) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [reverse]);
  const row = [...items, ...items];
  return (
    <div className={`relative overflow-hidden py-6 ${dark ? "bg-ink text-white" : "bg-paper text-ink"}`} aria-hidden="true">
      <div ref={track} className="flex w-max will-change-transform">
        {row.map((t, i) => (
          <span key={i} className="display flex items-center gap-8 pr-8 text-[clamp(1.6rem,4vw,3.4rem)] whitespace-nowrap">
            <span className={i % 2 ? "text-transparent [-webkit-text-stroke:1.5px_currentColor] opacity-60" : ""}>{t}</span>
            <span className="inline-block h-3 w-3 rounded-full bg-red shadow-[0_0_24px_6px_rgb(229_9_32/0.55)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
