import Image from "next/image";
import AdminForm from "./AdminForm";
import { Input } from "./ui";
import { saveProduct } from "@/app/actions/admin";
import type { Category, Product } from "@/lib/catalog";

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const specs = product?.specs.map((s) => `${s.group} | ${s.label} | ${s.value}`).join("\n") ?? "";
  const models = product?.models.map((m) => (m.note ? `${m.model} | ${m.note}` : m.model)).join("\n") ?? "";
  return (
    <AdminForm action={saveProduct} submitLabel={product ? "Save product" : "Create product"}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4 rounded-2xl border border-line bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Product name" name="name" defaultValue={product?.name} required />
            <Input label="URL slug" name="slug" defaultValue={product?.slug} hint="Leave blank to create from the name" />
          </div>
          <Input label="Short description (cards and search results)" name="summary" defaultValue={product?.summary} textarea rows={2} />
          <Input label="Full description" name="description" defaultValue={product?.description} textarea rows={8} hint="Leave a blank line between paragraphs." />
          <Input label="Features (one per line)" name="features" defaultValue={product?.features.join("\n")} textarea rows={5} />
          <Input label="Technical specifications" name="specs" defaultValue={specs} textarea rows={8} hint="One per line: Group | Label | Value (e.g. Power | Input | DC 5V)" />
          <Input label="Available models" name="models" defaultValue={models} textarea rows={3} hint="One per line: Model | Note" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Dimensions" name="dimensions" defaultValue={product?.dimensions} textarea rows={3} />
            <Input label="What's included" name="whatsIncluded" defaultValue={product?.whatsIncluded} textarea rows={3} />
            <Input label="How to use" name="usage" defaultValue={product?.usage} textarea rows={3} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-line bg-white p-6">
            <div className="field">
              <label htmlFor="cat">Category</label>
              <select id="cat" name="categoryId" defaultValue={product?.categoryId ?? ""} className="input text-sm">
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={product?.status ?? "draft"} className="input text-sm">
                  <option value="published">Published</option>
                  <option value="draft">Draft (hidden)</option>
                </select>
              </div>
              <Input label="Sort order" name="sort" type="number" defaultValue={product?.sort ?? 0} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-[#e50920]" /> Feature on the homepage</label>
          </div>
          <div className="space-y-4 rounded-2xl border border-line bg-white p-6">
            <p className="text-sm font-semibold">Main image</p>
            {product?.image && <div className="relative aspect-square w-40 overflow-hidden rounded-xl bg-night"><Image src={product.image} alt="" fill sizes="160px" className="object-cover" /></div>}
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm" />
            <Input label="Image description (alt text)" name="imageAlt" defaultValue={product?.imageAlt} />
            <p className="text-sm font-semibold">Gallery</p>
            {product && product.gallery.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.gallery.map((g) => (
                  <label key={g} className="relative block h-20 w-20 overflow-hidden rounded-lg bg-night">
                    <Image src={g} alt="" fill sizes="80px" className="object-cover" />
                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-white/90 px-1 text-[10px]"><input type="checkbox" name="keepGallery" value={g} defaultChecked /> keep</span>
                  </label>
                ))}
              </div>
            )}
            <input type="file" name="gallery" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm" />
            <p className="text-xs text-muted">Images are checked, stripped of metadata and converted to WebP. Max 12 MB each.</p>
          </div>
          <div className="space-y-4 rounded-2xl border border-line bg-white p-6">
            <Input label="SEO title" name="seoTitle" defaultValue={product?.seoTitle} />
            <Input label="SEO description" name="seoDescription" defaultValue={product?.seoDescription} textarea rows={3} />
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
