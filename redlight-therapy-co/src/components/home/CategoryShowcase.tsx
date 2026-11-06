"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Cat = { slug: string; name: string; shortName: string; tagline: string; description: string; image: string; products: { name: string; slug: string; image: string }[] };

const THEMES = [
  { panel: "bg-white", text: "text-ink", sub: "text-muted", chip: "border-line text-ink/80", btn: "btn-ink" },
  { panel: "bg-ink", text: "text-white", sub: "text-muted-dark", chip: "border-white/15 text-white/80", btn: "btn-red" },
  { panel: "bg-blush", text: "text-ink", sub: "text-muted", chip: "border-red/20 text-ink/80", btn: "btn-ink" },
];

/** Pinned horizontal scroll of the three main ranges on desktop; stacked reveals on mobile. */
export default function CategoryShowcase({ categories }: { categories: Cat[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const scroll = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray<HTMLElement>("[data-cat-img]", el).forEach((img) => {
        gsap.fromTo(img, { xPercent: -12, scale: 1.18 }, { xPercent: 12, scale: 1.05, ease: "none", scrollTrigger: { trigger: img.closest("[data-cat]"), containerAnimation: scroll, start: "left right", end: "right left", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>("[data-cat-copy]", el).forEach((copy) => {
        gsap.from(copy.children, { y: 60, opacity: 0, stagger: 0.08, ease: "expo.out", duration: 1.2, scrollTrigger: { trigger: copy, containerAnimation: scroll, start: "left 80%", toggleActions: "play none none reverse" } });
      });
      gsap.to("[data-cat-progress]", { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: true } });
    });
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray<HTMLElement>("[data-cat]", el).forEach((c) => {
        gsap.from(c, { y: 80, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 85%", once: true } });
        const img = c.querySelector("[data-cat-img]");
        if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-paper py-20 lg:h-[100dvh] lg:py-0" aria-labelledby="range-title">
      <div className="lg:flex lg:h-full lg:flex-col lg:justify-center">
        <div className="container-x mb-10 flex items-end justify-between gap-6 lg:mb-8">
          <div>
            <p className="eyebrow text-red">The range</p>
            <h2 id="range-title" className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]">Explore the categories</h2>
          </div>
          <div className="hidden w-56 lg:block">
            <div className="h-[2px] w-full overflow-hidden rounded bg-line">
              <div data-cat-progress className="h-full origin-left scale-x-0 bg-red" />
            </div>
            <p className="mt-2 text-right text-xs text-muted">Scroll to move through</p>
          </div>
        </div>
        <div ref={track} className="flex flex-col gap-6 px-4 sm:px-8 lg:w-max lg:flex-row lg:gap-8 lg:px-14">
          {categories.map((c, i) => {
            const t = THEMES[i % THEMES.length];
            return (
              <article
                key={c.slug}
                data-cat
                className={`relative grid overflow-hidden rounded-[2.25rem] ${t.panel} shadow-[0_40px_80px_-50px_rgb(16_16_16/0.45)] ring-1 ring-black/5 lg:h-[68vh] grid-cols-1 lg:w-[min(82vw,78rem)] lg:grid-cols-[1.1fr_1fr]`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-night lg:aspect-auto">
                  <div data-cat-img className="absolute inset-0">
                    <Image src={c.image} alt={`${c.name} product photography`} fill sizes="(min-width:1024px) 42vw, 100vw" className="object-cover" />
                  </div>
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,transparent_40%,rgb(7_7_7/0.55))]" />
                  <span className="absolute left-6 top-6 font-[family-name:var(--font-display)] text-sm font-bold text-white/80">0{i + 1}</span>
                </div>
                <div data-cat-copy className={`flex min-w-0 flex-col justify-center gap-5 p-6 sm:p-12 ${t.text}`}>
                  <p className="eyebrow text-red">{c.name}</p>
                  <h3 className="display break-words text-[clamp(1.9rem,3.6vw,3.6rem)]">{c.tagline}</h3>
                  <p className={`max-w-md leading-relaxed ${t.sub}`}>{c.description}</p>
                  <ul className="flex flex-wrap gap-2">
                    {c.products.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/products/${p.slug}`} className={`inline-block rounded-full border px-3 py-1.5 text-xs transition hover:border-red hover:text-red ${t.chip}`}>
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Link href={`/products/category/${c.slug}`} className={`btn ${t.btn}`}>
                      Explore {(c.shortName || c.name).toLowerCase()} <span className="arrow">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
