import { requireAdmin } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import AdminForm from "@/components/admin/AdminForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Input, PageTitle, Panel } from "@/components/admin/ui";
import { deletePriceRow, savePriceRow, savePricingSettings } from "@/app/actions/admin";
import { getPricingMode, getTradeTerms } from "@/lib/settings";
import { getTiers } from "@/lib/pricing";

type PriceRow = typeof schema.prices.$inferSelect;

function PriceFields({ r, products }: { r?: PriceRow; products: { id: number; name: string }[] }) {
  return (
    <>
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="grid gap-4 md:grid-cols-[1.2fr_1.4fr]">
        <Input label="Name on price list" name="sourceName" defaultValue={r?.sourceName} required />
        <div className="field">
          <label htmlFor={`pp-${r?.id ?? "new"}`}>Linked catalogue product</label>
          <select id={`pp-${r?.id ?? "new"}`} name="productId" defaultValue={r?.productId ?? ""} className={`input text-sm ${r && !r.productId ? "border-amber-400 bg-amber-50" : ""}`}>
            <option value="">Not linked</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Input label="Currency" name="currency" defaultValue={r?.currency ?? "GBP"} />
        <Input label="Trade price" name="tradePrice" defaultValue={r?.tradePrice ?? ""} />
        <Input label="RRP" name="rrp" defaultValue={r?.rrp ?? ""} />
        <Input label="Reseller margin" name="resellerMargin" defaultValue={r?.resellerMargin} />
        <Input label="MOQ (units)" name="moq" defaultValue={r?.moq ?? ""} />
      </div>
      <Input label="Notes (internal)" name="notes" defaultValue={r?.notes} textarea rows={2} />
    </>
  );
}

export default async function PricingAdmin() {
  await requireAdmin();
  const [rows, products, mode, terms, tiers] = await Promise.all([
    db.select().from(schema.prices).orderBy(asc(schema.prices.id)),
    db.select({ id: schema.products.id, name: schema.products.name }).from(schema.products).orderBy(asc(schema.products.sort)),
    getPricingMode(),
    getTradeTerms(),
    getTiers(),
  ]);
  const tierText = tiers.map((t) => `${t.minQty} | ${t.maxQty ?? ""} | ${Number(t.discountPercent)} | ${t.description}`).join("\n");
  return (
    <>
      <PageTitle title="Wholesale pricing" sub="Imported from the Trade Price List (November 2026). Prices are never shown to the public." />
      <Panel title="Visibility and trade terms" className="mb-8">
        <AdminForm action={savePricingSettings}>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-2 font-semibold">Who can see trade prices?</legend>
            <label className="flex items-start gap-2"><input type="radio" name="pricingMode" value="approved" defaultChecked={mode === "approved"} className="mt-1 accent-[#e50920]" /> <span><strong>Approved wholesale customers</strong> who are signed in and have “Can see trade prices” switched on.</span></label>
            <label className="flex items-start gap-2"><input type="radio" name="pricingMode" value="quote_only" defaultChecked={mode === "quote_only"} className="mt-1 accent-[#e50920]" /> <span><strong>Nobody: quotation only.</strong> Every customer sees “Price on application” and receives prices by email.</span></label>
          </fieldset>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Price list date" name="priceListDate" defaultValue={terms.priceListDate} />
            <Input label="Minimum order (units per product)" name="moq" type="number" defaultValue={terms.moq} />
            <Input label="Minimum order (wording)" name="moqText" defaultValue={terms.moqText} />
            <Input label="Payment terms" name="payment" defaultValue={terms.payment} />
            <Input label="Delivery terms" name="delivery" defaultValue={terms.delivery} />
            <Input label="Volume note" name="volumeNote" defaultValue={terms.volumeNote} />
          </div>
          <Input label="Volume discount tiers" name="tiers" defaultValue={tierText} textarea rows={3} hint="One per line: minimum | maximum (blank for no limit) | discount % | description" />
        </AdminForm>
      </Panel>
      <div className="space-y-6">
        {rows.map((r) => (
          <Panel key={r.id} title={r.sourceName}>
            {!r.productId && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Not linked to a product, so no customer sees this price. {r.notes}</p>}
            <AdminForm action={savePriceRow}><PriceFields r={r} products={products} /></AdminForm>
            <form action={deletePriceRow} className="mt-3 text-right">
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton label="Delete row" message={`Delete the price row “${r.sourceName}”?`} className="text-xs text-red hover:underline" />
            </form>
          </Panel>
        ))}
        <Panel title="Add a price row">
          <AdminForm action={savePriceRow} submitLabel="Add price" resetOnSuccess><PriceFields products={products} /></AdminForm>
        </Panel>
      </div>
    </>
  );
}
