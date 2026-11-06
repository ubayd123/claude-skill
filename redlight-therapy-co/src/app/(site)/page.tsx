import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ProductCard from "@/components/products/ProductCard";
import Marquee from "@/components/motion/Marquee";
import LightRings from "@/components/motion/LightRings";
import Magnetic from "@/components/motion/Magnetic";
import { ContactForm } from "@/components/forms/EnquiryForms";
import { IconBoxes, IconDoc, IconGlobe, IconGrid, IconRoute, IconStack } from "@/components/icons/Icons";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { getContent } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getPriceMap } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import { BUSINESS_EMAIL } from "@/lib/site";

const PARTNER = [
  { icon: IconBoxes, title: "Wholesale opportunities", text: "Trade pricing for approved business customers, with recommended retail prices to plan your margins." },
  { icon: IconStack, title: "Bulk purchasing enquiries", text: "Build one enquiry across several products and quantities. We reply by email with a quotation." },
  { icon: IconGrid, title: "Product range", text: "LED panels in two sizes, two LED face masks, a red light therapy hair cap and a knee strap." },
  { icon: IconDoc, title: "Business support", text: "Test and certificate summaries for each documented product, ready to share with your own customers." },
  { icon: IconRoute, title: "Distribution opportunities", text: "Distributors and resellers are welcome to discuss supplying the range in their market." },
  { icon: IconGlobe, title: "International enquiries", text: "We welcome enquiries from businesses outside the UK. Tell us where you are and what you need." },
];

