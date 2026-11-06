"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, requestPasswordReset, setPassword } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { Field, FormMessage, Submit } from "./FormBits";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, initialFormState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" type="password" required autoComplete="current-password" />
      <FormMessage state={state} />
      <Submit className="btn btn-ink w-full">Sign in <span className="arrow">→</span></Submit>
      <p className="text-center text-sm"><Link href="/forgot-password" className="text-muted link-u hover:text-ink">Forgotten your password?</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, initialFormState);
  if (state.ok) return <p role="status" className="rounded-2xl bg-blush p-5 text-sm">{state.message}</p>;
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <FormMessage state={state} />
      <Submit className="btn btn-ink w-full">Send reset link</Submit>
    </form>
  );
}

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(setPassword, initialFormState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" type="password" required autoComplete="new-password" hint="At least 12 characters, with letters and a number." error={state.errors?.password} />
      <Field label="Confirm password" name="confirm" type="password" required autoComplete="new-password" error={state.errors?.confirm} />
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full">Set password and sign in</Submit>
    </form>
  );
}
