import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import LightRings from "@/components/motion/LightRings";
import { getCategories, getCategoryBySlug, getPublishedProducts } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getPriceMap } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCategoryBySlug((await params).slug);
  if (!c) return {};
  return { title: `${c.name} | Wholesale`, description: c.description.slice(0, 160), alternates: { canonical: `/products/category/${c.slug}` } };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const [category, categories, products, user] = await Promise.all([getCategoryBySlug(slug), getCategories(), getPublishedProducts(), getCurrentUser()]);
  if (!category) notFound();
  const list = products.filter((p) => p.categoryId === category.id);
  const priceMap = await getPriceMap(user);
  return (
    <>
      <section className="relative overflow-hidden bg-night pb-20 pt-36 text-white sm:pt-44 grain">
        {category.image && (
          <div className="absolute inset-0 opacity-40">
            <div data-parallax="0.3" className="absolute inset-[-15%]">
              <Image src={category.image} alt="" fill priority sizes="100vw" className="object-cover blur-[2px]" />
            </div>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_7_7/0.95),rgb(7_7_7/0.6)_60%,rgb(7_7_7/0.3))]" />
        <LightRings className="pointer-events-none absolute -right-20 top-16 h-[28rem] w-[28rem] opacity-40 mix-blend-screen" />
        <div className="container-x relative">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60" data-reveal>
            <Link href="/products" className="link-u hover:text-white">Products</Link> <span aria-hidden="true">/</span> <span className="text-white">{category.name}</span>
          </nav>
          <p className="eyebrow mt-8 text-red" data-reveal>{category.name}</p>
          <h1 className="display mt-4 max-w-4xl text-[clamp(2.6rem,7vw,6.4rem)]" data-split="load">{category.tagline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70" data-reveal data-delay="0.3">{category.description}</p>
        </div>
      </section>
      <div className="container-x py-20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => {
            const pr = priceMap.get(p.id);
            return <ProductCard key={p.id} product={p} category={category.shortName || category.name} price={pr?.tradePrice ? formatMoney(pr.tradePrice, pr.currency) : null} delay={i * 0.08} />;
          })}
        </div>
        {list.length === 0 && <p className="text-muted">New products for this category are coming soon.</p>}
        <div className="mt-20 flex flex-wrap gap-2 border-t border-line pt-10">
          <span className="mr-2 self-center text-sm text-muted">Other categories:</span>
          {categories.filter((c) => c.id !== category.id).map((c) => (
            <Link key={c.slug} href={`/products/category/${c.slug}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-red hover:text-red">{c.name}</Link>
          ))}
        </div>
      </div>
    </>
  );
}
