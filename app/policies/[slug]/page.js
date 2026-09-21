import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

const POLICY_MAP = {
  "privacy-policy": { title: "Privacy policy", key: "privacyPolicy" },
  "refund-policy": { title: "Refund policy", key: "refundPolicy" },
  "shipping-policy": { title: "Shipping policy", key: "shippingPolicy" },
  "terms-of-service": { title: "Terms of service", key: "termsOfService" },
};

export async function generateMetadata({ params }) {
  const entry = POLICY_MAP[params.slug];
  if (!entry) return {};
  return { title: entry.title };
}

export default async function PolicyPage({ params }) {
  const entry = POLICY_MAP[params.slug];
  if (!entry) notFound();

  const data = await readData();
  const { settings } = data;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-14 md:px-8">
        <h1 className="mb-6 text-2xl">{entry.title}</h1>
        <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted">
          {settings[entry.key]}
        </p>
      </main>
      <Footer settings={settings} />
    </>
  );
}
