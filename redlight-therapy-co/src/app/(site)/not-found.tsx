import Link from "next/link";
import LightRings from "@/components/motion/LightRings";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[80dvh] place-items-center overflow-hidden pt-24">
      <LightRings className="absolute h-[34rem] w-[34rem] opacity-20" />
      <div className="relative text-center">
        <p className="display text-[clamp(5rem,18vw,12rem)] text-red">404</p>
        <p className="mt-2 text-lg text-muted">We could not find that page.</p>
        <Link href="/" className="btn btn-ink mt-8">Back to home</Link>
      </div>
    </section>
  );
}
