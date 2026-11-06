import "server-only";
import { z } from "zod";
import type { FormState } from "@/app/actions/types";

export const str = (max: number, min = 0, label = "This field") =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long`)
    .min(min, min > 0 ? `${label} is required` : undefined);

export const email = z.string().trim().toLowerCase().max(200).email("Enter a valid email address");

export function fd(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export function zodErrors(error: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false, message: "Please check the highlighted fields.", errors };
}

/** Bot checks shared by public forms: hidden honeypot field and a minimum fill time. */
export function looksLikeBot(formData: FormData) {
  if (fd(formData, "company_url_hp")) return true;
  const started = Number(fd(formData, "startedAt"));
  if (!started) return true;
  const elapsed = Date.now() - started;
  return elapsed < 2500 || elapsed > 1000 * 60 * 60 * 24;
}
