import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import TrustBadges from "@/components/TrustBadges";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await readData();
  const { products, settings } = data;

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8);
  const editorialVideos = settings.editorialVideos || [];

  return (
    <>
      <Header storeName={settings.storeName} />
      <main>
        <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
          <Image
            src={settings.heroImage || "/uploads/sample-hero.svg"}
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/10 p-6 text-center md:p-14">
            <h1 className="max-w-md text-3xl text-paper md:text-5xl">
              {settings.heroHeading}
            </h1>
            <p className="mt-3 max-w-sm text-paper/90">{settings.heroSubheading}</p>
            <Link
              href="/products"
              className="mt-6 bg-paper px-6 py-3 text-sm text-ink"
            >
              Shop collection
            </Link>
          </div>
        </section>

        <Reveal>
          <TrustBadges />
        </Reveal>

        <Reveal>
          <ProductGrid title="New arrivals" products={newArrivals} viewAllHref="/products" />
        </Reveal>
        <Reveal>
          <ProductGrid title="Best sellers" products={bestSellers} viewAllHref="/products" />
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-content px-5 py-14 text-center md:px-8">
            <p className="mx-auto max-w-xl text-lg">
              {settings.storeName} is considered comfort. {settings.tagline}
            </p>
          </section>
        </Reveal>

        {editorialVideos.length > 0 && (
          <Reveal>
            <section className="grid grid-cols-1 gap-2 px-2 md:grid-cols-3">
              {editorialVideos.map((src) => (
                <div key={src} className="relative aspect-[4/5] w-full overflow-hidden">
                  <video
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </section>
          </Reveal>
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}