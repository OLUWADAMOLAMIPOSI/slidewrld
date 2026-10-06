import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/format";
import QuickAddButton from "@/components/QuickAddButton";

export default function ProductCard({ product }) {
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];

  return (
    <div className="group md:overflow-hidden md:rounded-xl md:bg-white md:shadow-md md:transition md:duration-200 md:hover:-translate-y-0.5 md:hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface md:aspect-square">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 180px, 50vw"
              className={`object-cover transition-opacity ${
                secondaryImage ? "group-hover:opacity-0" : ""
              }`}
            />
          )}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 180px, 50vw"
              className="object-cover opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}
          {!product.inStock && (
            <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-xs md:left-2 md:top-2 md:rounded-full md:px-2 md:py-0.5 md:text-[10px]">
              Sold out
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1 md:mt-0 md:gap-0.5 md:p-2">
          <h3 className="text-sm md:truncate md:text-xs">{product.name}</h3>
          <div className="flex gap-2 text-sm text-muted md:text-[11px]">
            <span>{formatNaira(product.price)}</span>
            {product.compareAtPrice && (
              <span className="line-through">{formatNaira(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="md:px-2 md:pb-2">
        <QuickAddButton product={product} />
      </div>
    </div>
  );
}