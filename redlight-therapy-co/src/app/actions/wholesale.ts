"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { enquiryRecipient, layout, sendEmail } from "@/lib/email";
import { email, fd, looksLikeBot, str, zodErrors } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey } from "@/lib/security";
import { BUSINESS_TYPES, siteUrl } from "@/lib/site";
import type { FormState } from "./types";

const schemaApp = z.object({
  businessName: str(160, 2, "Business name"),
  contactName: str(120, 2, "Contact name"),
  email,
  phone: str(40, 5, "Telephone"),
  country: str(80, 2, "Country"),
  website: z
    .string()
    .trim()
    .max(200)
    .refine((v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v), "Enter a valid website address"),
  businessType: z.enum(BUSINESS_TYPES, { message: "Choose a business type" }),
  productsOfInterest: z.array(z.string().max(120)).max(20),
  estimatedQuantities: str(500, 0, "Estimated order quantities"),
  additionalInfo: str(4000, 0, "Additional information"),
  consent: z.literal("on", { message: "Please confirm so we can contact you" }),
});

export async function applyForWholesale(_prev: FormState, formData: FormData): Promise<FormState> {
  if (looksLikeBot(formData)) return { ok: false, message: "Sorry, we could not accept that submission. Please try again." };
  const parsed = schemaApp.safeParse({
    businessName: fd(formData, "businessName"),
    contactName: fd(formData, "contactName"),
    email: fd(formData, "email"),
    phone: fd(formData, "phone"),
    country: fd(formData, "country"),
    website: fd(formData, "website"),
    businessType: fd(formData, "businessType"),
    productsOfInterest: formData.getAll("productsOfInterest").filter((v): v is string => typeof v === "string"),
    estimatedQuantities: fd(formData, "estimatedQuantities"),
    additionalInfo: fd(formData, "additionalInfo"),
    consent: fd(formData, "consent"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const key = await clientKey();
  if (!(await rateLimit(`apply:${key}`, 4, 3600)).ok) {
    return { ok: false, message: "Too many applications from this connection. Please try again later." };
  }
  const { consent: _c, ...data } = parsed.data;
  void _c;
  const [row] = await db.insert(schema.applications).values(data).returning({ id: schema.applications.id });

  const rows: [string, string][] = [
    ["Application", `#${row.id}`],
    ["Business name", data.businessName],
    ["Contact name", data.contactName],
    ["Email", data.email],
    ["Telephone", data.phone],
    ["Country", data.country],
    ["Website", data.website],
    ["Business type", data.businessType],
    ["Products of interest", data.productsOfInterest.join(", ")],
    ["Estimated quantities", data.estimatedQuantities],
    ["Additional information", data.additionalInfo],
  ];
  const admin = layout(
    "New wholesale account application",
    `${data.businessName} has applied for a wholesale account. Review and approve or reject it in the admin dashboard: ${siteUrl()}/admin/applications/${row.id}`,
    rows,
  );
  await sendEmail({ to: enquiryRecipient(), subject: `Wholesale application: ${data.businessName}`, html: admin.html, text: admin.text, kind: "application_admin", replyTo: data.email });

  const ack = layout(
    "Thank you for applying",
    `Hello ${data.contactName}, thank you for applying for a Redlight Therapy Co. wholesale account for ${data.businessName}. We review every application personally. Once approved you will receive an email with a link to set your password and access trade pricing.`,
    [["Business", data.businessName], ["Business type", data.businessType], ["Products of interest", data.productsOfInterest.join(", ")]],
  );
  await sendEmail({ to: data.email, subject: "Your wholesale application | Redlight Therapy Co.", html: ack.html, text: ack.text, kind: "application_ack", replyTo: enquiryRecipient() });

  return { ok: true, message: `Thank you, ${data.contactName}. Your application has been received. We will email ${data.email} once it has been reviewed.` };
}
