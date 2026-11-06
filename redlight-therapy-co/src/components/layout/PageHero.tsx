import LightRings from "@/components/motion/LightRings";

export default function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-36 sm:pb-20 sm:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(229_9_32/0.14),transparent)]" />
      <LightRings tone="soft" className="pointer-events-none absolute -right-24 top-10 h-[26rem] w-[26rem] opacity-70" />
      <div className="container-x relative">
        <p className="eyebrow text-red" data-reveal>{eyebrow}</p>
        <h1 className="display mt-4 max-w-5xl text-[clamp(2.8rem,8vw,7.2rem)]" data-split="load">{title}</h1>
        {intro && <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl" data-reveal data-delay="0.3">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
