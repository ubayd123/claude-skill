"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { gsap } from "gsap";

/** Main image with pointer-follow zoom, plus thumbnails that crossfade. */
export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !frame.current || !zoom.current) return;
    const r = frame.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    gsap.to(zoom.current, { scale: 1.7, transformOrigin: `${x}% ${y}%`, duration: 0.6, ease: "power3.out" });
  };
  const onLeave = () => zoom.current && gsap.to(zoom.current, { scale: 1, duration: 0.8, ease: "expo.out" });
  const pick = (i: number) => {
    if (i === active || !zoom.current) return setActive(i);
    gsap.fromTo(zoom.current, { opacity: 0.2, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" });
    setActive(i);
  };

  return (
    <div>
      <div
        ref={frame}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem] bg-night shadow-[0_50px_100px_-50px_rgb(16_16_16/0.6)]"
      >
        <div ref={zoom} className="absolute inset-0" data-reveal="scale">
          {images[active] && <Image src={images[active]} alt={alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />}
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] -bottom-24 h-48 rounded-full bg-red/40 blur-3xl" />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => pick(i)}
              className={`relative h-20 w-20 overflow-hidden rounded-2xl bg-night ring-2 transition ${i === active ? "ring-red" : "ring-transparent opacity-70 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
