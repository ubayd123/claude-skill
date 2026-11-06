import type { Metadata } from "next";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import AdminNav from "@/components/admin/AdminNav";
import Wordmark from "@/components/layout/Wordmark";
import { logout } from "@/app/actions/auth";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [[{ e }], [{ a }]] = await Promise.all([
    db.select({ e: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, "new")),
    db.select({ a: count() }).from(schema.applications).where(eq(schema.applications.status, "pending")),
  ]);
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-ink px-4 py-5 text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:py-8">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/admin" className="block px-2"><Wordmark dark /></Link>
          <div className="lg:mt-10"><AdminNav badges={{ "/admin/enquiries": e, "/admin/applications": a }} /></div>
        </div>
        <div className="mt-6 hidden border-t border-white/10 px-3 pt-6 text-xs text-white/50 lg:block">
          <p className="truncate">{user.email}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/" className="hover:text-white">View site</Link>
            <form action={logout}><button className="hover:text-white">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}
