"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { formatNaira } from "@/lib/format";
import { swatchColor } from "@/lib/colors";

function ColorDropdown({ colors, colorIndex, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = colors[colorIndex];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border border-line px-4 py-2.5 text-sm"
      >
        <span className="flex items-center gap-2">
          <span
            className="h-4 w-4 border border-line"
            style={{ backgroundColor: swatchColor(current) }}
          />
          {current.name}
        </span>
        <span className="text-xs text-muted">{open ? "\u25B2" : "\u25BC"}</span>
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-10 mt-1 w-full border border-line bg-paper">
          {colors.map((color, index) => (
            <li key={color.name}>
              <button
                type="button"
                onClick={() => {
                  onSelect(index);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-surface"
              >
                <span
                  className="h-4 w-4 border border-line"
                    style={{ backgroundColor: swatchColor(color) }}                />
                {color.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductDetailClient({ product }) {
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const maxQty = typeof product.stock === "number" ? product.stock : null;

  const currentColor = hasColors ? product.colors[colorIndex] : null;
  const images =
    hasColors && currentColor?.images?.length ? currentColor.images : product.images;

  function goToColor(nextIndex) {
    const total = product.colors.length;
    setColorIndex(((nextIndex % total) + total) % total);
  }

  function handleAddToCart(event) {
    event.preventDefault();
    addItem(product, size, quantity, currentColor?.name || null);
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
          {images?.[0] && (
            <Image
              src={images[0]}
              alt={`${product.name}${currentColor ? " - " + currentColor.name : ""}`}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}

          {hasColors && product.colors.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToColor(colorIndex - 1)}
                aria-label="Previous color"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-line bg-paper/90 text-sm"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={() => goToColor(colorIndex + 1)}
                aria-label="Next color"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-line bg-paper/90 text-sm"
              >
                &#8594;
              </button>
            </>
          )}
        </div>

        {images?.slice(1).map((image, index) => (
          <div key={image} className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
            <Image
              src={image}
              alt={`${product.name} ${index + 2}`}
              fill
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

        <form onSubmit={handleAddToCart} className="mt-8 flex flex-col gap-6">
          {hasColors && (
            <div>
              <p className="mb-2 text-sm">Color:</p>
              <ColorDropdown colors={product.colors} colorIndex={colorIndex} onSelect={setColorIndex} />
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div>
              <p className="mb-2 text-sm">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={`h-11 w-11 border text-sm ${
                      size === option ? "border-ink bg-ink text-paper" : "border-line"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm">
              Quantity
              {maxQty !== null && maxQty > 0 && maxQty <= 5 && (
                <span className="ml-2 text-xs text-muted">Only {maxQty} left</span>
              )}
            </p>            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-9 w-9 border border-line"
                onClick={() => setQuantity((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))}                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button
                type="button"
                className="h-9 w-9 border border-line"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!product.inStock}
            className="w-full bg-ink py-3 text-sm text-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.inStock ? "Add to cart" : "Sold out"}
          </button>
        </form>
      </div>
    </div>
  );
}