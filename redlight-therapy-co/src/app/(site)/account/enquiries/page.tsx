import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { STATUS_LABEL } from "@/lib/site";

export default async function MyEnquiries() {
  const user = await requireCustomer();
  const list = await db.select().from(schema.enquiries).where(eq(schema.enquiries.userId, user.id)).orderBy(desc(schema.enquiries.createdAt));
  const items = list.length ? await db.select().from(schema.enquiryItems).where(inArray(schema.enquiryItems.enquiryId, list.map((e) => e.id))) : [];
  if (!list.length) return <div className="card p-8 text-muted">You have not sent any enquiries yet. <Link href="/enquiry" className="font-semibold text-red link-u">Start one</Link>.</div>;
  return (
    <ul className="space-y-4">
      {list.map((e) => (
        <li key={e.id} className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-display)] font-bold">{e.reference}</p>
              <p className="text-sm text-muted">{e.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold">{STATUS_LABEL[e.status]}</span>
          </div>
          <ul className="mt-4 divide-y divide-line text-sm">
            {items.filter((i) => i.enquiryId === e.id).map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-2">
                <span>{i.quantity} × {i.productName}{i.model ? <span className="text-muted"> · {i.model}</span> : null}</span>
                {i.unitPrice && <span className="text-muted">{formatMoney(i.unitPrice, i.currency)} each</span>}
              </li>
            ))}
          </ul>
          {e.notes && <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-muted">{e.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
