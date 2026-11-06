import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import AdminForm from "@/components/admin/AdminForm";
import { Badge, PageTitle, Panel, fmtDate } from "@/components/admin/ui";
import { reviewApplication } from "@/app/actions/admin";

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const a = (await db.select().from(schema.applications).where(eq(schema.applications.id, id)))[0];
  if (!a) notFound();
  const rows: [string, string][] = [
    ["Contact name", a.contactName], ["Email", a.email], ["Telephone", a.phone], ["Country", a.country], ["Website", a.website],
    ["Business type", a.businessType], ["Products of interest", a.productsOfInterest.join(", ")], ["Estimated quantities", a.estimatedQuantities], ["Received", fmtDate(a.createdAt)],
  ];
  return (
    <>
      <PageTitle title={a.businessName} sub="Wholesale application"><Link href="/admin/applications" className="btn btn-ghost btn-sm">← All applications</Link></PageTitle>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Details">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium break-words">{v}</dd></div>)}
          </dl>
          {a.additionalInfo && <div className="mt-4 whitespace-pre-wrap rounded-xl bg-paper p-4 text-sm">{a.additionalInfo}</div>}
        </Panel>
        <Panel title="Decision">
          <p className="mb-4 flex items-center gap-2 text-sm">Current status <Badge value={a.status} /></p>
          <AdminForm action={reviewApplication} submitLabel="Confirm decision">
            <input type="hidden" name="id" value={a.id} />
            <fieldset className="space-y-2 text-sm">
              <legend className="sr-only">Decision</legend>
              <label className="flex items-center gap-2"><input type="radio" name="decision" value="approve" required className="accent-[#e50920]" /> Approve and create account</label>
              <label className="flex items-center gap-2"><input type="radio" name="decision" value="reject" className="accent-[#e50920]" /> Reject</label>
            </fieldset>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="canViewPrices" defaultChecked className="accent-[#e50920]" /> Customer can see trade prices (if approved)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notify" defaultChecked className="accent-[#e50920]" /> Email the applicant if rejected</label>
            <div className="field"><label htmlFor="n">Internal note</label><textarea id="n" name="adminNote" defaultValue={a.adminNote} rows={3} className="input text-sm" /></div>
          </AdminForm>
        </Panel>
      </div>
    </>
  );
}
