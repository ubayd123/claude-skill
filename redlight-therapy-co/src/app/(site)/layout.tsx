import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { EnquiryListProvider } from "@/components/enquiry/EnquiryListProvider";
import EnquiryDrawer from "@/components/enquiry/EnquiryDrawer";
import { getCategories } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getSocials } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, user, socials] = await Promise.all([getCategories(), getCurrentUser(), getSocials()]);
  const account = user ? { href: user.role === "admin" ? "/admin" : "/account", label: user.role === "admin" ? "Admin" : "My account" } : { href: "/login", label: "Trade login" };
  return (
    <EnquiryListProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <SmoothScroll />
      <SiteHeader categories={categories.map((c) => ({ slug: c.slug, name: c.name, tagline: c.tagline, image: c.image }))} account={account} />
      <EnquiryDrawer />
      <main id="main">{children}</main>
      <SiteFooter categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} socials={socials} />
    </EnquiryListProvider>
  );
}
