import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { count, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { Badge, PageTitle, Panel, fmtDate } from "@/components/admin/ui";
import { emailProvider, enquiryRecipient } from "@/lib/email";

export default async function AdminHome() {
  await requireAdmin();
  const [[{ newE }], [{ allE }], [{ pend }], [{ cust }], [{ prods }], recent, unlinked, [{ failed }]] = await Promise.all([
    db.select({ newE: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, "new")),
    db.select({ allE: count() }).from(schema.enquiries),
    db.select({ pend: count() }).from(schema.applications).where(eq(schema.applications.status, "pending")),
    db.select({ cust: count() }).from(schema.users).where(eq(schema.users.role, "customer")),
    db.select({ prods: count() }).from(schema.products),
    db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(8),
    db.select().from(schema.prices).where(isNull(schema.prices.productId)),
    db.select({ failed: count() }).from(schema.emailLog).where(eq(schema.emailLog.status, "failed")),
  ]);
  const provider = emailProvider();
  const stats = [
    ["New enquiries", newE, "/admin/enquiries?status=new"],
    ["All enquiries", allE, "/admin/enquiries"],
    ["Pending applications", pend, "/admin/applications"],
    ["Wholesale customers", cust, "/admin/customers"],
    ["Products", prods, "/admin/products"],
  ] as const;
  return (
    <>
      <PageTitle title="Dashboard" sub={`Enquiries are emailed to ${enquiryRecipient()}`} />
      {!provider && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <strong>Email is not configured yet.</strong> Enquiries and applications are being saved here, but no emails are sent. Add <code>RESEND_API_KEY</code> or SMTP settings to the environment (see README), then run <code>npm run email:test</code>.
        </div>
      )}
      {failed > 0 && <div className="mb-6 rounded-2xl border border-red/30 bg-blush p-5 text-sm text-red-deep">{failed} email(s) failed to send. <Link href="/admin/emails" className="font-semibold underline">Open the email log</Link>.</div>}
      {unlinked.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          {unlinked.length} price list row(s) are not linked to a product yet ({unlinked.map((u) => `“${u.sourceName}”`).join(", ")}). <Link href="/admin/pricing" className="font-semibold underline">Link them in Pricing</Link>.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([l, v, href]) => (
          <Link key={l} href={href} className="rounded-2xl border border-line bg-white p-5 transition hover:border-red">
            <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold">{v}</p>
            <p className="mt-1 text-xs text-muted">{l}</p>
          </Link>
        ))}
      </div>
      <Panel title="Latest enquiries" className="mt-8">
        {recent.length === 0 ? <p className="text-sm text-muted">No enquiries yet.</p> : (
          <ul className="divide-y divide-line">
            {recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:text-red">
                  <span><strong>{e.reference}</strong> · {e.businessName || e.customerName} <span className="text-muted">({e.email})</span></span>
                  <span className="flex items-center gap-3 text-muted">{fmtDate(e.createdAt)} <Badge value={e.status} /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
