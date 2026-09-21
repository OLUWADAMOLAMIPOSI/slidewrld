"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-content px-5 py-10 md:px-8">
        <h1 className="mb-8 text-2xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="mb-4 text-sm text-muted">Your cart is empty.</p>
            <Link href="/products" className="text-sm underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="md:col-span-2">
              <ul className="flex flex-col divide-y divide-line">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-6">
                    <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-surface">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="text-sm text-muted">Size {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="h-8 w-8 border border-line"
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
                            className="h-8 w-8 border border-line"
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm">{formatNaira(item.price * item.quantity)}</span>
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

            <div className="border border-line p-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <p className="mb-6 text-xs text-muted">
                Shipping and payment details are added at checkout.
              </p>
              <Link
                href="/checkout"
                className="block w-full bg-ink py-3 text-center text-sm text-paper"
              >
                Check out
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
