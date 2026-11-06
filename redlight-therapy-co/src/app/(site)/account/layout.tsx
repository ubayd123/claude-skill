import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import AccountNav from "@/components/layout/AccountNav";
import { logout } from "@/app/actions/auth";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomer();
  const prof = (await db.select().from(schema.businessProfiles).where(eq(schema.businessProfiles.userId, user.id)))[0];
  return (
    <section className="min-h-[80dvh] pb-24 pt-32 sm:pt-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-red">Wholesale account</p>
            <h1 className="display mt-2 text-[clamp(2rem,4.5vw,3.6rem)]">{prof?.businessName || user.name || "Your account"}</h1>
            <p className="mt-2 text-sm text-muted">{user.email}</p>
          </div>
          <form action={logout}>
            <button className="btn btn-ghost btn-sm">Sign out</button>
          </form>
        </div>
        <div className="mt-8"><AccountNav /></div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
