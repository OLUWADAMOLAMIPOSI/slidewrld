import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import TrustBadges from "@/components/TrustBadges";
import ColorShowcase from "@/components/ColorShowcase";
import BrandsRow from "@/components/BrandsRow";
import FunFacts from "@/components/FunFacts";
import SneakPeek from "@/components/SneakPeek";
import StyleGuide from "@/components/StyleGuide";
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
  const sectionDescriptions = settings.sectionDescriptions || {};
  const showcaseProduct = settings.showcaseProductId
    ? products.find((p) => p.id === settings.showcaseProductId)
    : null;
  const brands = settings.brands || [];
  const funFacts = settings.funFacts || [];
  const sneakPeeks = settings.sneakPeeks || [];
  const styleGuide = settings.styleGuide || [];

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
            <h1 className="max-w-md text-3xl text-paper md:text-5xl">{settings.heroHeading}</h1>
            <p className="mt-3 max-w-sm text-paper/90">{settings.heroSubheading}</p>
            <Link href="/products" className="mt-6 bg-paper px-6 py-3 text-sm text-ink">
              Shop collection
            </Link>
          </div>
        </section>

        <Reveal>
          <TrustBadges />
        </Reveal>

        {showcaseProduct && showcaseProduct.colors?.length > 1 && (
          <Reveal>
            <ColorShowcase product={showcaseProduct} />
          </Reveal>
        )}

        <Reveal>
          <ProductGrid
            title="New arrivals"
            description={sectionDescriptions.newArrivals}
            products={newArrivals}
            viewAllHref="/products"
          />
        </Reveal>

        {styleGuide.length > 0 && (
          <Reveal>
            <StyleGuide items={styleGuide} description={sectionDescriptions.styleGuide} />
          </Reveal>
        )}

        <Reveal>
          <ProductGrid
            title="Best sellers"
            description={sectionDescriptions.bestSellers}
            products={bestSellers}
            viewAllHref="/products"
          />
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

        {funFacts.length > 0 && (
          <Reveal>
            <FunFacts facts={funFacts} />
          </Reveal>
        )}

        {sneakPeeks.length > 0 && (
          <Reveal>
            <SneakPeek items={sneakPeeks} description={sectionDescriptions.sneakPeek} />
          </Reveal>
        )}

        {brands.length > 0 && (
          <Reveal>
            <BrandsRow brands={brands} />
          </Reveal>
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}