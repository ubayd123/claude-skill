"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/account", "Overview"],
  ["/account/pricing", "Trade pricing"],
  ["/account/enquiries", "My enquiries"],
  ["/account/documents", "Documents"],
  ["/account/details", "Business details"],
];

export default function AccountNav() {
  const path = usePathname();
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1">
      {ITEMS.map(([href, label]) => {
        const active = path === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