export default async function HomePage() {
  const [content, categories, products, user] = await Promise.all([getContent(), getCategories(), getPublishedProducts(), getCurrentUser()]);
  const priceMap = await getPriceMap(user);
  const slides = products
    .filter((p) => p.image)
    .map((p) => ({ name: p.name, image: p.image, alt: p.imageAlt || p.name, category: p.category?.name ?? "", slug: p.slug }));
  const mainCats = categories.slice(0, 3).map((c) => ({
    ...c,
    products: products.filter((p) => p.categoryId === c.id).map((p) => ({ name: p.name, slug: p.slug, image: p.image })),
  }));
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      <Hero slides={slides} eyebrow={content.heroEyebrow} headline={content.heroHeadline} subtext={content.heroSubtext} />

      <Marquee items={["660 nm red", "850 nm near-infrared", "LED panels", "LED face masks", "Hair caps", "Trade enquiries welcome", "Wholesale"]} dark />

      <CategoryShowcase categories={mainCats} />

      {/* Featured products */}
      <section className="relative py-24 sm:py-32" aria-labelledby="featured-h">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-red" data-reveal>Featured products</p>
              <h2 id="featured-h" className="display mt-3 max-w-3xl text-[clamp(2.2rem,5vw,4.4rem)]" data-split>
                Built to stock. <span className="text-red">Ready to sell.</span>
              </h2>
            </div>
            <Link href="/products" className="btn btn-ghost self-start md:self-auto" data-reveal>View all products <span className="arrow">→</span></Link>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((p, i) => {
              const price = priceMap.get(p.id);
              return <ProductCard key={p.id} product={p} category={p.category?.shortName || p.category?.name} price={price?.tradePrice ? formatMoney(price.tradePrice, price.currency) : null} delay={i * 0.08} />;
            })}
          </div>
        </div>
      </section>

      {/* Why partner with us */}
      <section className="relative overflow-hidden bg-paper-2 py-24 sm:py-32" aria-labelledby="why-h">
        <LightRings tone="soft" className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] opacity-60" />
        <div className="container-x relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow text-red" data-reveal>Why partner with us?</p>
            <h2 id="why-h" className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>A range made for business.</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted" data-reveal>
              We supply red light therapy devices to distributors, retailers, beauty clinics, salons, wellness businesses and resellers.
            </p>
            <div className="mt-8" data-reveal><Link href="/wholesale" className="btn btn-ink">How wholesale works <span className="arrow">→</span></Link></div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {PARTNER.map((item, i) => (
              <li key={item.title} data-reveal data-delay={(i % 2) * 0.1} className="group card relative overflow-hidden p-7 transition-transform duration-500 hover:-translate-y-1">
                <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red/0 blur-2xl transition-colors duration-700 group-hover:bg-red/20" aria-hidden="true" />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white transition-colors duration-500 group-hover:bg-red">
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Technology showcase (dark) */}
      <section className="relative overflow-hidden bg-night py-24 text-white sm:py-32 grain" aria-labelledby="tech-h">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(229_9_32/0.28),transparent)]" />
        <div className="container-x relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow text-red" data-reveal>Technology</p>
              <h2 id="tech-h" className="display mt-3 text-[clamp(2.2rem,4.4vw,4.6rem)]" data-split>
                Two wavelengths. <span className="bg-gradient-to-r from-ember to-red bg-clip-text text-transparent">Measured.</span>
              </h2>
            </div>
            <p className="max-w-lg text-lg leading-relaxed text-muted-dark" data-reveal>
              A spectroradiometer measurement of our 300 LED panel shows nearly all of its light in two bands: red, peaking at about 660 nm,
              and near-infrared, peaking at about 850 nm. These are the two wavelength ranges commonly used in red light therapy devices.
            </p>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] bg-white/10 lg:grid-cols-4">
            {[
              { v: 660.8, d: 1, s: "nm", l: "Main red peak" },
              { v: 850, d: 0, s: "nm", l: "Near-infrared peak (approx.)" },
              { v: 92, d: 0, s: "%", l: "Of measured light is red or near-infrared" },
              { v: 0, d: 0, s: "%", l: "Flicker depth measured" },
            ].map((s) => (
              <div key={s.l} className="bg-night p-6 sm:p-8" data-reveal>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.5vw,4rem)] font-bold leading-none tracking-tight">
                  <span data-count={s.v} data-decimals={s.d}>{s.v}</span>
                  <span className="ml-1 text-[0.45em] text-red">{s.s}</span>
                </dd>
                <dd className="mt-3 text-sm text-muted-dark">{s.l}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <figure className="relative overflow-hidden rounded-[1.75rem] bg-white p-4 sm:p-6" data-reveal="scale">
              <div className="relative aspect-[1484/720] overflow-hidden">
                <Image src="/images/spectrum-300-led-panel.webp" alt="Light spectrum of the 300 LED panel: a tall red peak near 660 nm, a near-infrared peak near 850 nm and a small blue-green bump near 480 nm" fill sizes="(min-width:1024px) 55vw, 92vw" className="object-contain" />
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2px] bg-red shadow-[0_0_20px_4px_rgb(229_9_32/0.6)] animate-[scan_6s_ease-in-out_infinite]" />
              </div>
              <figcaption className="mt-3 text-xs text-muted">Wavelength (nm) along the bottom. Chart from the instrument printout, 300 LED panel. A measurement record, not a medical claim.</figcaption>
            </figure>
            <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8" data-reveal>
              <div>
                <p className="eyebrow text-white/50">How the light is split</p>
                <div className="mt-5 flex h-4 overflow-hidden rounded-full">
                  <span className="bg-red" style={{ width: "45%" }} />
                  <span className="bg-red-deep" style={{ width: "47%" }} />
                  <span className="bg-white/25" style={{ width: "8%" }} />
                </div>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  <li className="flex justify-between"><span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-red" />Red</span><span>45%</span></li>
                  <li className="flex justify-between"><span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-deep" />Near-infrared</span><span>47%</span></li>
                  <li className="flex justify-between"><span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-white/40" />Other</span><span>8%</span></li>
                </ul>
              </div>
              <Link href="/technology" className="btn btn-ghost-dark self-start">Explore the technology <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wholesale partnership */}
      <section className="relative overflow-hidden py-24 sm:py-36" aria-labelledby="partner-h">
        <div className="container-x relative">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white px-6 py-16 shadow-[0_50px_100px_-60px_rgb(16_16_16/0.5)] ring-1 ring-black/5 sm:px-14 sm:py-24">
            <LightRings className="pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem] opacity-[0.22]" />
            <p className="eyebrow text-red" data-reveal>Wholesale partnership</p>
            <h2 id="partner-h" className="display mt-4 max-w-4xl text-[clamp(2.6rem,7vw,6.4rem)]" data-split>
              {content.partnerHeadline}
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted" data-reveal>{content.partnerText}</p>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                ["Apply", "Tell us about your business with a short wholesale application."],
                ["Get approved", "Once approved, sign in to see trade pricing and documents."],
                ["Enquire", "Add products and quantities to one enquiry. We reply with a quote."],
              ].map(([t, d], i) => (
                <li key={t} className="rounded-[1.5rem] border border-line bg-paper p-6" data-reveal data-delay={i * 0.1}>
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold text-red">0{i + 1}</span>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold">{t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12" data-reveal>
              <Magnetic>
                <Link href="/wholesale#apply" className="btn btn-red">Apply for a wholesale account <span className="arrow">→</span></Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="relative overflow-hidden bg-paper-2 py-24 sm:py-32" aria-labelledby="about-h">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="relative grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((p, i) => (
              <div key={p.id} className={`relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-night ${i % 2 ? "translate-y-10" : ""}`} data-reveal data-delay={i * 0.08}>
                <div data-parallax={i % 2 ? 0.25 : 0.12} className="absolute inset-[-12%]">
                  <Image src={p.image} alt={p.imageAlt || p.name} fill sizes="(min-width:1024px) 22vw, 45vw" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="eyebrow text-red" data-reveal>About us</p>
            <h2 id="about-h" className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>Light, supplied with care.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted" data-reveal>{content.aboutIntro}</p>
            <p className="mt-4 leading-relaxed text-muted" data-reveal>{content.aboutBody}</p>
            <div className="mt-8" data-reveal><Link href="/about" className="btn btn-ghost">More about us <span className="arrow">→</span></Link></div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="relative py-24 sm:py-32" aria-labelledby="contact-h">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-red" data-reveal>Contact</p>
            <h2 id="contact-h" className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>Talk to us.</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted" data-reveal>{content.contactIntro}</p>
            <a href={`mailto:${BUSINESS_EMAIL}`} className="mt-8 inline-flex items-center gap-3 font-[family-name:var(--font-display)] text-lg font-bold text-ink link-u sm:text-xl" data-reveal>
              {BUSINESS_EMAIL}
            </a>
          </div>
          <div className="card p-6 sm:p-10" data-reveal>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
