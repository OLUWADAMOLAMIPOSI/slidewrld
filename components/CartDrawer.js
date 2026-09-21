"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { formatNaira } from "@/lib/format";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    subtotal,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-ink/40"
        onClick={() => setIsDrawerOpen(false)}
      />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-paper p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base">Your cart</h2>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close cart"
            className="text-sm text-muted"
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted">Your cart is empty.</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-surface">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between text-sm">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-muted">Size {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-6 w-6 border border-line"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className="h-6 w-6 border border-line"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span>{formatNaira(item.price * item.quantity)}</span>
                    </div>
                    <button
                      type="button"
                      className="mt-1 self-start text-xs text-muted underline"
                      onClick={() => removeItem(item.productId, item.size)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsDrawerOpen(false)}
              className="block w-full bg-ink py-3 text-center text-sm text-paper"
            >
              Check out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
