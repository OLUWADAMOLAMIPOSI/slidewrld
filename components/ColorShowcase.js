"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/format";

export default function ColorShowcase({ product }) {
  const [index, setIndex] = useState(0);
  const colors = product.colors;
  const current = colors[index];

  function go(direction) {
    setIndex((value) => (((value + direction) % colors.length) + colors.length) % colors.length);
  }

  return (
    <section className="relative h-[80vh] min-h-[480px] w-full overflow-hidden bg-ink">
      {current.images?.[0] && (
        <Image
          key={current.images[0]}
          src={current.images[0]}
          alt={`${product.name} - ${current.name}`}
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-ink/20" />

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous color"
        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-paper/60 bg-ink/40 text-paper md:left-8"
      >
        &#8592;
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next color"
        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-paper/60 bg-ink/40 text-paper md:right-8"
      >
        &#8594;
      </button>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-8 text-center text-paper">
        <p className="text-xs uppercase tracking-wide2 text-paper/70">
          Available in {colors.length} colors
        </p>
        <h2 className="text-3xl md:text-5xl">{product.name}</h2>
        <p className="text-sm text-paper/80">
          {current.name} &middot; {formatNaira(product.price)}
        </p>
        <Link href={`/products/${product.slug}`} className="mt-2 bg-paper px-6 py-3 text-sm text-ink">
          Shop this color
        </Link>
        <div className="mt-2 flex gap-2">
          {colors.map((color, i) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${color.name}`}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-paper" : "bg-paper/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}