"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { submitEnquiry } from "@/app/actions/enquiry";
import { initialFormState } from "@/app/actions/types";
import { useEnquiryList } from "@/components/enquiry/EnquiryListProvider";
import { BotFields, Field, FormMessage, Submit, SuccessPanel } from "./FormBits";
import { BUSINESS_EMAIL } from "@/lib/site";

type Prefill = { name?: string; business?: string; email?: string; phone?: string; country?: string };

function ContactFields({ errors, prefill, businessRequired }: { errors?: Record<string, string>; prefill?: Prefill; businessRequired?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Your name" name="name" required autoComplete="name" error={errors?.name} defaultValue={prefill?.name} />
      <Field label="Business name" name="business" required={businessRequired} autoComplete="organization" error={errors?.business} defaultValue={prefill?.business} />
      <Field label="Email" name="email" type="email" required autoComplete="email" error={errors?.email} defaultValue={prefill?.email} />
      <Field label="Telephone" name="phone" type="tel" autoComplete="tel" error={errors?.phone} defaultValue={prefill?.phone} />
      <Field label="Country" name="country" autoComplete="country-name" error={errors?.country} defaultValue={prefill?.country} className="sm:col-span-2" />
    </div>
  );
}

/** Multi-product enquiry built from the enquiry list. */
export function OrderEnquiryForm({ prefill, prices, moqText }: { prefill?: Prefill; prices?: Record<number, string>; moqText?: string }) {
  const { items, setQuantity, remove, clear } = useEnquiryList();
  const [state, action] = useActionState(submitEnquiry, initialFormState);
  useEffect(() => {
    if (state.ok) clear();
  }, [state.ok, clear]);

  if (state.ok) {
    return (
      <SuccessPanel title="Enquiry sent" message={state.message}>
        <Link href="/products" className="btn btn-ink">Back to products</Link>
      </SuccessPanel>
    );
  }
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <BotFields />
      <input type="hidden" name="kind" value="order" />
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity })))} />
      <section className="card p-5 sm:p-7" aria-labelledby="list-h">
        <div className="flex items-center justify-between">
          <h2 id="list-h" className="font-[family-name:var(--font-display)] text-xl font-bold">Products</h2>
          <Link href="/products" className="text-sm font-semibold text-red link-u">+ Add more</Link>
        </div>
        {items.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
            Your enquiry list is empty. <Link href="/products" className="font-semibold text-red">Browse the catalogue</Link> and choose “Request pricing” on any product.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-line">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-4 py-4">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-night">{i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{i.name}</p>
                  {prices?.[i.productId] && <p className="mt-1 text-xs text-muted">Trade price {prices[i.productId]}</p>}
                  <button type="button" onClick={() => remove(i.productId)} className="mt-1 text-xs text-muted hover:text-red">Remove</button>
                </div>
                <label className="text-xs text-muted">
                  <span className="sr-only">Quantity of {i.name}</span>
                  <input type="number" min={1} max={100000} value={i.quantity} onChange={(e) => setQuantity(i.productId, Number(e.target.value))} className="input w-24 text-center font-semibold" />
                </label>
              </li>
            ))}
          </ul>
        )}
        {moqText && <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-xs text-muted">Minimum order: {moqText}.</p>}
      </section>
      <section className="card p-5 sm:p-7" aria-labelledby="det-h">
        <h2 id="det-h" className="font-[family-name:var(--font-display)] text-xl font-bold">Your details</h2>
        <div className="mt-5 space-y-4">
          <ContactFields errors={state.errors} prefill={prefill} businessRequired />
          <Field label="Order notes and additional information" name="notes" textarea error={state.errors?.notes} placeholder="Delivery country, timescales, branding questions…" />
          <FormMessage state={state} />
          <Submit className="btn btn-red w-full">Submit enquiry <span className="arrow">→</span></Submit>
          <p className="text-center text-xs text-muted">No payment is taken. Your enquiry goes to {BUSINESS_EMAIL} and you receive a confirmation by email.</p>
        </div>
      </section>
    </form>
  );
}

/** Single-product enquiry used on every product page. */
export function ProductEnquiryForm({ product, models, prefill, price, moq }: { product: { id: number; name: string }; models: string[]; prefill?: Prefill; price?: string | null; moq?: number }) {
  const [state, action] = useActionState(submitEnquiry, initialFormState);
  const [qty, setQty] = useState(moq && moq > 1 ? moq : 1);
  const [model, setModel] = useState(models[0] ?? "");
  if (state.ok) return <SuccessPanel title="Enquiry sent" message={state.message} />;
  return (
    <form action={action} className="space-y-4">
      <BotFields />
      <input type="hidden" name="kind" value="order" />
      <input type="hidden" name="items" value={JSON.stringify([{ productId: product.id, quantity: qty, model: model || undefined }])} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="pe-qty">Quantity <span className="text-red">*</span></label>
          <input id="pe-qty" type="number" min={1} max={100000} required value={qty} onChange={(e) => setQty(Math.max(1, Math.round(Number(e.target.value)) || 1))} className="input" />
          {moq ? <p className="mt-1.5 text-xs text-muted">Minimum order {moq} units per product</p> : null}
        </div>
        {models.length > 1 ? (
          <div className="field">
            <label htmlFor="pe-model">Model</label>
            <select id="pe-model" value={model} onChange={(e) => setModel(e.target.value)} className="input">
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        ) : (
          <div className="field">
            <label>Product</label>
            <p className="input bg-paper text-sm">{product.name}{models[0] ? ` · ${models[0]}` : ""}</p>
          </div>
        )}
      </div>
      {price && <p className="rounded-xl bg-blush px-4 py-3 text-sm">Your trade price: <strong className="text-red">{price}</strong> per unit</p>}
      <ContactFields errors={state.errors} prefill={prefill} businessRequired />
      <Field label="Additional information" name="notes" textarea error={state.errors?.notes} />
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full">Send enquiry <span className="arrow">→</span></Submit>
      <p className="text-center text-xs text-muted">No payment is taken online. We reply by email with availability and a quotation.</p>
    </form>
  );
}

/** General contact / wholesale / distribution / bulk enquiry. */
export function ContactForm({ prefill, defaultKind = "contact" }: { prefill?: Prefill; defaultKind?: string }) {
  const [state, action] = useActionState(submitEnquiry, initialFormState);
  if (state.ok) return <SuccessPanel title="Message sent" message={state.message} />;
  return (
    <form action={action} className="space-y-4">
      <BotFields />
      <input type="hidden" name="items" value="[]" />
      <div className="field">
        <label htmlFor="c-kind">Enquiry type</label>
        <select id="c-kind" name="kind" defaultValue={defaultKind} className="input">
          <option value="contact">General enquiry</option>
          <option value="wholesale">Wholesale enquiry</option>
          <option value="distribution">Distribution enquiry</option>
          <option value="bulk">Bulk order enquiry</option>
        </select>
      </div>
      <ContactFields errors={state.errors} prefill={prefill} />
      <Field label="Subject" name="subject" error={state.errors?.subject} />
      <Field label="Message" name="notes" textarea required error={state.errors?.notes} />
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full sm:w-auto">Send message <span className="arrow">→</span></Submit>
    </form>
  );
}
