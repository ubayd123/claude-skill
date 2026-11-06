import Image from "next/image";
import LightRings from "@/components/motion/LightRings";

export default function AuthShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden pb-20 pt-32">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div className="relative hidden aspect-square overflow-hidden rounded-[2.5rem] bg-night lg:block" data-reveal="scale">
          <Image src="/images/products/300-led-panel.webp" alt="" fill sizes="45vw" className="object-cover opacity-90" data-zoom />
          <LightRings className="absolute -right-20 -top-20 h-96 w-96 opacity-60 mix-blend-screen" />
          <p className="display absolute bottom-8 left-8 text-4xl text-white">Trade<br />access.</p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <h1 className="display text-[clamp(2.2rem,5vw,3.6rem)]" data-split="load">{title}</h1>
          <p className="mt-4 text-muted" data-reveal>{intro}</p>
          <div className="card mt-8 p-6 sm:p-8" data-reveal data-delay="0.15">{children}</div>
        </div>
      </div>
    </section>
  );
}
