import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageTitle, Table, fmtDate } from "@/components/admin/ui";

export default async function CustomersPage() {
  await requireAdmin();
  const list = await db
    .select({ u: schema.users, p: schema.businessProfiles })
    .from(schema.users)
    .leftJoin(schema.businessProfiles, eq(schema.businessProfiles.userId, schema.users.id))
    .where(eq(schema.users.role, "customer"))
    .orderBy(desc(schema.users.createdAt));
  return (
    <>
      <PageTitle title="Customers" sub="Approved wholesale customers. New customers are created by approving an application." />
      <Table head={["Business", "Email", "Country", "Prices", "Password set", "Last sign in", "Active"]}>
        {list.map(({ u, p }) => (
          <tr key={u.id} className="hover:bg-paper">
            <td className="px-4 py-3 font-semibold"><Link href={`/admin/customers/${u.id}`} className="text-red hover:underline">{p?.businessName || u.name}</Link></td>
            <td className="px-4 py-3">{u.email}</td>
            <td className="px-4 py-3">{p?.country}</td>
            <td className="px-4 py-3">{u.canViewPrices ? "Visible" : "Quote only"}</td>
            <td className="px-4 py-3">{u.passwordHash ? "Yes" : "Not yet"}</td>
            <td className="px-4 py-3 text-muted">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "Never"}</td>
            <td className="px-4 py-3">{u.active ? "Yes" : "No"}</td>
          </tr>
        ))}
      </Table>
      {list.length === 0 && <p className="mt-6 text-sm text-muted">No customers yet.</p>}
    </>
  );
}
