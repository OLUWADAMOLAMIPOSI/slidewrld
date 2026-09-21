import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const data = await readData();
  const { settings } = data;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-14 md:px-8">
        <h1 className="mb-6 text-2xl">About {settings.storeName}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{settings.aboutText}</p>
      </main>
      <Footer settings={settings} />
    </>
  );
}
