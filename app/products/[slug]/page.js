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
      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Image gallery */}
          <div className="mx-auto flex w-full max-w-sm flex-col gap-4 md:max-w-none">
            {product.images.map((image, index) => (
              <div
                key={image}
                className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface shadow-lg"
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Product info */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h1 className="text-2xl">{product.name}</h1>
              <div className="mt-2 flex gap-2 text-base text-muted">
                <span>{formatNaira(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="line-through">
                    {formatNaira(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                {product.description}
              </p>

              <div className="mt-8">
                <AddToCartForm product={product} />
              </div>
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