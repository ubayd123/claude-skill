import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import ProductCard from "@/components/products/ProductCard";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getPriceMap } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Products",
  description: "The Redlight Therapy Co. wholesale catalogue: red light therapy panels, LED face masks, hair caps and therapy straps for trade buyers.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const [categories, products, user] = await Promise.all([getCategories(), getPublishedProducts(), getCurrentUser()]);
  const priceMap = await getPriceMap(user);
  return (
    <>
      <PageHero eyebrow="Wholesale catalogue" title={<>The <span className="text-red">range.</span></>} intro="Every product below is available to trade buyers. Add products to your enquiry list and send one enquiry for everything, or open a product to enquire about it on its own.">
        <nav aria-label="Categories" className="mt-10 flex flex-wrap gap-2" data-reveal data-delay="0.4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/products/category/${c.slug}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition hover:border-red hover:text-red">
              {c.name}
            </Link>
          ))}
        </nav>
      </PageHero>
      <div className="container-x space-y-24 pb-28">
        {categories.map((c) => {
          const list = products.filter((p) => p.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} aria-labelledby={`cat-${c.slug}`}>
              <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
                <div>
                  <p className="eyebrow text-red" data-reveal>{c.tagline}</p>
                  <h2 id={`cat-${c.slug}`} className="display mt-2 text-[clamp(1.8rem,4vw,3.2rem)]" data-split>{c.name}</h2>
                </div>
                <Link href={`/products/category/${c.slug}`} className="text-sm font-semibold text-red link-u" data-reveal>View category →</Link>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p, i) => {
                  const pr = priceMap.get(p.id);
                  return <ProductCard key={p.id} product={p} category={c.shortName || c.name} price={pr?.tradePrice ? formatMoney(pr.tradePrice, pr.currency) : null} delay={i * 0.08} />;
                })}
              </div>
            </section>
          );
        })}
        {products.some((p) => !p.categoryId) && (
          <section>
            <h2 className="display text-3xl">More products</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.filter((p) => !p.categoryId).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
