import Image from "next/image";

export default function Wordmark({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <Image src="/brand/logo-mark.png" alt="" width={44} height={44} priority className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`font-[family-name:var(--font-display)] text-[0.95rem] font-extrabold tracking-[0.04em] ${dark ? "text-white" : "text-ink"}`}>REDLIGHT</span>
          <span className="my-[3px] h-px w-full bg-red" />
          <span className={`font-[family-name:var(--font-display)] text-[0.62rem] font-medium tracking-[0.2em] ${dark ? "text-white/70" : "text-ink/70"}`}>THERAPY CO.</span>
        </span>
      )}
      <span className="sr-only">Redlight Therapy Co.</span>
    </span>
  );
}
