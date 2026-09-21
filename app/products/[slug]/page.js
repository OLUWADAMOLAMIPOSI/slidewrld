import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartForm from "@/components/AddToCartForm";
import { readData } from "@/lib/db";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const data = await readData();
  const product = data.products.find((p) => p.slug === params.slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }) {
  const data = await readData();
  const { products, settings } = data;
  const product = products.find((p) => p.slug === params.slug);

  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            {product.images.map((image, index) => (
              <div key={image} className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="md:sticky md:top-24 md:self-start">
            <h1 className="text-2xl">{product.name}</h1>
            <div className="mt-2 flex gap-2 text-base text-muted">
              <span>{formatNaira(product.price)}</span>
              {product.compareAtPrice && (
                <span className="line-through">{formatNaira(product.compareAtPrice)}</span>
              )}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted">{product.description}</p>

            <div className="mt-8">
              <AddToCartForm product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
