import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AutoRefresh from "@/components/AutoRefresh";
import { readData } from "@/lib/db";
import { finalizeOpayPayment } from "@/lib/finalizeOpay";

export const dynamic = "force-dynamic";

export const metadata = { title: "Confirming payment" };

export default async function OpayReturnPage({ searchParams }) {
  const reference = String(searchParams?.reference || "");
  const { settings } = await readData();

  let result = { state: "unknown" };
  let couldNotVerify = false;

  if (reference) {
    try {
      result = await finalizeOpayPayment(reference);
    } catch (error) {
      console.error("OPay return verification failed:", error);
      couldNotVerify = true;
    }
  }

  if (result.state === "paid") {
    redirect(`/order-confirmation/${result.order.id}?clear=1`);
  }

  const waiting = result.state === "pending" || couldNotVerify;

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-xl px-5 py-20 text-center md:px-8">
        {waiting ? (
          <>
            <h1 className="text-2xl">Confirming your payment</h1>
            <p className="mt-3 text-sm text-muted">
              Please wait a moment while we confirm your payment with OPay. This page updates by
              itself. Do not close it.
            </p>
            <AutoRefresh seconds={5} />
          </>
        ) : result.state === "failed" ? (
          <>
            <h1 className="text-2xl">Payment not completed</h1>
            <p className="mt-3 text-sm text-muted">
              We could not confirm this payment. If money left your account, please contact us
              with this reference: {reference}
            </p>
            <Link href="/checkout" className="mt-6 inline-block bg-ink px-6 py-3 text-sm text-paper">
              Back to checkout
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl">Payment not found</h1>
            <p className="mt-3 text-sm text-muted">
              We could not find this payment. If money left your account, please contact us.
            </p>
            <Link href="/products" className="mt-6 inline-block bg-ink px-6 py-3 text-sm text-paper">
              Continue shopping
            </Link>
          </>
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}