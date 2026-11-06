import type { MetadataRoute } from "next";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [cats, products] = await Promise.all([getCategories(), getPublishedProducts()]);
  const pages = ["", "/products", "/wholesale", "/technology", "/about", "/contact", "/enquiry", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...cats.map((c) => ({ url: `${base}/products/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9, images: p.image ? [`${base}${p.image}`] : undefined })),
  ];
}
