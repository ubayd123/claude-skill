"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/types";

function SubmitBtn({ label, danger }: { label: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn btn-sm ${danger ? "btn-red" : "btn-ink"} disabled:opacity-60`}>
      {pending ? "Saving…" : label}
    </button>
  );
}

/** Wraps any admin server action with pending state and inline success / error messages. */
export default function AdminForm({
  action, children, submitLabel = "Save", className = "", danger, resetOnSuccess,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  children: ReactNode; submitLabel?: string; className?: string; danger?: boolean; resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, { ok: false, message: "" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={`space-y-4 ${className}`}>
      {children}
      {state.message && (
        <div role={state.ok ? "status" : "alert"} className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-blush text-red-deep"}`}>
          {state.message}
          {state.errors && (
            <ul className="mt-1 list-disc pl-5 text-xs">
              {Object.entries(state.errors).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
            </ul>
          )}
          {state.link && (
            <div className="mt-2 flex gap-2">
              <input readOnly value={state.link} className="input py-2 text-xs" onFocus={(e) => e.currentTarget.select()} aria-label="One-time link" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(state.link ?? "")}>Copy</button>
            </div>
          )}
        </div>
      )}
      <SubmitBtn label={submitLabel} danger={danger} />
    </form>
  );
}
