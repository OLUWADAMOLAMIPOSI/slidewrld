import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({ title, products, viewAllHref }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-content px-5 py-14 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm text-muted hover:text-ink">
            View all
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
