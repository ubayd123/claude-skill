import "server-only";
import { cache } from "react";
import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { emptyTradeTerms, type TradeTerms } from "@/data/catalogue";

export const contentDefaults = {
  heroEyebrow: "Wholesale red light therapy",
  heroHeadline: "The future of light therapy.",
  heroSubtext: "Premium red light therapy technology. Designed for businesses looking to grow with innovation.",
  partnerHeadline: "Build your business with light.",
  partnerText:
    "Redlight Therapy Co. supplies distributors, retailers, clinics, salons and wellness businesses. Apply for a wholesale account to see trade pricing, or send us an enquiry and we will reply with a quotation.",
  aboutIntro:
    "Redlight Therapy Co. is a wholesale supplier of red light therapy devices for businesses. Our range covers LED panels, LED face masks, a red light therapy hair cap and a knee strap, and every documented product comes with a supporting pack of test and certificate summaries.",
  aboutBody:
    "We work with distributors, retailers, beauty clinics, salons, wellness businesses and resellers. Trade pricing is shared with approved wholesale customers, and every enquiry is answered personally.",
  contactIntro: "Questions about the range, trade pricing or a bulk order? Send us a message and we will get back to you.",
  announcement: "",
};
export type SiteContent = typeof contentDefaults;

export type PricingMode = "approved" | "quote_only";
export type { TradeTerms };

export const getContent = cache(async (): Promise<SiteContent> => {
  const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, ["content"]));
  const stored = rows[0]?.value;
  return { ...contentDefaults, ...(isRecord(stored) ? (stored as Partial<SiteContent>) : {}) };
});

export const getPricingMode = cache(async (): Promise<PricingMode> => {
  const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, ["pricing_mode"]));
  return rows[0]?.value === "quote_only" ? "quote_only" : "approved";
});

export const getTradeTerms = cache(async (): Promise<TradeTerms> => {
  const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, ["trade_terms"]));
  const stored = rows[0]?.value;
  return { ...emptyTradeTerms, ...(isRecord(stored) ? (stored as Partial<TradeTerms>) : {}) };
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function saveSetting(key: string, value: unknown) {
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}

export type Socials = Partial<Record<"instagram" | "facebook" | "tiktok" | "linkedin" | "youtube" | "x", string>>;
export const getSocials = cache(async (): Promise<Socials> => {
  const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, ["socials"]));
  const stored = rows[0]?.value;
  return isRecord(stored) ? (stored as Socials) : {};
});
