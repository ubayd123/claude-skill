"use client";

import { useRef, type HTMLAttributes, type PointerEvent } from "react";

/**
 * Card with a soft red spotlight and 3D tilt that follow the pointer.
 * Adapted from SpotlightCard in React Bits (https://reactbits.dev, MIT + Commons Clause, © David Haz):
 * simplified to CSS variables so it costs nothing until hovered.
 */
export default function SpotlightCard({ children, className = "", tilt = 5, ...rest }: HTMLAttributes<HTMLDivElement> & { tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--sx", `${x}px`);
    el.style.setProperty("--sy", `${y}px`);
    el.style.setProperty("--rx", `${((y / r.height) - 0.5) * -tilt}deg`);
    el.style.setProperty("--ry", `${((x / r.width) - 0.5) * tilt}deg`);
    el.style.setProperty("--so", "1");
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--so", "0");
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative isolate overflow-hidden [transform:perspective(1100px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 opacity-[var(--so,0)] transition-opacity duration-500 [background:radial-gradient(420px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(229_9_32/0.13),transparent_60%)]"
      />
      {children}
    </div>
  );
}
