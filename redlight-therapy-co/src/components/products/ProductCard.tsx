import Image from "next/image";
import Link from "next/link";
import SpotlightCard from "@/components/motion/SpotlightCard";
import AddToEnquiry from "@/components/enquiry/AddToEnquiry";

type Props = {
  product: { id: number; slug: string; name: string; image: string; imageAlt: string; summary: string };
  category?: string;
  price?: string | null;
  delay?: number;
};

export default function ProductCard({ product, category, price, delay = 0 }: Props) {
  return (
    <div data-reveal data-delay={delay} className="h-full">
      <SpotlightCard className="card flex h-full flex-col p-3">
        <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-[1.25rem] bg-night" tabIndex={-1} aria-hidden="true">
          {product.image && (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width:1280px) 22vw, (min-width:640px) 45vw, 92vw"
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
            />
          )}
          <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(7_7_7/0.55))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {category && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">{category}</span>}
        </Link>
        <div className="relative flex flex-1 flex-col px-3 pb-3 pt-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight">
            <Link href={`/products/${product.slug}`} className="link-u">{product.name}</Link>
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{product.summary}</p>
          {price ? (
            <p className="mt-4 text-sm"><span className="text-muted">Your trade price</span> <strong className="text-red">{price}</strong></p>
          ) : (
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted">Trade price on application</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <AddToEnquiry product={product} label={price ? "Add to enquiry" : "Request pricing"} />
            <Link href={`/products/${product.slug}`} className="btn btn-ghost btn-sm">View product</Link>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
