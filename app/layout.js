import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { readData } from "@/lib/db";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://slidewrld.com";

export async function generateMetadata() {
  const data = await readData();
  const settings = data.settings || {};
  const title = `${settings.storeName || "SlideWrld"} - ${settings.tagline || "Slides for everyday wear"}`;
  const description =
    settings.aboutText ||
    "SlideWrld is a Nigerian slides brand built around comfort, quality, and quiet design.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${settings.storeName || "SlideWrld"}`,
    },
    description,
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: settings.storeName || "SlideWrld",
      images: [settings.heroImage || "/uploads/sample-hero.svg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="bg-paper text-ink font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}