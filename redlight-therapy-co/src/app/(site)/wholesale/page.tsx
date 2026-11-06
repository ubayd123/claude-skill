import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import ApplicationForm from "@/components/forms/ApplicationForm";
import Marquee from "@/components/motion/Marquee";
import { getPublishedProducts } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { BUSINESS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Become a Redlight Therapy Co. wholesale partner. Apply for a trade account to access trade pricing and send bulk order enquiries.",
  alternates: { canonical: "/wholesale" },
};

const WHO = ["Distributors", "Retailers", "Beauty clinics", "Salons", "Wellness businesses", "Resellers", "International buyers"];

export default async function WholesalePage() {
  const [products, user] = await Promise.all([getPublishedProducts(), getCurrentUser()]);
  return (
    <>
      <PageHero eyebrow="Wholesale" title={<>Build your business <span className="text-red">with light.</span></>} intro="Trade pricing is shared with approved business customers. Apply for an account, or send an enquiry and we will reply with an individual quotation." />
      <Marquee items={WHO} />
      <section className="py-24 sm:py-32">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {[
            ["Approved account pricing", "Once your application is approved you can sign in to see trade prices, recommended retail prices and the trade terms on our current price list."],
            ["Individual quotations", "Not ready to apply? Send an enquiry from any product page and we will reply by email with a quotation for your quantities."],
            ["Bulk order enquiries", "Add several products and quantities to your enquiry list and send them together. Every enquiry is recorded and answered personally."],
          ].map(([t, d], i) => (
            <div key={t} className="card p-8" data-reveal data-delay={i * 0.1}>
              <span className="font-[family-name:var(--font-display)] text-5xl font-bold text-red/20">0{i + 1}</span>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold">{t}</h2>
              <p className="mt-3 leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="container-x mt-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-12" data-reveal>
            <div aria-hidden="true" className="absolute -right-20 -top-20 h-80 w-80 rounded-full glow-red" />
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h2 className="display text-[clamp(1.6rem,3vw,2.6rem)]">No checkout. No online payment.</h2>
                <p className="mt-3 max-w-2xl text-muted-dark">This website takes enquiries only. Every order is agreed with you by email, so you always speak to a person before anything is confirmed.</p>
              </div>
              <Link href="/enquiry" className="btn btn-red shrink-0">Start a bulk enquiry <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-24 border-t border-line bg-paper-2 py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow text-red" data-reveal>Apply</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,5vw,4.2rem)]" data-split>Apply for a wholesale account</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted" data-reveal>
              Tell us about your business. We review every application and reply by email. Approved customers receive a link to set a password and sign in.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted" data-reveal>
              <li>Questions first? Email <a href={`mailto:${BUSINESS_EMAIL}`} className="font-semibold text-red link-u">{BUSINESS_EMAIL}</a></li>
              <li>Already approved? <Link href="/login" className="font-semibold text-red link-u">Sign in</Link></li>
            </ul>
          </div>
          <div className="card p-6 sm:p-10" data-reveal>
            {user?.role === "customer" ? (
              <p className="text-lg">You already have a wholesale account. <Link href="/account" className="font-semibold text-red link-u">Go to your account</Link>.</p>
            ) : (
              <ApplicationForm products={products.map((p) => p.name)} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
