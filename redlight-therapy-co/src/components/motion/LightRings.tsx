"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Animated concentric arcs taken from the Redlight Therapy Co. logo mark:
 * broken rings with dots, each turning at its own speed. Pure SVG, GPU-transformed.
 */
const RINGS = [
  { r: 46, w: 2.4, dash: "210 26 6 26", speed: 60 },
  { r: 38, w: 2.4, dash: "150 22 5 22", speed: -44 },
  { r: 30, w: 2.4, dash: "120 18 4 18", speed: 34 },
  { r: 22, w: 2.4, dash: "90 14", speed: -26 },
];

export default function LightRings({ className = "", tone = "red" }: { className?: string; tone?: "red" | "soft" }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const groups = svg.querySelectorAll<SVGGElement>("[data-ring]");
    const tweens = Array.from(groups).map((g, i) =>
      gsap.to(g, { rotation: RINGS[i].speed > 0 ? 360 : -360, duration: Math.abs(RINGS[i].speed), repeat: -1, ease: "none", svgOrigin: "50 50" }),
    );
    const draw = gsap.fromTo(
      svg.querySelectorAll("circle[data-arc]"),
      { strokeDashoffset: 300, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 2.2, ease: "expo.out", stagger: 0.15 },
    );
    return () => {
      tweens.forEach((t) => t.kill());
      draw.kill();
    };
  }, []);
  const id = tone === "red" ? "rl-grad-red" : "rl-grad-soft";
  return (
    <svg ref={ref} viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {tone === "red" ? (
            <>
              <stop offset="0" stopColor="#f0643c" />
              <stop offset="0.55" stopColor="#e50920" />
              <stop offset="1" stopColor="#9e0617" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#f0643c" stopOpacity="0.5" />
              <stop offset="1" stopColor="#e50920" stopOpacity="0.25" />
            </>
          )}
        </linearGradient>
      </defs>
      {RINGS.map((ring, i) => (
        <g key={i} data-ring>
          <circle
            data-arc
            cx="50"
            cy="50"
            r={ring.r}
            stroke={`url(#${id})`}
            strokeWidth={ring.w}
            strokeLinecap="round"
            strokeDasharray={ring.dash}
          />
          <circle cx={50 + ring.r} cy="50" r={ring.w * 0.75} fill={`url(#${id})`} />
        </g>
      ))}
    </svg>
  );
}
