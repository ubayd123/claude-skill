import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import LightRings from "@/components/motion/LightRings";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { getContent } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About us",
  description: "Redlight Therapy Co. supplies red light therapy panels, LED face masks, a hair cap and a knee strap to businesses.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [content, categories, products] = await Promise.all([getContent(), getCategories(), getPublishedProducts()]);
  return (
    <>
      <PageHero eyebrow="About us" title={<>Red light, <span className="text-red">for business.</span></>} intro={content.aboutIntro} />
      <section className="pb-24">
        <div className="container-x">
          <div className="relative h-[60vh] min-h-[22rem] overflow-hidden rounded-[2.5rem] bg-night" data-reveal="scale">
            <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-90">
              {products.slice(0, 3).map((p) => (
                <div key={p.id} className="relative overflow-hidden">
                  <div data-parallax="0.2" className="absolute inset-[-15%]">
                    <Image src={p.image} alt={p.imageAlt || p.name} fill sizes="33vw" className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgb(7_7_7/0.8),transparent_60%)]" />
            <LightRings className="absolute -bottom-24 -right-24 h-96 w-96 opacity-60 mix-blend-screen" />
            <p className="display absolute bottom-8 left-8 right-8 text-[clamp(1.8rem,4vw,3.6rem)] text-white">Panels. Masks. Caps. Straps.</p>
          </div>
        </div>
      </section>
      <section className="pb-24 sm:pb-32">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="display text-[clamp(2rem,4.5vw,3.8rem)]" data-split>Who we work with</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted" data-reveal>{content.aboutBody}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {categories.map((c, i) => (
              <li key={c.id} data-reveal data-delay={i * 0.08}>
                <Link href={`/products/category/${c.slug}`} className="group block overflow-hidden rounded-[1.5rem] border border-line bg-white">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-night">
                    {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 22vw, 45vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />}
                  </span>
                  <span className="block p-5">
                    <span className="block font-[family-name:var(--font-display)] font-bold">{c.name}</span>
                    <span className="mt-1 block text-sm text-muted">{c.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border-t border-line bg-paper-2 py-24">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {[
            ["Accurate information", "Product details on this website come from our own catalogue and the documentation behind it. If something is not documented, we say so and send it on request."],
            ["Documented products", "Each tested product has a supporting pack of one-page summaries from third-party test reports, certificates and measurements."],
            ["Personal service", "There is no checkout. Every enquiry is read and answered by a person, by email."],
          ].map(([t, d], i) => (
            <div key={t} className="card p-8" data-reveal data-delay={i * 0.1}>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">{t}</h3>
              <p className="mt-3 leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
