"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";
import { fd, str, zodErrors } from "@/lib/forms";
import type { FormState } from "./types";

const detailsSchema = z.object({
  businessName: str(160, 2, "Business name"),
  contactName: str(120, 2, "Contact name"),
  phone: str(40, 0, "Telephone"),
  country: str(80, 0, "Country"),
  website: str(200, 0, "Website"),
  businessType: str(80, 0, "Business type"),
  address: str(600, 0, "Address"),
});

export async function updateBusinessDetails(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireCustomer();
  const parsed = detailsSchema.safeParse(Object.fromEntries(["businessName", "contactName", "phone", "country", "website", "businessType", "address"].map((k) => [k, fd(formData, k)])));
  if (!parsed.success) return zodErrors(parsed.error);
  await db
    .insert(schema.businessProfiles)
    .values({ userId: user.id, ...parsed.data })
    .onConflictDoUpdate({ target: schema.businessProfiles.userId, set: { ...parsed.data, updatedAt: new Date() } });
  await db.update(schema.users).set({ name: parsed.data.contactName }).where(eq(schema.users.id, user.id));
  revalidatePath("/account");
  return { ok: true, message: "Your business details have been saved." };
}
