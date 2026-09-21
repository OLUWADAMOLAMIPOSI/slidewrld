"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatNaira } from "@/lib/format";

const STAGES = ["pending", "paid", "shipped", "delivered"];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId.trim())}?email=${encodeURIComponent(
          email.trim()
        )}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "We could not find that order.");
        setStatus("idle");
        return;
      }

      setOrder(data.order);
      setStatus("idle");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  const currentStageIndex = order ? STAGES.indexOf(order.status) : -1;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-content px-5 py-14 md:px-8">
        <h1 className="mb-2 text-2xl">Track your order</h1>
        <p className="mb-8 text-sm text-muted">
          Enter your order reference and the email you used at checkout.
        </p>

        <form onSubmit={handleSubmit} className="mb-10 flex max-w-md flex-col gap-4">
          <input
            required
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Order reference (e.g. SW-XXXXXXX)"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email used at checkout"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-ink py-3 text-sm text-paper disabled:opacity-60"
          >
            {status === "loading" ? "Looking up order" : "Track order"}
          </button>
          {error && <p className="text-sm text-muted">{error}</p>}
        </form>

        {order && (
          <div className="max-w-md border border-line p-6">
            <p className="mb-1 text-sm text-muted">Order {order.id}</p>
            <p className="mb-6 text-lg capitalize">{order.status}</p>

            {order.status === "cancelled" ? (
              <p className="mb-6 text-sm text-muted">This order was cancelled.</p>
            ) : (
              <ol className="mb-6 flex flex-col gap-3 text-sm">
                {STAGES.map((stage, index) => {
                  const reached = currentStageIndex >= index;
                  return (
                    <li
                      key={stage}
                      className={`flex items-center gap-3 ${reached ? "" : "text-muted"}`}
                    >
                      <span
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${
                          reached ? "bg-ink" : "bg-line"
                        }`}
                      />
                      <span className="capitalize">{stage}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <ul className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
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
        )}
      </main>
      <Footer />
    </>
  );
}