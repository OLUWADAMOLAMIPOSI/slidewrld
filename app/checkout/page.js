import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/CheckoutForm";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const data = await readData();
  const { settings } = data;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-10 md:px-8">
        <h1 className="mb-8 text-2xl">Checkout</h1>
        <CheckoutForm
          bankDetails={{
            bankName: settings.bankName,
            bankAccountName: settings.bankAccountName,
            bankAccountNumber: settings.bankAccountNumber,
          }}
        />
      </main>
      <Footer settings={settings} />
    </>
  );
}
