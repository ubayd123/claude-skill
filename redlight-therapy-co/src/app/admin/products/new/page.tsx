import { requireAdmin } from "@/lib/auth";
import ProductForm from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";
import { getCategories } from "@/lib/catalog";

export default async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Add product" />
      <ProductForm categories={await getCategories()} />
    </>
  );
}
