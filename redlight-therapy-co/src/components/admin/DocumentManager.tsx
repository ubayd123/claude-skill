import AdminForm from "./AdminForm";
import { Input } from "./ui";
import { updateDocument, uploadDocument } from "@/app/actions/admin";

type Doc = { id: number; title: string; description: string; visibility: "public" | "customers"; productId: number | null };

export default function DocumentManager({ docs, productId, products }: { docs: Doc[]; productId?: number; products?: { id: number; name: string }[] }) {
  return (
    <div className="space-y-6">
      {docs.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>
                <a href={`/docs/${d.id}`} target="_blank" rel="noopener" className="font-semibold hover:text-red">{d.title}</a>
                {products && <span className="ml-2 text-xs text-muted">{products.find((p) => p.id === d.productId)?.name ?? "General"}</span>}
                <span className="block text-xs text-muted">{d.description}</span>
              </span>
              <span className="flex items-center gap-2">
                <form action={updateDocument} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={d.id} />
                  <select name="visibility" defaultValue={d.visibility} className="input py-1.5 text-xs" aria-label="Who can download">
                    <option value="public">Everyone</option>
                    <option value="customers">Signed-in customers only</option>
                  </select>
                  <button className="btn btn-ghost btn-sm">Update</button>
                </form>
                <form action={updateDocument}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="delete" value="1" />
                  <button className="text-xs text-red hover:underline">Remove</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}
      <AdminForm action={uploadDocument} submitLabel="Upload PDF" resetOnSuccess>
        {productId !== undefined ? <input type="hidden" name="productId" value={productId} /> : (
          <div className="field">
            <label htmlFor="dp">Product</label>
            <select id="dp" name="productId" className="input text-sm">
              <option value="">General (not linked to a product)</option>
              {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" name="title" required />
          <div className="field">
            <label htmlFor="dv">Who can download</label>
            <select id="dv" name="visibility" className="input text-sm">
              <option value="public">Everyone</option>
              <option value="customers">Signed-in customers only</option>
            </select>
          </div>
        </div>
        <Input label="Short description" name="description" />
        <input type="file" name="file" accept="application/pdf" required className="block text-sm" />
      </AdminForm>
    </div>
  );
}
