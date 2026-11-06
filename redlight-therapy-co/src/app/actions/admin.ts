"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import type { ModelRow, SpecRow } from "@/db/schema";
import { createPasswordToken, requireAdmin } from "@/lib/auth";
import { layout, sendEmail } from "@/lib/email";
import { fd, str, zodErrors } from "@/lib/forms";
import { contentDefaults, saveSetting, type SiteContent } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { UploadError, isFile, saveImage, savePdf } from "@/lib/uploads";
import type { FormState } from "./types";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);

const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

function parseSpecs(text: string): SpecRow[] {
  return lines(text).map((l) => {
    const [a, b, c] = l.split("|").map((x) => x.trim());
    return c !== undefined ? { group: a, label: b, value: c } : { group: "Specifications", label: a ?? "", value: b ?? "" };
  });
}
function parseModels(text: string): ModelRow[] {
  return lines(text).map((l) => {
    const [model, ...rest] = l.split("|").map((x) => x.trim());
    return { model, note: rest.join(" | ") };
  });
}

function revalidateCatalogue() {
  revalidatePath("/", "layout");
}

// ---------------- Products ----------------

const productSchema = z.object({
  name: str(160, 2, "Name"),
  slug: str(80),
  categoryId: z.coerce.number().int().nonnegative(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  sort: z.coerce.number().int().min(0).max(9999),
  summary: str(400),
  description: str(10000),
  imageAlt: str(300),
  dimensions: str(2000),
  whatsIncluded: str(2000),
  usage: str(6000),
  seoTitle: str(160),
  seoDescription: str(320),
});

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd(formData, "id")) || null;
  const parsed = productSchema.safeParse({
    name: fd(formData, "name"),
    slug: fd(formData, "slug"),
    categoryId: fd(formData, "categoryId") || 0,
    status: fd(formData, "status") || "draft",
    featured: fd(formData, "featured") === "on",
    sort: fd(formData, "sort") || 0,
    summary: fd(formData, "summary"),
    description: fd(formData, "description"),
    imageAlt: fd(formData, "imageAlt"),
    dimensions: fd(formData, "dimensions"),
    whatsIncluded: fd(formData, "whatsIncluded"),
    usage: fd(formData, "usage"),
    seoTitle: fd(formData, "seoTitle"),
    seoDescription: fd(formData, "seoDescription"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  if (!slug) return { ok: false, message: "Enter a name or URL slug.", errors: { slug: "Required" } };
  const clash = await db.select({ id: schema.products.id }).from(schema.products).where(id ? and(eq(schema.products.slug, slug), ne(schema.products.id, id)) : eq(schema.products.slug, slug));
  if (clash.length) return { ok: false, message: "Another product already uses that URL slug.", errors: { slug: "Already in use" } };

  const values = {
    ...d,
    slug,
    categoryId: d.categoryId || null,
    specs: parseSpecs(fd(formData, "specs")),
    models: parseModels(fd(formData, "models")),
    features: lines(fd(formData, "features")),
    updatedAt: new Date(),
  };

  let image: string | undefined;
  const gallery: string[] = [];
  try {
    const main = formData.get("image");
    if (isFile(main)) image = await saveImage(main);
    for (const g of formData.getAll("gallery")) if (isFile(g)) gallery.push(await saveImage(g));
  } catch (e) {
    return { ok: false, message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  const keepGallery = formData.getAll("keepGallery").filter((v): v is string => typeof v === "string");

  let productId = id;
  if (id) {
    await db
      .update(schema.products)
      .set({ ...values, ...(image ? { image } : {}), gallery: [...keepGallery, ...gallery] })
      .where(eq(schema.products.id, id));
  } else {
    const [row] = await db
      .insert(schema.products)
      .values({ ...values, image: image ?? "", gallery })
      .returning({ id: schema.products.id });
    productId = row.id;
  }
  revalidateCatalogue();
  if (!id) redirect(`/admin/products/${productId}?saved=1`);
  return { ok: true, message: "Product saved." };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  if (id) await db.delete(schema.products).where(eq(schema.products.id, id));
  revalidateCatalogue();
  redirect("/admin/products");
}

// ---------------- Categories ----------------

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd(formData, "id")) || null;
  const parsed = z
    .object({
      name: str(120, 2, "Name"),
      shortName: str(60),
      tagline: str(200),
      description: str(2000),
      sort: z.coerce.number().int().min(0).max(999),
    })
    .safeParse({ name: fd(formData, "name"), shortName: fd(formData, "shortName"), tagline: fd(formData, "tagline"), description: fd(formData, "description"), sort: fd(formData, "sort") || 0 });
  if (!parsed.success) return zodErrors(parsed.error);
  const slug = slugify(fd(formData, "slug") || parsed.data.name);
  let image: string | undefined;
  try {
    const f = formData.get("image");
    if (isFile(f)) image = await saveImage(f);
  } catch (e) {
    return { ok: false, message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  const clash = await db.select({ id: schema.categories.id }).from(schema.categories).where(id ? and(eq(schema.categories.slug, slug), ne(schema.categories.id, id)) : eq(schema.categories.slug, slug));
  if (clash.length) return { ok: false, message: "Another category already uses that slug." };
  if (id) await db.update(schema.categories).set({ ...parsed.data, slug, ...(image ? { image } : {}) }).where(eq(schema.categories.id, id));
  else await db.insert(schema.categories).values({ ...parsed.data, slug, image: image ?? "" });
  revalidateCatalogue();
  return { ok: true, message: "Category saved." };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  if (id) await db.delete(schema.categories).where(eq(schema.categories.id, id));
  revalidateCatalogue();
}

// ---------------- Documents ----------------

export async function uploadDocument(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const file = formData.get("file");
  const title = fd(formData, "title").trim();
  if (!isFile(file)) return { ok: false, message: "Choose a PDF to upload." };
  if (!title) return { ok: false, message: "Give the document a title." };
  try {
    const fileName = await savePdf(file);
    await db.insert(schema.productDocuments).values({
      title: title.slice(0, 160),
      description: fd(formData, "description").slice(0, 400),
      fileName,
      productId: Number(fd(formData, "productId")) || null,
      visibility: fd(formData, "visibility") === "customers" ? "customers" : "public",
    });
  } catch (e) {
    return { ok: false, message: e instanceof UploadError ? e.message : "Upload failed." };
  }
  revalidateCatalogue();
  return { ok: true, message: "Document uploaded." };
}

export async function updateDocument(formData: FormData) {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  if (!id) return;
  if (fd(formData, "delete") === "1") {
    await db.delete(schema.productDocuments).where(eq(schema.productDocuments.id, id));
  } else {
    await db
      .update(schema.productDocuments)
      .set({ visibility: fd(formData, "visibility") === "customers" ? "customers" : "public" })
      .where(eq(schema.productDocuments.id, id));
  }
  revalidateCatalogue();
}

// ---------------- Pricing ----------------

const money = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{1,7}(\.\d{1,2})?$/.test(v), "Enter an amount like 400 or 129.50");

export async function savePriceRow(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd(formData, "id")) || null;
  const parsed = z
    .object({
      sourceName: str(160, 1, "Price list name"),
      productId: z.coerce.number().int().nonnegative(),
      currency: z.string().trim().length(3).toUpperCase(),
      tradePrice: money,
      rrp: money,
      resellerMargin: str(20),
      moq: z.string().trim().refine((v) => v === "" || /^\d{1,6}$/.test(v), "Whole number"),
      notes: str(1000),
    })
    .safeParse({
      sourceName: fd(formData, "sourceName"),
      productId: fd(formData, "productId") || 0,
      currency: fd(formData, "currency") || "GBP",
      tradePrice: fd(formData, "tradePrice"),
      rrp: fd(formData, "rrp"),
      resellerMargin: fd(formData, "resellerMargin"),
      moq: fd(formData, "moq"),
      notes: fd(formData, "notes"),
    });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  if (d.productId) {
    const taken = await db.select({ id: schema.prices.id }).from(schema.prices).where(id ? and(eq(schema.prices.productId, d.productId), ne(schema.prices.id, id)) : eq(schema.prices.productId, d.productId));
    if (taken.length) return { ok: false, message: "That product is already linked to another price row." };
  }
  const values = {
    sourceName: d.sourceName,
    productId: d.productId || null,
    currency: d.currency,
    tradePrice: d.tradePrice || null,
    rrp: d.rrp || null,
    resellerMargin: d.resellerMargin,
    moq: d.moq ? Number(d.moq) : null,
    notes: d.notes,
    updatedAt: new Date(),
  };
  if (id) await db.update(schema.prices).set(values).where(eq(schema.prices.id, id));
  else await db.insert(schema.prices).values(values);
  revalidatePath("/admin/pricing");
  revalidatePath("/account", "layout");
  return { ok: true, message: "Price saved." };
}

export async function deletePriceRow(formData: FormData) {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  if (id) await db.delete(schema.prices).where(eq(schema.prices.id, id));
  revalidatePath("/admin/pricing");
}

export async function savePricingSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const mode = fd(formData, "pricingMode") === "quote_only" ? "quote_only" : "approved";
  await saveSetting("pricing_mode", mode);
  const moq = Number(fd(formData, "moq"));
  await saveSetting("trade_terms", {
    priceListDate: fd(formData, "priceListDate").slice(0, 60),
    moq: Number.isFinite(moq) && moq > 0 ? Math.round(moq) : 0,
    moqText: fd(formData, "moqText").slice(0, 120),
    payment: fd(formData, "payment").slice(0, 300),
    delivery: fd(formData, "delivery").slice(0, 300),
    volumeNote: fd(formData, "volumeNote").slice(0, 300),
  });
  // Volume tiers: one per line "min | max(or blank) | discount% | description"
  const tierLines = lines(fd(formData, "tiers"));
  const tiers: (typeof schema.volumeTiers.$inferInsert)[] = [];
  for (const [i, l] of tierLines.entries()) {
    const [min, max, disc, ...desc] = l.split("|").map((x) => x.trim());
    const minQty = Number(min);
    const maxQty = max ? Number(max) : null;
    const discount = Number(disc || 0);
    if (!Number.isInteger(minQty) || (maxQty !== null && !Number.isInteger(maxQty)) || !Number.isFinite(discount) || discount < 0 || discount > 100) {
      return { ok: false, message: `Volume tier line ${i + 1} is not valid. Use: min | max | discount % | description` };
    }
    tiers.push({
      label: maxQty ? `${minQty}–${maxQty} units` : `${minQty}+ units`,
      minQty,
      maxQty,
      discountPercent: String(discount),
      description: desc.join(" | "),
      sort: i,
    });
  }
  await db.transaction(async (tx) => {
    await tx.delete(schema.volumeTiers);
    if (tiers.length) await tx.insert(schema.volumeTiers).values(tiers);
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Pricing settings saved." };
}

// ---------------- Applications & customers ----------------

async function sendSetPasswordEmail(userId: number, to: string, name: string, approved: boolean) {
  const token = await createPasswordToken(userId);
  const link = `${siteUrl()}/set-password/${token}`;
  const msg = layout(
    approved ? "Your wholesale account is approved" : "Set your password",
    approved
      ? `Hello ${name}, your Redlight Therapy Co. wholesale account has been approved. Use the link below to set your password. You can then sign in to see trade pricing, send bulk enquiries and download product documents. The link works once and expires in 72 hours.`
      : `Hello ${name}, use the link below to set a new password for your Redlight Therapy Co. account. It works once and expires in 72 hours.`,
    [["Set your password", link]],
  );
  const result = await sendEmail({ to, subject: approved ? "Your wholesale account is approved | Redlight Therapy Co." : "Set your password | Redlight Therapy Co.", html: msg.html, text: msg.text, kind: approved ? "account_approved" : "password_link" });
  return { link, result };
}

export async function reviewApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  const decision = fd(formData, "decision");
  const note = fd(formData, "adminNote").slice(0, 2000);
  const rows = await db.select().from(schema.applications).where(eq(schema.applications.id, id)).limit(1);
  const app = rows[0];
  if (!app) return { ok: false, message: "Application not found." };

  if (decision === "reject") {
    await db.update(schema.applications).set({ status: "rejected", adminNote: note, reviewedAt: new Date() }).where(eq(schema.applications.id, id));
    if (fd(formData, "notify") === "on") {
      const msg = layout("Your wholesale application", `Hello ${app.contactName}, thank you for your interest in a Redlight Therapy Co. wholesale account. We are not able to open an account for ${app.businessName} at this time. You are welcome to contact us with any questions.`, []);
      await sendEmail({ to: app.email, subject: "Your wholesale application | Redlight Therapy Co.", html: msg.html, text: msg.text, kind: "application_rejected" });
    }
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Application rejected." };
  }

  if (decision !== "approve") return { ok: false, message: "Choose approve or reject." };
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, app.email)).limit(1);
  let userId: number;
  if (existing[0]) {
    if (existing[0].role === "admin") return { ok: false, message: "That email belongs to an admin account." };
    userId = existing[0].id;
    await db.update(schema.users).set({ active: true, name: app.contactName }).where(eq(schema.users.id, userId));
  } else {
    const [u] = await db.insert(schema.users).values({ email: app.email, name: app.contactName, role: "customer", canViewPrices: fd(formData, "canViewPrices") === "on" }).returning({ id: schema.users.id });
    userId = u.id;
  }
  await db
    .insert(schema.businessProfiles)
    .values({ userId, businessName: app.businessName, contactName: app.contactName, phone: app.phone, country: app.country, website: app.website, businessType: app.businessType })
    .onConflictDoNothing();
  await db.update(schema.applications).set({ status: "approved", adminNote: note, reviewedAt: new Date(), userId }).where(eq(schema.applications.id, id));
  const { link, result } = await sendSetPasswordEmail(userId, app.email, app.contactName, true);
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: result.status === "sent" ? `Approved. A set-password email has been sent to ${app.email}.` : `Approved. The email could not be sent (${result.status}). Send the customer this one-time link yourself:`,
    link: result.status === "sent" ? undefined : link,
  };
}

