"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LightRings from "@/components/motion/LightRings";
import Magnetic from "@/components/motion/Magnetic";

type Slide = { name: string; image: string; alt: string; category: string; slug: string };

export default function Hero({ slides, eyebrow, headline, subtext }: { slides: Slide[]; eyebrow: string; headline: string; subtext: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Headline: put the word "light" in the red gradient wherever it appears.
  const words = headline.split(/\s+/);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const imgs = gsap.utils.toArray<HTMLElement>("[data-slide]");
      gsap.set(imgs, { opacity: 0 });
      gsap.set(imgs[0], { opacity: 1 });
      if (reduce) return;

      // Entrance choreography
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from("[data-hero-eyebrow]", { y: 20, opacity: 0, duration: 0.9 }, 0.25)
        .from("[data-hero-word]", { yPercent: 115, rotate: 6, duration: 1.3, stagger: 0.08 }, 0.3)
        .from("[data-hero-sub]", { y: 24, opacity: 0, filter: "blur(8px)", duration: 1 }, 0.8)
        .from("[data-hero-cta] > *", { y: 24, opacity: 0, stagger: 0.1, duration: 1 }, 0.95)
        .from("[data-hero-stat]", { y: 20, opacity: 0, stagger: 0.08, duration: 0.9 }, 1.1)
        .from(stage.current, { clipPath: "inset(30% 20% 30% 20% round 2.5rem)", scale: 0.9, duration: 1.6, ease: "expo.inOut" }, 0.1)
        .from("[data-float]", { y: 80, opacity: 0, rotate: (i) => (i % 2 ? 10 : -10), stagger: 0.12, duration: 1.4 }, 0.9);

      // Ken Burns crossfade slideshow
      const show = gsap.timeline({ repeat: -1, delay: 1.4 });
      imgs.forEach((img, i) => {
        const next = imgs[(i + 1) % imgs.length];
        show
          .fromTo(img.querySelector("img"), { scale: 1.16, xPercent: i % 2 ? -3 : 3 }, { scale: 1.02, xPercent: 0, duration: 5, ease: "none" }, i * 4.2)
          .to(img, { opacity: 0, duration: 1.1, ease: "power2.inOut" }, i * 4.2 + 4)
          .to(next, { opacity: 1, duration: 1.1, ease: "power2.inOut", onStart: () => setIndex((i + 1) % imgs.length) }, i * 4.2 + 4);
      });
      gsap.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, duration: 4.2, ease: "none", repeat: -1, delay: 1.4 });

      // Floating cards bob
      gsap.utils.toArray<HTMLElement>("[data-float-inner]").forEach((f, i) => {
        gsap.to(f, { y: i % 2 ? 16 : -18, rotate: i % 2 ? -2 : 2, duration: 3.2 + i * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
      gsap.to("[data-glow]", { scale: 1.12, opacity: 0.95, duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // Scroll: stage drifts and shrinks, copy rises
      gsap.to("[data-stage-scroll]", { yPercent: 10, scale: 0.92, rotate: -1.5, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero-copy]", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-float]", { yPercent: (i) => (i % 2 ? -90 : -50), ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    }, el);

    // Pointer parallax (desktop only)
    let cleanup = () => {};
    if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches && stage.current) {
      const rx = gsap.quickTo(stage.current, "rotationY", { duration: 1.2, ease: "power3.out" });
      const ry = gsap.quickTo(stage.current, "rotationX", { duration: 1.2, ease: "power3.out" });
      const floats = gsap.utils.toArray<HTMLElement>("[data-float-pointer]", el).map((f) => ({ x: gsap.quickTo(f, "x", { duration: 1.4, ease: "power3.out" }), y: gsap.quickTo(f, "y", { duration: 1.4, ease: "power3.out" }) }));
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        rx(nx * 8);
        ry(-ny * 6);
        floats.forEach((f, i) => {
          f.x(nx * (i % 2 ? -50 : 40));
          f.y(ny * (i % 2 ? -36 : 30));
        });
      };
      window.addEventListener("pointermove", move);
      cleanup = () => window.removeEventListener("pointermove", move);
    }
    return () => {
      cleanup();
      ctx.revert();
    };
  }, []);

  const current = slides[index];
  const floatA = slides.find((s) => s.slug.includes("starter")) ?? slides[1];
  const floatB = slides.find((s) => s.slug.includes("hair")) ?? slides[2];

  return (
    <section ref={root} className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:min-h-[100dvh] lg:pb-10">
      {/* Ambient light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[20%] top-[-10%] h-[70rem] w-[70rem] rounded-full bg-[radial-gradient(closest-side,rgb(229_9_32/0.16),rgb(240_100_60/0.08)_45%,transparent_70%)]" />
        <div className="absolute -left-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(240_100_60/0.10),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(16_16_16/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(16_16_16/0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_30%_40%,#000_20%,transparent_70%)]" />
      </div>

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-10">
        <div data-hero-copy className="relative z-10">
          <p data-hero-eyebrow className="inline-flex items-center gap-3 rounded-full border border-line bg-white/70 py-2 pl-2 pr-4 backdrop-blur">
            <span className="relative grid h-6 w-6 place-items-center rounded-full bg-red/10">
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-red/60" />
              <span className="h-2 w-2 rounded-full bg-red" />
            </span>
            <span className="eyebrow text-ink/80">{eyebrow}</span>
          </p>
          <h1 className="display mt-7 text-[clamp(3.1rem,8.6vw,8.4rem)] text-ink" aria-label={headline}>
            {words.map((w, i) => {
              const isLight = /^light/i.test(w);
              return (
                <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-top">
                  <span data-hero-word className={`inline-block ${isLight ? "bg-gradient-to-br from-ember via-red to-red-deep bg-clip-text pr-[0.04em] text-transparent" : ""}`}>
                    {w}
                  </span>
                  {i < words.length - 1 && <span>&nbsp;</span>}
                </span>
              );
            })}
          </h1>
          <p data-hero-sub className="mt-7 max-w-[34rem] text-lg leading-relaxed text-muted sm:text-xl">
            {subtext}
          </p>
          <div data-hero-cta className="mt-9 flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/products" className="btn btn-red">
                Explore our products <span className="arrow">→</span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/wholesale" className="btn btn-ghost">
                Become a wholesale partner <span className="arrow">→</span>
              </Link>
            </Magnetic>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            {[
              ["660 nm", "Red peak, measured*"],
              ["850 nm", "Near-infrared peak*"],
              [`${slides.length}`, "Devices in the range"],
            ].map(([v, l]) => (
              <div key={l} data-hero-stat>
                <dt className="sr-only">{l}</dt>
                <dd className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">{v}</dd>
                <dd className="mt-1 text-xs leading-snug text-muted">{l}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-muted">*300 LED panel, from the instrument measurement in our documentation pack.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem] [perspective:1400px] lg:max-w-none">
          <div data-glow aria-hidden="true" className="absolute inset-x-[8%] bottom-[-6%] top-[12%] rounded-full bg-[radial-gradient(closest-side,rgb(229_9_32/0.55),rgb(240_100_60/0.2)_50%,transparent_75%)] opacity-70 blur-2xl" />
          <div data-stage-scroll className="relative">
          <div
            ref={stage}
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-night shadow-[0_60px_120px_-40px_rgb(16_16_16/0.6)] ring-1 ring-black/5 [transform-style:preserve-3d] lg:aspect-auto lg:h-[min(78vh,52rem)]"
          >
            {slides.map((s, i) => (
              <div key={s.slug} data-slide className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                <Image src={s.image} alt={s.alt} fill priority={i === 0} sizes="(min-width:1024px) 46vw, 92vw" className="object-cover" />
              </div>
            ))}
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_7_7/0.25),transparent_30%,transparent_55%,rgb(7_7_7/0.85))]" />
            <LightRings className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 opacity-50 mix-blend-screen" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4 text-white">
                <div>
                  <p className="eyebrow text-white/60">{current?.category}</p>
                  <p key={current?.slug} className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold sm:text-2xl animate-[fadeUp_.8s_cubic-bezier(.16,1,.3,1)]">{current?.name}</p>
                </div>
                <p className="whitespace-nowrap font-[family-name:var(--font-display)] text-sm tabular-nums text-white/70">
                  {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </p>
              </div>
              <div className="mt-5 h-[2px] overflow-hidden rounded bg-white/15">
                <div data-progress className="h-full origin-left bg-gradient-to-r from-ember to-red" />
              </div>
            </div>
          </div>
          </div>

          {[floatA, floatB].map((f, i) =>
            f ? (
              <div
                key={f.slug}
                data-float
                className={`absolute z-10 hidden w-44 sm:block xl:w-52 ${i === 0 ? "-left-10 top-[14%] xl:-left-16" : "-right-6 bottom-[18%] xl:-right-12"}`}
              >
                <div data-float-pointer>
                <Link href={`/products/${f.slug}`} data-float-inner className="block rounded-[1.4rem] border border-white/60 bg-white/85 p-2 shadow-[0_30px_60px_-24px_rgb(16_16_16/0.5)] backdrop-blur-xl">
                  <span className="relative block aspect-square overflow-hidden rounded-2xl bg-night">
                    <Image src={f.image} alt="" fill sizes="208px" className="object-cover" />
                  </span>
                  <span className="block px-2 pb-1 pt-3 text-[0.78rem] font-semibold leading-snug">{f.name}</span>
                  <span className="block px-2 pb-2 text-[0.7rem] text-red">View product →</span>
                </Link>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>

      <div aria-hidden="true" className="container-x relative mt-10 hidden items-center gap-3 text-[0.7rem] uppercase tracking-[0.3em] text-muted lg:flex">
        <span className="relative h-10 w-[1px] overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollLine_1.8s_ease-in-out_infinite] bg-red" />
        </span>
        Scroll to explore
      </div>
    </section>
  );
}
