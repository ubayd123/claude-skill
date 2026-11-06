"use client";

import { useActionState } from "react";
import { applyForWholesale } from "@/app/actions/wholesale";
import { initialFormState } from "@/app/actions/types";
import { BotFields, Field, FormMessage, Submit, SuccessPanel } from "./FormBits";
import { BUSINESS_TYPES } from "@/lib/site";

export default function ApplicationForm({ products }: { products: string[] }) {
  const [state, action] = useActionState(applyForWholesale, initialFormState);
  if (state.ok) return <SuccessPanel title="Application received" message={state.message} />;
  const e = state.errors;
  return (
    <form action={action} className="space-y-5">
      <BotFields />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" name="businessName" required autoComplete="organization" error={e?.businessName} />
        <Field label="Contact name" name="contactName" required autoComplete="name" error={e?.contactName} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={e?.email} />
        <Field label="Telephone" name="phone" type="tel" required autoComplete="tel" error={e?.phone} />
        <Field label="Country" name="country" required autoComplete="country-name" error={e?.country} />
        <Field label="Business website" name="website" type="text" placeholder="www.yourbusiness.com" error={e?.website} />
      </div>
      <div className="field">
        <label htmlFor="f-businessType">Business type <span className="text-red">*</span></label>
        <select id="f-businessType" name="businessType" required defaultValue="" className="input" aria-invalid={!!e?.businessType}>
          <option value="" disabled>Choose one</option>
          {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        {e?.businessType && <p className="mt-1.5 text-xs font-medium text-red">{e.businessType}</p>}
      </div>
      <fieldset>
        <legend className="mb-2 text-[0.78rem] font-semibold">Products of interest</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((p) => (
            <label key={p} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm transition has-[:checked]:border-red has-[:checked]:bg-blush">
              <input type="checkbox" name="productsOfInterest" value={p} className="h-4 w-4 accent-[#e50920]" />
              {p}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Estimated order quantities" name="estimatedQuantities" placeholder="e.g. 50 face masks and 20 panels per quarter" error={e?.estimatedQuantities} />
      <Field label="Additional information" name="additionalInfo" textarea error={e?.additionalInfo} />
      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#e50920]" />
        <span>I agree that Redlight Therapy Co. may store these details and contact me about my application, as described in the <a href="/privacy" className="text-red link-u">privacy policy</a>.</span>
      </label>
      {e?.consent && <p className="text-xs font-medium text-red">{e.consent}</p>}
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full sm:w-auto">Apply for a wholesale account <span className="arrow">→</span></Submit>
    </form>
  );
}
