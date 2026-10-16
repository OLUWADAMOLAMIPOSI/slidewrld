import Image from "next/image";
import ScrollableRow from "@/components/ScrollableRow";

export default function BrandsRow({ brands }) {
  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-content px-5 py-14 md:px-8">
      <h2 className="mb-8 text-center text-3xl leading-tight md:text-5xl">Brands we carry</h2>
      <ScrollableRow>
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="flex h-24 w-40 flex-shrink-0 items-center justify-center border border-line bg-surface p-4"
          >
            {brand.logo ? (
              <div className="relative h-full w-full">
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
              </div>
            ) : (
              <span className="text-sm text-muted">{brand.name}</span>
            )}
          </div>
        ))}
      </ScrollableRow>
    </section>
  );
}