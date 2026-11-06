"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useEnquiryList } from "./EnquiryListProvider";
import { lenisStore } from "@/components/motion/SmoothScroll";

export default function EnquiryDrawer() {
  const { items, open, setOpen, setQuantity, remove } = useEnquiryList();
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const p = panel.current;
    const b = backdrop.current;
    if (!p || !b) return;
    if (open) {
      lenisStore.current?.stop();
      gsap.set([p, b], { display: "block" });
      gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo(p, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: "expo.out" });
      gsap.fromTo(p.querySelectorAll("[data-item]"), { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, delay: 0.15, duration: 0.6, ease: "expo.out" });
      closeBtn.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    lenisStore.current?.start();
    gsap.to(b, { opacity: 0, duration: 0.3 });
    gsap.to(p, { xPercent: 100, duration: 0.5, ease: "expo.in", onComplete: () => gsap.set([p, b], { display: "none" }) });
  }, [open, setOpen]);

  return (
    <>
      <div ref={backdrop} onClick={() => setOpen(false)} className="fixed inset-0 z-[80] hidden bg-ink/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your enquiry list"
        className="fixed inset-y-0 right-0 z-[85] hidden w-full max-w-md bg-paper shadow-2xl"
        data-lenis-prevent
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <p className="eyebrow text-red">Enquiry list</p>
              <p className="mt-1 text-sm text-muted">Add products and quantities, then send one enquiry.</p>
            </div>
            <button ref={closeBtn} onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-white" aria-label="Close enquiry list">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
                Your enquiry list is empty.
                <br />
                <Link href="/products" onClick={() => setOpen(false)} className="mt-3 inline-block font-semibold text-red link-u">Browse products</Link>
              </div>
            )}
            {items.map((item) => (
              <div key={item.productId} data-item className="flex gap-4 rounded-2xl border border-line bg-white p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink">
                  {item.image && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug">{item.name}</p>
                    <button onClick={() => remove(item.productId)} className="text-xs text-muted hover:text-red" aria-label={`Remove ${item.name}`}>Remove</button>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Quantity
                    <span className="flex items-center rounded-full border border-line">
                      <button type="button" className="h-8 w-8 rounded-full hover:bg-paper" onClick={() => setQuantity(item.productId, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                        className="w-16 bg-transparent text-center text-sm font-semibold text-ink [appearance:textfield]"
                        aria-label={`Quantity of ${item.name}`}
                      />
                      <button type="button" className="h-8 w-8 rounded-full hover:bg-paper" onClick={() => setQuantity(item.productId, item.quantity + 1)} aria-label="Increase quantity">+</button>
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line px-6 py-5">
            <Link
              href="/enquiry"
              onClick={() => setOpen(false)}
              aria-disabled={items.length === 0}
              className={`btn btn-red w-full ${items.length === 0 ? "pointer-events-none opacity-40" : ""}`}
            >
              Continue to enquiry <span className="arrow">→</span>
            </Link>
            <p className="mt-3 text-center text-xs text-muted">No payment is taken online. We reply by email with a quotation.</p>
          </div>
        </div>
      </div>
    </>
  );
}
