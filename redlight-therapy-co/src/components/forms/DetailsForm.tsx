"use client";

import { useActionState } from "react";
import { updateBusinessDetails } from "@/app/actions/account";
import { initialFormState } from "@/app/actions/types";
import { Field, FormMessage, Submit } from "./FormBits";

type P = { businessName: string; contactName: string; phone: string; country: string; website: string; businessType: string; address: string };

export default function DetailsForm({ profile }: { profile: P }) {
  const [state, action] = useActionState(updateBusinessDetails, initialFormState);
  const e = state.errors;
  return (
    <form action={action} className="card max-w-3xl space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" name="businessName" required defaultValue={profile.businessName} error={e?.businessName} />
        <Field label="Contact name" name="contactName" required defaultValue={profile.contactName} error={e?.contactName} />
        <Field label="Telephone" name="phone" type="tel" defaultValue={profile.phone} error={e?.phone} />
        <Field label="Country" name="country" defaultValue={profile.country} error={e?.country} />
        <Field label="Website" name="website" defaultValue={profile.website} error={e?.website} />
        <Field label="Business type" name="businessType" defaultValue={profile.businessType} error={e?.businessType} />
      </div>
      <Field label="Delivery address" name="address" textarea defaultValue={profile.address} error={e?.address} />
      <FormMessage state={state} />
      {state.ok && <p role="status" className="rounded-xl bg-blush px-4 py-3 text-sm">{state.message}</p>}
      <Submit className="btn btn-ink">Save details</Submit>
      <p className="text-xs text-muted">To change your sign-in email, contact us.</p>
    </form>
  );
}
