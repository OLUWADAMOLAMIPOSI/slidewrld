import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl">Add product</h1>
      <ProductForm />
    </div>
  );
}
