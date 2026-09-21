import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const category = decodeURIComponent(params.category);
  return {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Shop the ${category} collection at SlideWrld.`,
  };
}

export default async function CollectionPage({ params }) {
  const data = await readData();
  const { products, settings } = data;
  const category = decodeURIComponent(params.category);
  const filtered = products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-10 md:px-8">
        <h1 className="mb-6 text-2xl capitalize">{category}</h1>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">No products in this collection yet.</p>
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
