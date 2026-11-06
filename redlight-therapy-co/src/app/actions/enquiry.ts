"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { getProductsByIds } from "@/lib/catalog";
import { enquiryRecipient, itemsTable, layout, sendEmail, type ItemLine } from "@/lib/email";
import { email, fd, looksLikeBot, str, zodErrors } from "@/lib/forms";
import { canSeePrices, getPriceMap, getTiers, unitPriceFor } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, randomToken } from "@/lib/security";
import { BUSINESS_EMAIL } from "@/lib/site";
import type { FormState } from "./types";

const itemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100000),
  model: z.string().max(80).optional(),
});

const enquirySchema = z.object({
  kind: z.enum(["order", "contact", "wholesale", "distribution", "bulk"]),
  name: str(120, 2, "Your name"),
  business: str(160, 0, "Business name"),
  email,
  phone: str(40, 0, "Telephone"),
  country: str(80, 0, "Country"),
  subject: str(160),
  notes: str(4000, 0, "Additional information"),
  items: z.array(itemSchema).max(30),
});

const KIND_LABEL: Record<string, string> = {
  order: "Order enquiry",
  bulk: "Bulk order enquiry",
  wholesale: "Wholesale enquiry",
  distribution: "Distribution enquiry",
  contact: "General enquiry",
};

function reference() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `RLT-${ymd}-${randomToken(4).replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase()}`;
}

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  if (looksLikeBot(formData)) {
    return { ok: false, message: "Sorry, we could not accept that submission. Please try again." };
  }
  let rawItems: unknown = [];
  try {
    rawItems = JSON.parse(fd(formData, "items") || "[]");
  } catch {
    rawItems = [];
  }
  const parsed = enquirySchema.safeParse({
    kind: fd(formData, "kind") || "order",
    name: fd(formData, "name"),
    business: fd(formData, "business"),
    email: fd(formData, "email"),
    phone: fd(formData, "phone"),
    country: fd(formData, "country"),
    subject: fd(formData, "subject"),
    notes: fd(formData, "notes"),
    items: rawItems,
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const data = parsed.data;
  const isOrder = data.kind === "order";
  if (isOrder && data.items.length === 0) return { ok: false, message: "Add at least one product to your enquiry." };
  if (isOrder && !data.business) return { ok: false, message: "Please check the highlighted fields.", errors: { business: "Business name is required" } };

  const key = await clientKey();
  const limit = await rateLimit(`enquiry:${key}`, 6, 600);
  if (!limit.ok) return { ok: false, message: "Too many enquiries from this connection. Please wait a few minutes and try again." };

  // Resolve products from the database: never trust names or prices from the browser.
  const products = await getProductsByIds([...new Set(data.items.map((i) => i.productId))]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const user = await getCurrentUser();
  const showPrices = user?.role === "customer" && (await canSeePrices(user));
  const priceMap = showPrices ? await getPriceMap(user) : new Map();
  const tiers = showPrices ? await getTiers() : [];

  const merged = new Map<string, ItemLine & { productId: number }>();
  for (const item of data.items) {
    const product = byId.get(item.productId);
    if (!product) continue;
    const validModels = product.models.map((m) => m.model);
    const model = item.model && validModels.includes(item.model) ? item.model : (validModels[0] ?? "");
    const k = `${product.id}|${model}`;
    const existing = merged.get(k);
    const quantity = Math.min(100000, (existing?.quantity ?? 0) + item.quantity);
    const price = priceMap.get(product.id);
    merged.set(k, {
      productId: product.id,
      productName: product.name,
      model,
      quantity,
      unitPrice: price ? unitPriceFor(price, quantity, tiers) : null,
      currency: price?.currency ?? "GBP",
    });
  }
  const lines = [...merged.values()];
  if (isOrder && lines.length === 0) return { ok: false, message: "Those products are no longer available. Please refresh and try again." };

  const ref = reference();
  const [saved] = await db
    .insert(schema.enquiries)
    .values({
      reference: ref,
      kind: data.kind,
      userId: user?.id ?? null,
      customerName: data.name,
      businessName: data.business,
      email: data.email,
      phone: data.phone,
      country: data.country,
      subject: data.subject,
      notes: data.notes,
      pricesIncluded: showPrices && lines.some((l) => l.unitPrice),
    })
    .returning({ id: schema.enquiries.id, createdAt: schema.enquiries.createdAt });
  if (lines.length) {
    await db.insert(schema.enquiryItems).values(
      lines.map((l) => ({
        enquiryId: saved.id,
        productId: l.productId,
        productName: l.productName,
        model: l.model,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        currency: l.currency,
      })),
    );
  }

  const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/London" }).format(saved.createdAt);
  const kindLabel = KIND_LABEL[data.kind] ?? "Enquiry";
  const table = lines.length ? itemsTable(lines, showPrices) : { html: "", text: "" };
  const totalUnits = lines.reduce((n, l) => n + l.quantity, 0);

  const toBusiness = layout(
    `${kindLabel} ${ref}`,
    lines.length
      ? `${data.business || data.name} has sent an enquiry for ${totalUnits} unit${totalUnits === 1 ? "" : "s"} across ${lines.length} product line${lines.length === 1 ? "" : "s"}. Reply to this email to answer them directly.`
      : `${data.name} has sent a message through the website. Reply to this email to answer them directly.`,
    [
      ["Reference", ref],
      ["Enquiry type", kindLabel],
      ["Submitted", when],
      ["Customer name", data.name],
      ["Business name", data.business],
      ["Email", data.email],
      ["Telephone", data.phone],
      ["Country", data.country],
      ["Account", user?.role === "customer" ? `Approved wholesale customer (${user.email})` : "Guest (no wholesale account)"],
      ["Subject", data.subject],
      ["Additional notes", data.notes],
    ],
    table.html,
    showPrices ? "Unit prices are the customer's authorised trade prices for the requested quantity, including any volume discount on the price list." : "",
  );
  const businessResult = await sendEmail({
    to: enquiryRecipient(),
    subject: `${kindLabel} ${ref}${data.business ? ` from ${data.business}` : ""}`,
    html: toBusiness.html,
    text: `${toBusiness.text}\n\n${table.text}`,
    kind: "enquiry_business",
    replyTo: data.email,
  });

  const ack = layout(
    "Thank you, we have your enquiry",
    `Hello ${data.name}, thank you for contacting Redlight Therapy Co. We have received your ${kindLabel.toLowerCase()} and will reply by email, usually from ${BUSINESS_EMAIL}. Please quote reference ${ref} in any correspondence. No payment has been taken.`,
    [
      ["Reference", ref],
      ["Submitted", when],
      ["Business", data.business],
      ["Your notes", data.notes],
    ],
    table.html,
  );
  const ackResult = await sendEmail({
    to: data.email,
    subject: `We have received your enquiry ${ref} | Redlight Therapy Co.`,
    html: ack.html,
    text: `${ack.text}\n\n${table.text}`,
    kind: "enquiry_ack",
    replyTo: enquiryRecipient(),
  });

  await db
    .update(schema.enquiries)
    .set({ businessEmailStatus: businessResult.status, ackEmailStatus: ackResult.status })
    .where(eq(schema.enquiries.id, saved.id));

  return {
    ok: true,
    reference: ref,
    message:
      ackResult.status === "sent"
        ? `Thank you. Your enquiry ${ref} has been sent, and a confirmation is on its way to ${data.email}.`
        : `Thank you. Your enquiry ${ref} has been received and recorded. Our team will reply to ${data.email}.`,
  };
}
