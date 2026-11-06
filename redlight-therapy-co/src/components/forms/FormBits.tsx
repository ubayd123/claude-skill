"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { gsap } from "gsap";
import type { FormState } from "@/app/actions/types";

/** Honeypot + fill-time fields read by looksLikeBot() on the server. */
export function BotFields() {
  const [started, setStarted] = useState("");
  useEffect(() => setStarted(String(Date.now())), []);
  return (
    <>
      <input type="hidden" name="startedAt" value={started} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="company_url_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );
}

export function Field({
  label, name, type = "text", required, error, autoComplete, defaultValue, placeholder, textarea, hint, className = "",
}: {
  label: string; name: string; type?: string; required?: boolean; error?: string; autoComplete?: string;
  defaultValue?: string; placeholder?: string; textarea?: boolean; hint?: string; className?: string;
}) {
  const id = `f-${name}`;
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label} {required && <span className="text-red" aria-hidden="true">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} className="input" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      ) : (
        <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} defaultValue={defaultValue} placeholder={placeholder} className="input" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      )}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

export function Submit({ children, className = "btn btn-red" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60`} aria-busy={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> Sending…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message || state.ok) return null;
  return (
    <p role="alert" className="rounded-2xl border border-red/30 bg-blush px-4 py-3 text-sm text-red-deep">
      {state.message}
    </p>
  );
}

export function SuccessPanel({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline();
    tl.from(ref.current, { scale: 0.94, opacity: 0, duration: 0.8, ease: "expo.out" })
      .from(ref.current.querySelector("[data-check]"), { scale: 0, rotate: -90, duration: 0.8, ease: "back.out(2)" }, 0.1)
      .from(ref.current.querySelectorAll("[data-s]"), { y: 16, opacity: 0, stagger: 0.08, duration: 0.7, ease: "expo.out" }, 0.25);
    ref.current.focus();
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-[1.75rem] border border-line bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgb(16_16_16/0.4)] outline-none sm:p-12">
      <span data-check className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red text-white shadow-[0_0_40px_6px_rgb(229_9_32/0.35)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <h3 data-s className="display mt-6 text-3xl">{title}</h3>
      <p data-s className="mx-auto mt-3 max-w-md text-muted">{message}</p>
      {children && <div data-s className="mt-6">{children}</div>}
    </div>
  );
}

export const COUNTRIES_HINT = "e.g. United Kingdom";
