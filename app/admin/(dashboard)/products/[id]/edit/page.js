import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }) {
  const data = await readData();
  const product = data.products.find((p) => p.id === params.id);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl">Edit product</h1>
      <ProductForm product={product} productId={product.id} />
    </div>
  );
}