export async function updateCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  const rows = await db.select().from(schema.users).where(and(eq(schema.users.id, id), eq(schema.users.role, "customer"))).limit(1);
  const user = rows[0];
  if (!user) return { ok: false, message: "Customer not found." };
  const action = fd(formData, "action");
  if (action === "link") {
    const { link, result } = await sendSetPasswordEmail(user.id, user.email, user.name, false);
    return { ok: true, message: result.status === "sent" ? `Password link emailed to ${user.email}.` : "Email not sent. Copy this one-time link to the customer:", link: result.status === "sent" ? undefined : link };
  }
  const active = fd(formData, "active") === "on";
  await db.update(schema.users).set({ active, canViewPrices: fd(formData, "canViewPrices") === "on" }).where(eq(schema.users.id, id));
  if (!active) await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
  revalidatePath("/admin/customers");
  return { ok: true, message: "Customer updated." };
}

// ---------------- Enquiries ----------------

export async function updateEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd(formData, "id"));
  const status = z.enum(["new", "in_progress", "quoted", "won", "closed", "spam"]).safeParse(fd(formData, "status"));
  if (!id || !status.success) return { ok: false, message: "Choose a valid status." };
  await db.update(schema.enquiries).set({ status: status.data, adminNote: fd(formData, "adminNote").slice(0, 4000), updatedAt: new Date() }).where(eq(schema.enquiries.id, id));
  revalidatePath("/admin", "layout");
  revalidatePath("/account/enquiries");
  return { ok: true, message: "Enquiry updated." };
}

