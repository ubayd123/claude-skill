import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";
import { canSeePrices } from "@/lib/pricing";
import { getTradeTerms } from "@/lib/settings";
import { STATUS_LABEL, BUSINESS_EMAIL } from "@/lib/site";

export default async function AccountHome() {
  const user = await requireCustomer();
  const [[{ n }], recent, prices, terms] = await Promise.all([
    db.select({ n: count() }).from(schema.enquiries).where(eq(schema.enquiries.userId, user.id)),
    db.select().from(schema.enquiries).where(eq(schema.enquiries.userId, user.id)).orderBy(desc(schema.enquiries.createdAt)).limit(3),
    canSeePrices(user),
    getTradeTerms(),
  ]);
  const tiles = [
    { href: "/products", t: "Browse products", d: "The full wholesale catalogue." },
    { href: "/enquiry", t: "Submit a bulk enquiry", d: "Several products, one enquiry." },
    { href: "/account/pricing", t: "Trade pricing", d: prices ? `Price list: ${terms.priceListDate}` : "Provided by quotation" },
    { href: "/account/documents", t: "Product documents", d: "Test and certificate summaries." },
    { href: "/account/details", t: "Business details", d: "Keep your details up to date." },
    { href: "/contact", t: "Contact us", d: BUSINESS_EMAIL },
  ];
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t, i) => (
          <Link key={t.href} href={t.href} className="card group p-6 transition hover:-translate-y-1 hover:border-red" data-reveal data-delay={i * 0.05}>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold group-hover:text-red">{t.t} →</p>
            <p className="mt-2 break-words text-sm text-muted">{t.d}</p>
          </Link>
        ))}
      </div>
      <div className="card p-6" data-reveal>
        <div className="flex items-baseline justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">Recent enquiries</h2>
          <span className="text-sm text-muted">{n} total</span>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No enquiries yet. <Link href="/products" className="font-semibold text-red link-u">Start with the catalogue</Link>.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <span className="block font-semibold">{e.reference}</span>
                  <span className="text-muted">{e.createdAt.toLocaleDateString("en-GB")}</span>
                </span>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold">{STATUS_LABEL[e.status]}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/account/enquiries" className="mt-4 inline-block text-sm font-semibold text-red link-u">View all enquiries</Link>
      </div>
    </div>
  );
}
