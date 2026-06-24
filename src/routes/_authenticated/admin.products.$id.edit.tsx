import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/product-form";

export const Route = createFileRoute("/_authenticated/admin/products/$id/edit")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  return <ProductForm productId={id} />;
}