// ---------------- Content ----------------

export async function saveContent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const next: Record<string, string> = {};
  for (const key of Object.keys(contentDefaults) as (keyof SiteContent)[]) {
    next[key] = fd(formData, key).slice(0, 4000);
  }
  const socials: Record<string, string> = {};
  for (const s of ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"]) {
    const v = fd(formData, `social_${s}`).trim();
    if (v && /^https:\/\/[^\s]+$/.test(v)) socials[s] = v.slice(0, 300);
  }
  await saveSetting("content", next);
  await saveSetting("socials", socials);
  revalidatePath("/", "layout");
  return { ok: true, message: "Website content saved." };
}

// ---------------- Import ----------------

const importItem = z.object({
  slug: z.string().optional(),
  name: z.string().min(2).max(160),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  sort: z.number().int().optional(),
  summary: z.string().max(400).optional(),
  description: z.string().max(10000).optional(),
  image: z.string().max(300).regex(/^\/(images|media)\/[\w./-]+$/, "image must be a site path like /images/...").optional(),
  imageAlt: z.string().max(300).optional(),
  models: z.array(z.object({ model: z.string(), note: z.string().default("") })).optional(),
  features: z.array(z.string()).optional(),
  specs: z.array(z.object({ group: z.string(), label: z.string(), value: z.string() })).optional(),
  dimensions: z.string().optional(),
  whatsIncluded: z.string().optional(),
  usage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function importProducts(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  let raw: unknown;
  const file = formData.get("file");
  try {
    raw = JSON.parse(isFile(file) ? await file.text() : fd(formData, "json"));
  } catch {
    return { ok: false, message: "That is not valid JSON." };
  }
  const parsed = z.array(importItem).max(500).safeParse(Array.isArray(raw) ? raw : (raw as { products?: unknown })?.products);
  if (!parsed.success) return { ok: false, message: `Import failed: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}` };
  const cats = await db.select().from(schema.categories);
  let created = 0;
  let updated = 0;
  for (const item of parsed.data) {
    const slug = slugify(item.slug || item.name);
    const cat = cats.find((c) => c.slug === item.category || c.name === item.category);
    const { category: _cat, ...rest } = item;
    void _cat;
    const values = { ...rest, slug, ...(cat ? { categoryId: cat.id } : {}), updatedAt: new Date() };
    const existing = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, slug));
    if (existing[0]) {
      await db.update(schema.products).set(values).where(eq(schema.products.id, existing[0].id));
      updated++;
    } else {
      await db.insert(schema.products).values({ ...values, status: item.status ?? "draft" });
      created++;
    }
  }
  revalidateCatalogue();
  return { ok: true, message: `Import complete: ${created} created, ${updated} updated.` };
}
