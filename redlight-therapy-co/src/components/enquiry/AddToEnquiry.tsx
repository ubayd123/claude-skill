"use client";

import { useEnquiryList } from "./EnquiryListProvider";

type Props = {
  product: { id: number; slug: string; name: string; image: string };
  label?: string;
  className?: string;
  quantity?: number;
};

export default function AddToEnquiry({ product, label = "Request pricing", className = "btn btn-ink btn-sm", quantity = 1 }: Props) {
  const { add } = useEnquiryList();
  return (
    <button
      type="button"
      className={className}
      onClick={() => add({ productId: product.id, slug: product.slug, name: product.name, image: product.image }, quantity)}
    >
      {label}
    </button>
  );
}
