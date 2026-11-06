import type { Metadata } from "next";
import { eq, isNotNull } from "drizzle-orm";
import PageHero from "@/components/layout/PageHero";
import { OrderEnquiryForm } from "@/components/forms/EnquiryForms";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { canSeePrices } from "@/lib/pricing";
import { getTradeTerms } from "@/lib/settings";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Send one wholesale enquiry for several Redlight Therapy Co. products and quantities. No checkout, no online payment.",
  alternates: { canonical: "/enquiry" },
};

export default async function EnquiryPage() {
  const user = await getCurrentUser();
  let prefill;
  let prices: Record<number, string> | undefined;
  let moqText: string | undefined;
  if (user?.role === "customer") {
    const prof = (await db.select().from(schema.businessProfiles).where(eq(schema.businessProfiles.userId, user.id)))[0];
    prefill = { name: prof?.contactName || user.name, business: prof?.businessName, email: user.email, phone: prof?.phone, country: prof?.country };
    if (await canSeePrices(user)) {
      const rows = await db.select().from(schema.prices).where(isNotNull(schema.prices.productId));
      prices = Object.fromEntries(rows.filter((r) => r.productId && r.tradePrice).map((r) => [r.productId as number, formatMoney(r.tradePrice as string, r.currency)]));
      moqText = (await getTradeTerms()).moqText;
    }
  }
  return (
    <>
      <PageHero eyebrow="Bulk order enquiry" title={<>Request a <span className="text-red">quote.</span></>} intro="Review your products and quantities, add your details and send one enquiry. We reply by email. No payment is taken online." />
      <section className="pb-28">
        <div className="container-x" data-reveal>
          <OrderEnquiryForm prefill={prefill} prices={prices} moqText={moqText} />
        </div>
      </section>
    </>
  );
}
