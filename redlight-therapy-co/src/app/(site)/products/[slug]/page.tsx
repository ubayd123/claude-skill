import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import ProductGallery from "@/components/products/ProductGallery";
import EnquireModal from "@/components/products/EnquireModal";
import ProductCard from "@/components/products/ProductCard";
import AddToEnquiry from "@/components/enquiry/AddToEnquiry";
import { IconCheck, IconDownload } from "@/components/icons/Icons";
import { db, schema } from "@/db";
import { getDocuments, getProductBySlug, getPublishedProducts, paragraphs } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { canSeePrices, getPriceForProduct, getTiers } from "@/lib/pricing";
import { getTradeTerms } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { siteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle || `${p.name} | Wholesale`,
    description: p.seoDescription || p.summary,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description: p.seoDescription || p.summary, images: p.image ? [{ url: p.image, alt: p.imageAlt }] : undefined },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const user = await getCurrentUser();
  const [docs, all, showPrices, terms] = await Promise.all([
    getDocuments({ productId: product.id, includeCustomerDocs: !!user }),
    getPublishedProducts(),
    canSeePrices(user),
    getTradeTerms(),
  ]);
  const price = showPrices ? await getPriceForProduct(product.id) : null;
  const tiers = price ? await getTiers() : [];
  let prefill: { name?: string; business?: string; email?: string; phone?: string; country?: string } | undefined;
  if (user?.role === "customer") {
    const prof = (await db.select().from(schema.businessProfiles).where(eq(schema.businessProfiles.userId, user.id)))[0];
    prefill = { name: prof?.contactName || user.name, business: prof?.businessName, email: user.email, phone: prof?.phone, country: prof?.country };
  }
  const priceText = price?.tradePrice ? formatMoney(price.tradePrice, price.currency) : null;
  const groups = [...new Set(product.specs.map((s) => s.group))];
  const related = all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).concat(all.filter((p) => p.id !== product.id && p.categoryId !== product.categoryId)).slice(0, 3);
  const images = [product.image, ...product.gallery].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: images.map((i) => `${siteUrl()}${i}`),
    brand: { "@type": "Brand", name: "Redlight Therapy Co." },
    category: product.category?.name,
    ...(product.models[0] ? { model: product.models[0].model } : {}),
    url: `${siteUrl()}/products/${product.slug}`,
  };

  const info: [string, string][] = [
    ["Dimensions", product.dimensions],
    ["What's included", product.whatsIncluded],
    ["How to use", product.usage],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-20 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(229_9_32/0.12),transparent)]" />
        <div className="container-x relative">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted" data-reveal>
            <Link href="/products" className="link-u hover:text-ink">Products</Link>
            {product.category && (
              <>
                {" "}<span aria-hidden="true">/</span>{" "}
                <Link href={`/products/category/${product.category.slug}`} className="link-u hover:text-ink">{product.category.name}</Link>
              </>
            )}
            {" "}<span aria-hidden="true">/</span> <span className="text-ink">{product.name}</span>
          </nav>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ProductGallery images={images} alt={product.imageAlt || product.name} />
            </div>
            <div>
              {product.category && <p className="eyebrow text-red" data-reveal>{product.category.name}</p>}
              <h1 className="display mt-3 text-[clamp(2.4rem,5.4vw,4.8rem)]" data-split="load">{product.name}</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted" data-reveal data-delay="0.2">{product.summary}</p>

              {product.models.length > 0 && (
                <div className="mt-8" data-reveal data-delay="0.3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Models on the documentation</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.models.map((m) => (
                      <li key={m.model} title={m.note} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold">{m.model}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 rounded-[1.5rem] border border-line bg-white p-6" data-reveal data-delay="0.35">
                {priceText ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Your trade price</p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-ink">{priceText} <span className="text-base font-medium text-muted">per unit</span></p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                      {price?.rrp && <div><dt className="text-muted">RRP</dt><dd className="font-semibold">{formatMoney(price.rrp, price.currency)}</dd></div>}
                      {price?.resellerMargin && <div><dt className="text-muted">Reseller margin</dt><dd className="font-semibold">{price.resellerMargin}</dd></div>}
                      {price?.moq ? <div><dt className="text-muted">Minimum order</dt><dd className="font-semibold">{price.moq} units</dd></div> : null}
                    </dl>
                    {tiers.length > 0 && (
                      <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
                        {tiers.map((t) => (
                          <li key={t.id} className="flex justify-between"><span className="text-muted">{t.label}</span><span className="font-semibold">{t.description}{Number(t.discountPercent) > 0 && price ? ` · ${formatMoney(Number(price.tradePrice) * (1 - Number(t.discountPercent) / 100), price.currency)}` : ""}</span></li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Wholesale price</p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">Price on application</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {user ? "Send an enquiry and we will reply with a quotation." : (
                        <>Trade prices are shared with approved wholesale customers. <Link href="/wholesale#apply" className="font-semibold text-red link-u">Apply for an account</Link> or <Link href={`/login?next=/products/${product.slug}`} className="font-semibold text-red link-u">sign in</Link>, or enquire below for a quotation.</>
                      )}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal data-delay="0.4">
                <EnquireModal product={{ id: product.id, name: product.name }} models={product.models.map((m) => m.model)} prefill={prefill} price={priceText} moq={price?.moq ?? (showPrices ? terms.moq : undefined)} />
                <AddToEnquiry product={product} label="Add to enquiry list" className="btn btn-ghost" quantity={price?.moq ?? 1} />
              </div>

              {product.features.length > 0 && (
                <ul className="mt-10 space-y-3 border-t border-line pt-8">
                  {product.features.map((f, i) => (
                    <li key={f} className="flex gap-3 text-[0.95rem]" data-reveal data-delay={i * 0.05}>
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red/10 text-red"><IconCheck className="h-4 w-4" /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white py-20 sm:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow text-red" data-reveal>Product description</p>
            <h2 className="display mt-3 text-[clamp(1.8rem,4vw,3.2rem)]" data-split>About the {product.name}</h2>
          </div>
          <div className="prose-rl text-lg" data-reveal>
            {paragraphs(product.description).map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="display text-[clamp(1.8rem,4vw,3rem)]" data-split>Technical specifications</h2>
            {groups.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6 text-muted" data-reveal>Full specifications for this model are available on request. <Link href="/contact" className="font-semibold text-red link-u">Ask us for them</Link>.</p>
            ) : (
              groups.map((g) => (
                <div key={g} className="mt-8" data-reveal>
                  <h3 className="eyebrow text-red">{g}</h3>
                  <dl className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                    {product.specs.filter((s) => s.group === g).map((s) => (
                      <div key={s.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                        <dt className="text-sm text-muted">{s.label}</dt>
                        <dd className="text-sm font-medium">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))
            )}
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Figures come from the third-party test reports, certificates and instrument measurements summarised in this product&apos;s documentation pack. They describe the samples tested and do not make or support any medical or health claim.
            </p>
          </div>
          <aside className="space-y-6">
            <div className="card p-6" data-reveal>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">Product information</h2>
              <dl className="mt-4 space-y-4">
                {info.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{k}</dt>
                    <dd className="mt-1 whitespace-pre-line text-sm">{v || <span className="text-muted">Available on request</span>}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card p-6" data-reveal>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">Documentation</h2>
              {docs.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Documentation for this product is available on request.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {docs.map((d) => (
                    <li key={d.id}>
                      <a href={`/docs/${d.id}`} target="_blank" rel="noopener" className="group flex items-start gap-3 rounded-2xl border border-line p-4 transition hover:border-red">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white transition group-hover:bg-red"><IconDownload className="h-5 w-5" /></span>
                        <span>
                          <span className="block text-sm font-semibold">{d.title}</span>
                          <span className="block text-xs text-muted">{d.description || "PDF"}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted">These are summaries, not certificates. Full original reports are available on request.</p>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper-2 py-20 sm:py-28">
          <div className="container-x">
            <h2 className="display text-[clamp(1.8rem,4vw,3rem)]" data-split>You may also like</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p, i) => <ProductCard key={p.id} product={p} category={p.category?.shortName} delay={i * 0.08} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
