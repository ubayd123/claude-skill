import PageHero from "./PageHero";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow={`Last updated ${updated}`} title={title} />
      <section className="pb-28">
        <div className="container-x">
          <div className="prose-rl max-w-3xl space-y-2 [&_h2]:mt-10 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_li]:leading-relaxed [&_li]:text-[#333]">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
