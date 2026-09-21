import Link from "next/link";
import Newsletter from "@/components/Newsletter";

export default function Footer({ settings }) {
  const year = new Date().getFullYear();

  const socialLinks = [
    { label: "Instagram", href: settings?.instagram },
    { label: "TikTok", href: settings?.tiktok },
    { label: "X (Twitter)", href: settings?.twitter },
  ].filter((link) => link.href);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-content px-5 py-14 md:px-8">
        <Newsletter />

        <div className="mt-14 grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-muted">Shop</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/products">All products</Link></li>
              <li><Link href="/collections/slides">Slides</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-muted">Company</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-muted">Policies</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/policies/privacy-policy">Privacy policy</Link></li>
              <li><Link href="/policies/refund-policy">Refund policy</Link></li>
              <li><Link href="/policies/shipping-policy">Shipping policy</Link></li>
              <li><Link href="/policies/terms-of-service">Terms of service</Link></li>
            </ul>
          </div>
          {socialLinks.length > 0 && (
            <div>
              <h3 className="mb-3 text-muted">Follow</h3>
              <ul className="flex flex-col gap-2">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-12 text-xs text-muted">
          &copy; {year} {settings?.storeName || "SlideWrld"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
