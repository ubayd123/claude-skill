"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const GROUPS: [string, [string, string][]][] = [
  ["Overview", [["/admin", "Dashboard"]]],
  ["Sales", [["/admin/enquiries", "Enquiries"], ["/admin/applications", "Applications"], ["/admin/customers", "Customers"]]],
  ["Catalogue", [["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/documents", "Documents"], ["/admin/pricing", "Pricing"], ["/admin/import", "Import / export"]]],
  ["Website", [["/admin/content", "Website content"], ["/admin/emails", "Email log"]]],
];

export default function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-nav">Menu</button>
      <nav id="admin-nav" aria-label="Admin" className={`${open ? "block" : "hidden"} lg:block`}>
        {GROUPS.map(([g, items]) => (
          <div key={g} className="mb-6">
            <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">{g}</p>
            <ul className="mt-2 space-y-0.5">
              {items.map(([href, label]) => {
                const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
                return (
                  <li key={href}>
                    <Link href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                      {label}
                      {badges[href] ? <span className="rounded-full bg-red px-2 text-[0.7rem] font-bold text-white">{badges[href]}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
