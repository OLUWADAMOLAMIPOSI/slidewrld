"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";

export default function AddToCartForm({ product }) {
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  function handleSubmit(event) {
    event.preventDefault();
    addItem(product, size, quantity);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
        <p className="mb-2 text-sm">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-9 w-9 border border-line"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
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
  );
}
