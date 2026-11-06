import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import AdminForm from "@/components/admin/AdminForm";
import { Badge, PageTitle, Panel, fmtDate } from "@/components/admin/ui";
import { updateCustomer } from "@/app/actions/admin";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const u = (await db.select().from(schema.users).where(and(eq(schema.users.id, id), eq(schema.users.role, "customer"))))[0];
  if (!u) notFound();
  const p = (await db.select().from(schema.businessProfiles).where(eq(schema.businessProfiles.userId, id)))[0];
  const enquiries = await db.select().from(schema.enquiries).where(eq(schema.enquiries.userId, id)).orderBy(desc(schema.enquiries.createdAt));
  return (
    <>
      <PageTitle title={p?.businessName || u.name} sub={u.email}><Link href="/admin/customers" className="btn btn-ghost btn-sm">← All customers</Link></PageTitle>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Access">
          <AdminForm action={updateCustomer}>
            <input type="hidden" name="id" value={u.id} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={u.active} className="accent-[#e50920]" /> Account active (can sign in)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="canViewPrices" defaultChecked={u.canViewPrices} className="accent-[#e50920]" /> Can see trade prices</label>
          </AdminForm>
          <div className="mt-6 border-t border-line pt-6">
            <AdminForm action={updateCustomer} submitLabel="Send set-password link">
              <input type="hidden" name="id" value={u.id} />
              <input type="hidden" name="action" value="link" />
              <p className="text-sm text-muted">Emails the customer a one-time link (72 hours) to set or reset their password.</p>
            </AdminForm>
          </div>
        </Panel>
        <Panel title="Business profile">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[["Contact", p?.contactName], ["Telephone", p?.phone], ["Country", p?.country], ["Website", p?.website], ["Type", p?.businessType], ["Address", p?.address], ["Created", fmtDate(u.createdAt)], ["Last sign in", u.lastLoginAt ? fmtDate(u.lastLoginAt) : "Never"]].map(([k, v]) => v ? <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium whitespace-pre-wrap">{v}</dd></div> : null)}
          </dl>
        </Panel>
      </div>
      <Panel title={`Enquiries (${enquiries.length})`} className="mt-6">
        <ul className="divide-y divide-line text-sm">
          {enquiries.map((e) => <li key={e.id} className="flex justify-between py-2"><Link href={`/admin/enquiries/${e.id}`} className="font-semibold text-red hover:underline">{e.reference}</Link><span className="flex gap-3 text-muted">{fmtDate(e.createdAt)} <Badge value={e.status} /></span></li>)}
        </ul>
      </Panel>
    </>
  );
}
