import { STATUS_LABEL } from "@/lib/site";

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

const TONE: Record<string, string> = {
  new: "bg-red text-white", pending: "bg-red text-white", in_progress: "bg-amber-100 text-amber-900", quoted: "bg-sky-100 text-sky-900",
  won: "bg-emerald-100 text-emerald-900", approved: "bg-emerald-100 text-emerald-900", closed: "bg-paper-2 text-muted", rejected: "bg-paper-2 text-muted",
  spam: "bg-paper-2 text-muted", sent: "bg-emerald-100 text-emerald-900", failed: "bg-blush text-red-deep", not_configured: "bg-amber-100 text-amber-900",
  published: "bg-emerald-100 text-emerald-900", draft: "bg-paper-2 text-muted",
};

export function Badge({ value }: { value: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[value] ?? "bg-paper-2"}`}>{STATUS_LABEL[value] ?? value.replace(/_/g, " ")}</span>;
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-paper text-xs uppercase tracking-[0.1em] text-muted">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Input({ label, name, defaultValue, type = "text", required, hint, textarea, rows }: { label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean; hint?: string; textarea?: boolean; rows?: number }) {
  const id = `a-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea id={id} name={name} defaultValue={defaultValue ?? ""} rows={rows ?? 4} required={required} className="input font-[inherit] text-sm" />
      ) : (
        <input id={id} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className="input text-sm" />
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export const fmtDate = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
