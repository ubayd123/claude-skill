import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/EnquiryForms";
import { IconMail } from "@/components/icons/Icons";
import { getContent } from "@/lib/settings";
import { BUSINESS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Redlight Therapy Co. about wholesale, distribution and bulk order enquiries.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [content, sp] = await Promise.all([getContent(), searchParams]);
  const kind = ["wholesale", "distribution", "bulk", "contact"].includes(sp.type ?? "") ? sp.type : "contact";
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&apos;s <span className="text-red">talk.</span></>} intro={content.contactIntro} />
      <section className="pb-28">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <a href={`mailto:${BUSINESS_EMAIL}`} className="group card flex items-center gap-4 p-6" data-reveal>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red text-white"><IconMail className="h-6 w-6" /></span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Business email</span>
                <span className="block break-all font-semibold group-hover:text-red">{BUSINESS_EMAIL}</span>
              </span>
            </a>
            {[
              ["Wholesale enquiries", "Trade pricing and opening an account.", "/contact?type=wholesale"],
              ["Distribution enquiries", "Supplying the range in your market.", "/contact?type=distribution"],
              ["Bulk order enquiries", "Several products and quantities at once.", "/enquiry"],
            ].map(([t, d, href], i) => (
              <Link key={t} href={href} className="card flex items-center justify-between gap-4 p-6 transition hover:border-red" data-reveal data-delay={(i + 1) * 0.06}>
                <span>
                  <span className="block font-[family-name:var(--font-display)] font-bold">{t}</span>
                  <span className="block text-sm text-muted">{d}</span>
                </span>
                <span aria-hidden="true" className="text-red">→</span>
              </Link>
            ))}
          </div>
          <div className="card p-6 sm:p-10" data-reveal>
            <ContactForm defaultKind={kind} key={kind} />
          </div>
        </div>
      </section>
    </>
  );
}
