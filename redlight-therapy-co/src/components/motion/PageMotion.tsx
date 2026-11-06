"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let firstMount = true;

/** Split the text nodes of an element into masked words, keeping nested markup (e.g. coloured spans). */
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = "1";
  const label = el.textContent ?? "";
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            continue;
          }
          const outer = document.createElement("span");
          outer.className = "split-word";
          outer.setAttribute("aria-hidden", "true");
          const inner = document.createElement("span");
          inner.className = "split-inner";
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName !== "BR") {
        walk(child);
      }
    }
  };
  walk(el);
  el.setAttribute("aria-label", label.replace(/\s+/g, " ").trim());
}

/**
 * Declarative scroll motion for every page. Mark elements with:
 *  data-split            masked word rise (data-split="load" plays immediately)
 *  data-reveal           fade/rise on enter: up | left | right | scale | fade
 *  data-parallax="0.2"   scrubbed vertical drift
 *  data-zoom             image settles from 1.2 to 1 while scrolling past
 *  data-count="660"      count-up (data-decimals, data-suffix)
 *  data-delay            extra delay in seconds
 */
export default function PageMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showCurtain = !firstMount && !reduce;
    firstMount = false;

    const ctx = gsap.context(() => {
      if (showCurtain && curtain.current) {
        gsap.fromTo(
          curtain.current,
          { yPercent: 0 },
          { yPercent: -100, duration: 0.95, ease: "expo.inOut", delay: 0.05 },
        );
      }
      if (reduce) {
        gsap.set(root.querySelectorAll("[data-reveal]"), { opacity: 1 });
        gsap.set(root.querySelectorAll("[data-split]"), { visibility: "visible" });
        return;
      }
      const baseDelay = showCurtain ? 0.45 : 0;

      root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        splitWords(el);
        gsap.set(el, { visibility: "visible" });
        const onLoad = el.dataset.split === "load";
        gsap.from(el.querySelectorAll(".split-inner"), {
          yPercent: 115,
          rotate: 5,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.07,
          delay: Number(el.dataset.delay || 0) + (onLoad ? baseDelay : 0),
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 88%", once: true },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const v = el.dataset.reveal || "up";
        const inView = el.getBoundingClientRect().top < window.innerHeight;
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: v === "up" ? 46 : 0,
            x: v === "left" ? -70 : v === "right" ? 70 : 0,
            scale: v === "scale" ? 0.9 : 1,
            filter: "blur(10px)",
          },
          {
            opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)",
            duration: 1.15,
            ease: "expo.out",
            delay: Number(el.dataset.delay || 0) + (inView ? baseDelay : 0),
            clearProps: "filter",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.parallax || 0.2);
        gsap.fromTo(
          el,
          { yPercent: speed * 50 },
          {
            yPercent: -speed * 50,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-zoom]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.22 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom 40%", scrub: true } },
        );
      });

      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const decimals = Number(el.dataset.decimals || 0);
        const state = { v: 0 };
        el.textContent = (0).toFixed(decimals);
        gsap.to(state, {
          v: end,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onUpdate: () => {
            el.textContent = state.v.toFixed(decimals);
          },
        });
      });
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={ref}>
      {children}
      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-ink"
        style={{ transform: "translateY(-100%)" }}
      >
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-ember via-red to-red-deep" />
        <span className="display text-xl text-white/90 tracking-[0.3em]">REDLIGHT</span>
      </div>
    </div>
  );
}
