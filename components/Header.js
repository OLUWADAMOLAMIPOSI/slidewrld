"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track order" },
];

export default function Header({ storeName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, setIsDrawerOpen } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4 md:px-8">
          <button
            type="button"
            className="flex flex-col justify-center gap-1.5 md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span
              className={`block h-px w-6 bg-ink transition-transform ${
                isMenuOpen ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-ink transition-opacity ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-px w-6 bg-ink transition-transform ${
                isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </button>

          <Link href="/" className="text-lg tracking-wide2 md:text-xl">
            {storeName || "SlideWrld"}
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-muted">
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-sm"
            aria-label="Open cart"
          >
            Cart ({itemCount})
          </button>
        </div>

        {isMenuOpen && (
          <nav className="border-t border-line bg-paper px-5 py-4 md:hidden">
            <ul className="flex flex-col gap-4 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
