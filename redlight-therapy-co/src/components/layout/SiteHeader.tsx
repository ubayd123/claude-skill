"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Wordmark from "./Wordmark";
import Magnetic from "@/components/motion/Magnetic";
import { useEnquiryList } from "@/components/enquiry/EnquiryListProvider";
import { lenisStore } from "@/components/motion/SmoothScroll";

type NavCategory = { slug: string; name: string; tagline: string; image: string };
type Props = { categories: NavCategory[]; account: { href: string; label: string } | null };

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products", dropdown: true },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader({ categories, account }: Props) {
  const pathname = usePathname();
  const { count, setOpen } = useEnquiryList();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  // Entrance
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !headerRef.current) return;
    gsap.fromTo(headerRef.current, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay: 0.15 });
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
    setDrop(false);
  }, [pathname]);

  // Dropdown animation
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    if (drop) {
      gsap.set(el, { display: "block" });
      gsap.fromTo(el, { opacity: 0, y: -12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll("[data-dd]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "expo.out" });
    } else {
      gsap.to(el, { opacity: 0, y: -8, duration: 0.2, onComplete: () => gsap.set(el, { display: "none" }) });
    }
  }, [drop]);

  // Mobile menu animation
  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;
    if (menu) {
      lenisStore.current?.stop();
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 0.8, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll("[data-m]"), { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, delay: 0.25, duration: 0.8, ease: "expo.out" });
    } else {
      lenisStore.current?.start();
      gsap.to(el, { clipPath: "circle(0% at 100% 0%)", duration: 0.5, ease: "expo.in", onComplete: () => gsap.set(el, { display: "none" }) });
    }
  }, [menu]);

  // Pop the badge when the enquiry list changes
  useEffect(() => {
    if (!badgeRef.current || count === 0) return;
    gsap.fromTo(badgeRef.current, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  }, [count]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-[70] px-3 pt-3 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:px-5 sm:pt-4 ${hidden && !menu && !drop ? "-translate-y-[120%]" : ""}`}
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-[88rem] items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 transition-all duration-500 sm:pl-5 ${
            scrolled ? "border-line bg-white/80 shadow-[0_12px_40px_-20px_rgb(16_16_16/0.35)] backdrop-blur-xl" : "border-transparent bg-white/40 backdrop-blur-md"
          }`}
        >
          <Link href="/" aria-label="Redlight Therapy Co. home" className="shrink-0">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) =>
              l.dropdown ? (
                <li key={l.href} className="relative" onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
                  <button
                    type="button"
                    aria-expanded={drop}
                    aria-controls="products-menu"
                    onClick={() => setDrop((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[0.82rem] font-medium transition-colors ${isActive(l.href) ? "text-red" : "text-ink/80 hover:text-ink"}`}
                  >
                    {l.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform duration-300 ${drop ? "rotate-180" : ""}`}>
                      <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </button>
                  <div id="products-menu" ref={dropRef} className="absolute left-1/2 top-full hidden w-[min(760px,80vw)] -translate-x-1/2 pt-4">
                    <div className="grid grid-cols-2 gap-2 rounded-[1.75rem] border border-line bg-white/95 p-3 shadow-[0_30px_80px_-30px_rgb(16_16_16/0.45)] backdrop-blur-xl">
                      {categories.map((c) => (
                        <Link key={c.slug} data-dd href={`/products/category/${c.slug}`} className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-paper">
                          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink">
                            {c.image && <Image src={c.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-ink">{c.name}</span>
                            <span className="block text-xs text-muted">{c.tagline}</span>
                          </span>
                        </Link>
                      ))}
                      <Link data-dd href="/products" className="col-span-2 flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white">
                        View the full catalogue <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={`relative rounded-full px-4 py-2.5 text-[0.82rem] font-medium transition-colors ${isActive(l.href) ? "text-red" : "text-ink/80 hover:text-ink"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-white transition hover:border-ink/30"
              aria-label={`Open enquiry list (${count} items)`}
              title="Enquiry list"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="4" width="14" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M9 4.5V3.5h6v1M8.5 10h7M8.5 14h7M8.5 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {count > 0 && (
                <span ref={badgeRef} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-[10px] font-bold text-white">
                  {count > 999 ? "999+" : count}
                </span>
              )}
            </button>
            {account && (
              <Link href={account.href} className="hidden h-11 items-center rounded-full border border-line bg-white px-4 text-[0.78rem] font-semibold sm:flex">
                {account.label}
              </Link>
            )}
            <div className="hidden md:block">
              <Magnetic>
                <Link href="/enquiry" className="btn btn-red btn-sm">
                  Request a quote
                </Link>
              </Magnetic>
            </div>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu((v) => !v)}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-[1.5px] w-5 bg-white transition-transform duration-500 ${menu ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-[1.5px] w-5 bg-white transition-transform duration-500 ${menu ? "-translate-y-[6px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div id="mobile-menu" ref={mobileRef} className="fixed inset-0 z-[65] hidden flex-col bg-ink px-6 pb-10 pt-28 text-white" data-lenis-prevent>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full glow-red opacity-70" />
        <ul className="relative flex flex-1 flex-col gap-1 overflow-y-auto">
          {LINKS.map((l) => (
            <li key={l.href} data-m>
              <Link href={l.href} className={`display block py-2 text-[2.4rem] ${isActive(l.href) ? "text-red" : "text-white"}`}>
                {l.label}
              </Link>
            </li>
          ))}
          <li data-m className="mt-4 grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <Link key={c.slug} href={`/products/category/${c.slug}`} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
                {c.name}
              </Link>
            ))}
          </li>
        </ul>
        <div data-m className="relative mt-6 flex flex-col gap-3">
          <Link href="/enquiry" className="btn btn-red w-full">Request a quote</Link>
          <Link href={account?.href ?? "/login"} className="btn btn-ghost-dark w-full">{account?.label ?? "Trade sign in"}</Link>
        </div>
      </div>
    </>
  );
}
