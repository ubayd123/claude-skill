import Link from "next/link";
import { asc, isNotNull, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";
import { canSeePrices, getTiers } from "@/lib/pricing";
import { getTradeTerms } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import AddToEnquiry from "@/components/enquiry/AddToEnquiry";

export default async function PricingPage() {
  const user = await requireCustomer();
  if (!(await canSeePrices(user))) {
    return (
      <div className="card p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Pricing by quotation</h2>
        <p className="mt-3 max-w-xl text-muted">Trade pricing for your account is provided by individual quotation. Add products to an enquiry and we will reply with prices for your quantities.</p>
        <Link href="/products" className="btn btn-red mt-6">Browse products <span className="arrow">→</span></Link>
      </div>
    );
  }
  const [rows, tiers, terms] = await Promise.all([
    db.select({ price: schema.prices, product: schema.products }).from(schema.prices).innerJoin(schema.products, eq(schema.products.id, schema.prices.productId)).where(isNotNull(schema.prices.productId)).orderBy(asc(schema.products.sort)),
    getTiers(),
    getTradeTerms(),
  ]);
  return (
    <div className="space-y-8">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-6 py-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Trade price list</h2>
          <p className="text-sm text-muted">{terms.priceListDate} · Confidential</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-paper text-xs uppercase tracking-[0.12em] text-muted">
              <tr><th className="px-6 py-3">Product</th><th className="px-6 py-3">Trade price</th><th className="px-6 py-3">RRP</th><th className="px-6 py-3">Reseller margin</th><th className="px-6 py-3">MOQ</th><th className="px-6 py-3"><span className="sr-only">Enquire</span></th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ price, product }) => (
                <tr key={price.id}>
                  <td className="px-6 py-4"><Link href={`/products/${product.slug}`} className="font-semibold link-u">{product.name}</Link></td>
                  <td className="px-6 py-4 font-bold text-red">{price.tradePrice ? formatMoney(price.tradePrice, price.currency) : "On request"}</td>
                  <td className="px-6 py-4">{price.rrp ? formatMoney(price.rrp, price.currency) : "–"}</td>
                  <td className="px-6 py-4">{price.resellerMargin || "–"}</td>
                  <td className="px-6 py-4">{price.moq ? `${price.moq} units` : "–"}</td>
                  <td className="px-6 py-4 text-right"><AddToEnquiry product={product} label="Add" quantity={price.moq ?? 1} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-6 py-4 text-xs text-muted">Products not listed here are priced by quotation. Send an enquiry and we will reply with a price.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-[family-name:var(--font-display)] font-bold">Volume discounts (per product)</h3>
          <p className="mt-1 text-xs text-muted">{terms.volumeNote}</p>
          <ul className="mt-4 divide-y divide-line text-sm">
            {tiers.map((t) => <li key={t.id} className="flex justify-between py-2"><span>{t.label}</span><span className="font-semibold">{t.description}</span></li>)}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-[family-name:var(--font-display)] font-bold">Trade terms</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-muted">Minimum order</dt><dd className="font-semibold">{terms.moqText}</dd></div>
            <div><dt className="text-muted">Payment</dt><dd className="font-semibold">{terms.payment}</dd></div>
            <div><dt className="text-muted">Delivery</dt><dd className="font-semibold">{terms.delivery}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
