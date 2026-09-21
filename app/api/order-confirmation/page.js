import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readData } from "@/lib/db";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order confirmed",
};

export default async function OrderConfirmationPage({ params }) {
  const data = await readData();
  const { settings } = data;
  const order = data.orders.find((o) => o.id === params.id);

  if (!order) notFound();

  return (
    <>
      <Header storeName={settings.storeName} />
      <main className="mx-auto max-w-content px-5 py-14 md:px-8">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl">Thank you for your order</h1>
          <p className="mt-3 text-sm text-muted">
            Order reference {order.id}. A confirmation email has been sent to{" "}
            {order.customer.email}.
          </p>
          <p className="mt-2 text-sm">
            <Link href="/track-order" className="underline">
              Track this order
            </Link>{" "}
            any time using your order reference and email.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-lg border border-line p-6">
          <ul className="flex flex-col gap-3 text-sm">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex justify-between">
                <span>
                  {item.name} (Size {item.size}) x{item.quantity}
                </span>
                <span>{formatNaira(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-lg border border-line p-6">
          <h2 className="mb-2 text-sm">Payment - bank transfer</h2>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Bank</dt>
              <dd>{settings.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Account name</dt>
              <dd>{settings.bankAccountName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Account number</dt>
              <dd>{settings.bankAccountNumber}</dd>
            </div>
          </dl>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}