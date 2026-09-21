import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://slidewrld.com";
  const data = await readData();

  const staticRoutes = [
    "",
    "/products",
    "/about",
    "/contact",
    "/policies/privacy-policy",
    "/policies/refund-policy",
    "/policies/shipping-policy",
    "/policies/terms-of-service",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const productRoutes = data.products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.createdAt,
  }));

  const categories = [...new Set(data.products.map((p) => p.category.toLowerCase()))];
  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/collections/${category}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
