import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/format";
import QuickAddButton from "@/components/QuickAddButton";

export default function ProductCard({ product }) {
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
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
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}
          {!product.inStock && (
            <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-xs">
              Sold out
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <h3 className="text-sm">{product.name}</h3>
          <div className="flex gap-2 text-sm text-muted">
            <span>{formatNaira(product.price)}</span>
            {product.compareAtPrice && (
              <span className="line-through">{formatNaira(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <QuickAddButton product={product} />
    </div>
  );
}