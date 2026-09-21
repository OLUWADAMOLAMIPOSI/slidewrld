import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop all",
  description: "Browse the full SlideWrld collection.",
};

export default async function ProductsPage({ searchParams }) {
  const data = await readData();
  const { products, settings } = data;

  const categories = [...new Set(products.map((p) => p.category))];
  const activeCategory = searchParams?.category;
  const filtered = activeCategory
    ? products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase())
    : products;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-10 md:px-8">
        <h1 className="mb-6 text-2xl">Shop all</h1>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`border px-4 py-2 text-sm ${
              !activeCategory ? "border-ink bg-ink text-paper" : "border-line"
            }`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${category.toLowerCase()}`}
              className={`border px-4 py-2 text-sm ${
                activeCategory === category.toLowerCase()
                  ? "border-ink bg-ink text-paper"
                  : "border-line"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}
