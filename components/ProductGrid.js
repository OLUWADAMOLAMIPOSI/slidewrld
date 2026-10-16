import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ScrollableRow from "@/components/ScrollableRow";

export default function ProductGrid({ title, description, products, viewAllHref }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-content px-5 py-14 md:px-8">
      <div className="relative mb-8 text-center">
        <h2 className="text-3xl leading-tight md:text-5xl">{title}</h2>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{description}</p>
        )}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="absolute right-0 top-2 text-sm text-muted hover:text-ink"
          >
            View all
          </Link>
        )}
      </div>
      <ScrollableRow>
        {products.map((product) => (
          <div key={product.id} className="w-[46vw] flex-shrink-0 sm:w-[260px]">
            <ProductCard product={product} />
          </div>
        ))}
      </ScrollableRow>
    </section>
  );
}