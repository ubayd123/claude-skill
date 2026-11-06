import { requireAdmin } from "@/lib/auth";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import AdminForm from "@/components/admin/AdminForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Input, PageTitle, Panel } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "@/app/actions/admin";

function CategoryFields({ c }: { c?: typeof schema.categories.$inferSelect }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Name" name="name" defaultValue={c?.name} required />
        <Input label="Short name" name="shortName" defaultValue={c?.shortName} />
        <Input label="URL slug" name="slug" defaultValue={c?.slug} hint="Blank = from name" />
      </div>
      <Input label="Tagline" name="tagline" defaultValue={c?.tagline} />
      <Input label="Description" name="description" defaultValue={c?.description} textarea rows={3} />
      <div className="grid items-end gap-4 sm:grid-cols-[8rem_1fr]">
        <Input label="Sort" name="sort" type="number" defaultValue={c?.sort ?? 0} />
        <div className="flex items-center gap-4">
          {c?.image && <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-night"><Image src={c.image} alt="" fill sizes="56px" className="object-cover" /></span>}
          <label className="text-sm">Image <input type="file" name="image" accept="image/*" className="mt-1 block text-sm" /></label>
        </div>
      </div>
    </>
  );
}

export default async function CategoriesPage() {
  await requireAdmin();
  const cats = await db.select().from(schema.categories).orderBy(asc(schema.categories.sort));
  return (
    <>
      <PageTitle title="Categories" sub="The first three categories are featured in the homepage showcase." />
      <div className="space-y-6">
        {cats.map((c) => (
          <Panel key={c.id} title={c.name}>
            <AdminForm action={saveCategory}><CategoryFields c={c} /></AdminForm>
            <form action={deleteCategory} className="mt-3 text-right">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton label="Delete category" message={`Delete ${c.name}? Its products will become uncategorised.`} className="text-xs text-red hover:underline" />
            </form>
          </Panel>
        ))}
        <Panel title="Add a category">
          <AdminForm action={saveCategory} submitLabel="Add category" resetOnSuccess><CategoryFields /></AdminForm>
        </Panel>
      </div>
    </>
  );
}
