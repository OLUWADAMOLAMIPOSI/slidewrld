import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const data = await readData();
  const { settings } = data;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-14 md:px-8">
        <h1 className="mb-6 text-2xl">Contact</h1>
        <div className="flex max-w-md flex-col gap-3 text-sm">
          <p className="text-muted">
            Email us and we will get back to you within one to two business days.
          </p>
          <a href={`mailto:${settings.contactEmail}`} className="underline">
            {settings.contactEmail}
          </a>
          {settings.whatsapp && (
            <a href={settings.whatsapp} target="_blank" rel="noreferrer" className="underline">
              Chat with us on WhatsApp
            </a>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
