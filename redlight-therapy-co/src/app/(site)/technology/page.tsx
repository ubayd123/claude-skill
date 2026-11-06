import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Technology",
  description: "The measured light output of our 300 LED red light panel, the LEDs inside it, and the test and certificate summaries behind every documented product.",
  alternates: { canonical: "/technology" },
};

const LEDS = [
  ["16", "Near-infrared 850", "853.8", "11.74", "32.5", "36%"],
  ["17", "Red 660", "659.9", "18.65", "42.3", "44%"],
  ["18", "Near-infrared 850", "853.2", "11.14", "31.9", "35%"],
  ["19", "Red 660", "660.3", "18.61", "39.4", "47%"],
  ["20", "Near-infrared 850", "852.9", "11.38", "31.8", "36%"],
  ["21", "Red 660", "660.8", "18.94", "39.2", "48%"],
];

const DOCS = [
  ["300 LED Red Light Panel", "EMC test summary, compliance certificate summary, light output measurement, LED measurement", "RT1500S+"],
  ["Red Light Therapy Hair Cap", "EMC and electrical safety certificate summary", "QZ022, QZ036"],
  ["Red Light Therapy Knee Strap", "EMC test summary, declaration of conformity summary", "K8 (K6 and K9 also named)"],
  ["Red Light Therapy Face Mask", "EMC test summary, certificate of conformity summary", "V-F2509 (V-F239 and V-F239Pro also listed)"],
  ["Starter LED Face Mask", "EMC test summary, certificate of compliance summary", "SA-P02M01 (tested); SA-P02M01 to M09 covered"],
];

export default function TechnologyPage() {
  return (
    <>
      <PageHero eyebrow="Technology" title={<>Light you can <span className="text-red">measure.</span></>} intro="Our documentation packs summarise third-party test reports, certificates and instrument measurements. Here is what they show." />

      <section className="relative overflow-hidden bg-night py-24 text-white sm:py-32 grain">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(229_9_32/0.3),transparent)]" />
        <div className="container-x relative grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-red" data-reveal>300 LED panel · light output</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]" data-split>Two main colours.</h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/75" data-reveal>
              <p>Nearly all of the panel&apos;s light sits in two bands: red, peaking at about 660 nm, and near-infrared, peaking at about 850 nm. These are the two wavelength ranges commonly used in red light therapy devices. Near-infrared is invisible to the eye.</p>
              <p>There is only a small bump of blue-green light (about 5% of the total) and a trace of UV (about 0.1%). The output is steady: no flicker was measured.</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-[1.75rem] bg-white/10">
            {[
              ["660.8", "nm", "Main red peak", 1],
              ["66.0", "mW/cm²", "Total light power per cm² of the measured area", 1],
              ["0", "Hz", "Flicker: 0% flicker depth", 0],
              ["92", "%", "Of measured light is red or near-infrared", 0],
            ].map(([v, u, l, d]) => (
              <div key={String(l)} className="bg-night p-6 sm:p-8" data-reveal>
                <dt className="sr-only">{l}</dt>
                <dd className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.4rem)] font-bold leading-none"><span data-count={v} data-decimals={d}>{v}</span><span className="ml-1 text-[0.4em] text-red">{u}</span></dd>
                <dd className="mt-3 text-sm text-muted-dark">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="container-x relative mt-14">
          <figure className="overflow-hidden rounded-[1.75rem] bg-white p-4 sm:p-8" data-reveal="scale">
            <div className="relative aspect-[1484/720]">
              <Image src="/images/spectrum-300-led-panel.webp" alt="Spectrum chart of the 300 LED panel with peaks near 660 nm and 850 nm" fill sizes="90vw" className="object-contain" data-zoom />
            </div>
            <figcaption className="mt-4 text-sm text-muted">
              Instrument: OHSP-350SF spectroradiometer (350–1100 nm), Sep. 14, 2026, at 20 °C and 65% humidity. The printout does not record the model name or the measuring distance, and the power figure changes with distance. A measurement record, not a certificate, safety approval or medical claim.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container-x">
          <p className="eyebrow text-red" data-reveal>Individual LED test</p>
          <h2 className="display mt-3 max-w-4xl text-[clamp(2.2rem,5vw,4.2rem)]" data-split>Are the LEDs the right colours?</h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted" data-reveal>
            Six LEDs of the types used were measured at about 20 mA. All three red LEDs peaked within 1 nm of 660 nm and all three near-infrared LEDs within 1 nm of 853 nm. The red LEDs agree within about 2% of each other on light output, the near-infrared LEDs within about 5%.
          </p>
          <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-line bg-white" data-reveal>
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Results for each LED</caption>
              <thead className="bg-paper text-xs uppercase tracking-[0.12em] text-muted">
                <tr><th className="px-5 py-4">LED no.</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Peak colour (nm)</th><th className="px-5 py-4">Light output (mW)</th><th className="px-5 py-4">Power used (mW)</th><th className="px-5 py-4">Power turned into light</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {LEDS.map((r) => (
                  <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`px-5 py-4 ${i === 1 ? (c.startsWith("Red") ? "font-semibold text-red" : "font-semibold text-red-deep") : ""}`}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">Instrument: Everfine LED300 with HAAS2000 spectrometer, Nov. 3, 2026. This tests the LEDs on their own, not a finished product, so it does not show how bright a finished device is.</p>
        </div>
      </section>

      <section className="border-t border-line bg-paper-2 py-24 sm:py-32">
        <div className="container-x">
          <p className="eyebrow text-red" data-reveal>Testing and documentation</p>
          <h2 className="display mt-3 max-w-4xl text-[clamp(2.2rem,5vw,4.2rem)]" data-split>A documentation pack for every tested product.</h2>
          <div className="mt-10 grid gap-4">
            {DOCS.map(([p, pages, model], i) => (
              <div key={p} className="card grid gap-2 p-6 md:grid-cols-[1fr_1.4fr_1fr] md:items-center md:gap-6" data-reveal data-delay={i * 0.05}>
                <p className="font-[family-name:var(--font-display)] font-bold">{p}</p>
                <p className="text-sm text-muted">{pages}</p>
                <p className="text-sm font-semibold">{model}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="card p-8" data-reveal>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">How to read the documents</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li><strong className="text-ink">EMC</strong> (electromagnetic compatibility) tests check that a device does not disturb other electronics, and keeps working normally when exposed to interference.</li>
                <li><strong className="text-ink">Electrical safety</strong> is covered by the low voltage certificate for the hair cap.</li>
                <li><strong className="text-ink">Light measurements</strong> for the panel show the colours of light it gives out and how steady the output is.</li>
                <li><strong className="text-ink">“Not applicable”</strong> on a page means the lab recorded that test as not relevant to the product, for example mains tests on a battery-powered device.</li>
              </ul>
            </div>
            <div className="card p-8" data-reveal data-delay="0.1">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">Please note</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li>These pages are summaries, not certificates. Each is based on a single tested sample and does not assess every unit produced.</li>
                <li>The documents cover EMC, electrical safety and light measurements. They do not make or support any medical or health claim.</li>
                <li>Full original reports are available on request.</li>
              </ul>
              <Link href="/products" className="btn btn-ink btn-sm mt-6">Download from product pages <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
