"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ProductEnquiryForm } from "@/components/forms/EnquiryForms";
import { lenisStore } from "@/components/motion/SmoothScroll";
import Magnetic from "@/components/motion/Magnetic";

type Props = {
  product: { id: number; name: string };
  models: string[];
  prefill?: { name?: string; business?: string; email?: string; phone?: string; country?: string };
  price?: string | null;
  moq?: number;
};

export default function EnquireModal(props: Props) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open) {
      d.showModal();
      lenisStore.current?.stop();
      gsap.fromTo(d, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
    } else if (d.open) {
      gsap.to(d, { y: 20, opacity: 0, duration: 0.25, onComplete: () => { d.close(); opener.current?.focus(); } });
      lenisStore.current?.start();
    }
  }, [open]);

  return (
    <>
      <Magnetic strength={0.2}>
        <button ref={opener} type="button" onClick={() => setOpen(true)} className="btn btn-red px-8 py-5 text-[0.82rem]">
          Enquire about this product <span className="arrow">→</span>
        </button>
      </Magnetic>
      <dialog
        ref={dialog}
        onCancel={(e) => { e.preventDefault(); setOpen(false); }}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        className="m-auto w-[min(44rem,calc(100vw-1.5rem))] max-h-[92dvh] overflow-y-auto rounded-[2rem] bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
        aria-labelledby="enq-title"
        data-lenis-prevent
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-paper/95 px-6 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="eyebrow text-red">Order enquiry</p>
            <h2 id="enq-title" className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold">{props.product.name}</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line hover:bg-white" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
        </div>
        <div className="px-6 py-6 sm:px-8">{open && <ProductEnquiryForm {...props} />}</div>
      </dialog>
    </>
  );
}
