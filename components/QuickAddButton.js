"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";

export default function QuickAddButton({ product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const size = product.sizes?.[0] || "";
    addItem(product, size, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!product.inStock}
      className="mt-2 w-full border border-line py-2 text-xs tracking-wide2 hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {!product.inStock ? "Sold out" : justAdded ? "Added" : "Add to cart"}
    </button>
  );
}