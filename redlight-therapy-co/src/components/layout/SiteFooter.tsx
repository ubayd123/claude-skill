import Link from "next/link";
import Wordmark from "./Wordmark";
import LightRings from "@/components/motion/LightRings";
import { BUSINESS_EMAIL } from "@/lib/site";
import type { Socials } from "@/lib/settings";

const SOCIAL_LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", linkedin: "LinkedIn", youtube: "YouTube", x: "X" };

export default function SiteFooter({ categories, socials }: { categories: { slug: string; name: string }[]; socials: Socials }) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(socials).filter(([, v]) => v);
  return (
    <footer className="relative overflow-hidden bg-night text-white grain">
      <LightRings className="pointer-events-none absolute -right-48 -top-48 h-[38rem] w-[38rem] opacity-[0.16]" />
      <div className="container-x relative pt-24">
        <div className="flex flex-col items-start justify-between gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end">
          <h2 className="display max-w-3xl text-[clamp(2.4rem,7vw,6rem)]" >
            Let&apos;s build with <span className="bg-gradient-to-r from-ember to-red bg-clip-text text-transparent">light.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/wholesale#apply" className="btn btn-red">Apply for a wholesale account <span className="arrow">→</span></Link>
            <a href={`mailto:${BUSINESS_EMAIL}`} className="btn btn-ghost-dark">{BUSINESS_EMAIL}</a>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark dark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-dark">
              Wholesale red light therapy devices for distributors, retailers, clinics, salons and wellness businesses.
              LED panels, LED face masks, a hair cap and a knee strap, each backed by test and certificate summaries.
            </p>
          </div>
          <div>
            <p className="eyebrow text-white/50">Products</p>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c.slug}><Link className="text-white/80 link-u hover:text-white" href={`/products/category/${c.slug}`}>{c.name}</Link></li>
              ))}
              <li><Link className="text-white/80 link-u hover:text-white" href="/products">Full catalogue</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/50">Wholesale</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link className="text-white/80 link-u hover:text-white" href="/wholesale">Wholesale information</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/wholesale#apply">Apply for an account</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/enquiry">Bulk order enquiry</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/login">Trade sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/50">Company</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link className="text-white/80 link-u hover:text-white" href="/about">About us</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/technology">Technology</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/contact">Contact</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/privacy">Privacy policy</Link></li>
              <li><Link className="text-white/80 link-u hover:text-white" href="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Redlight Therapy Co. All rights reserved. Product images are for illustration.</p>
          {socialEntries.length > 0 && (
            <ul className="flex gap-4" aria-label="Social media">
              {socialEntries.map(([k, v]) => (
                <li key={k}><a href={v} target="_blank" rel="noopener noreferrer" className="link-u hover:text-white">{SOCIAL_LABEL[k] ?? k}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="display translate-y-[18%] whitespace-nowrap text-center text-[19vw] leading-none text-white/[0.04]">REDLIGHT</p>
      </div>
    </footer>
  );
}
