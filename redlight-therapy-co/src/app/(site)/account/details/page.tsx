import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";
import DetailsForm from "@/components/forms/DetailsForm";

export default async function DetailsPage() {
  const user = await requireCustomer();
  const p = (await db.select().from(schema.businessProfiles).where(eq(schema.businessProfiles.userId, user.id)))[0];
  return <DetailsForm profile={{ businessName: p?.businessName ?? "", contactName: p?.contactName ?? user.name, phone: p?.phone ?? "", country: p?.country ?? "", website: p?.website ?? "", businessType: p?.businessType ?? "", address: p?.address ?? "" }} />;
}
