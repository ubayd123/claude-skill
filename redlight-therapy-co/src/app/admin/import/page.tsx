import { requireAdmin } from "@/lib/auth";
import AdminForm from "@/components/admin/AdminForm";
import { Input, PageTitle, Panel } from "@/components/admin/ui";
import { importProducts } from "@/app/actions/admin";

export default async function ImportAdmin() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Import / export" sub="Move product information in and out of the website as JSON." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Export">
          <p className="text-sm text-muted">Download every product (including drafts) as a JSON file. Edit it and import it back, or keep it as a backup.</p>
          <a href="/admin/export" className="btn btn-ink btn-sm mt-4">Download products.json</a>
        </Panel>
        <Panel title="Import">
          <AdminForm action={importProducts} submitLabel="Import products">
            <p className="text-sm text-muted">Products are matched by slug (or name). Existing products are updated; new ones are created as drafts unless the file says “published”. Images must already be on the site (paths starting /images/ or /media/).</p>
            <input type="file" name="file" accept="application/json" className="block text-sm" />
            <Input label="…or paste JSON" name="json" textarea rows={6} />
          </AdminForm>
        </Panel>
      </div>
    </>
  );
}
