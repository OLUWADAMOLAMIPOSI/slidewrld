"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatNaira } from "@/lib/format";

export default function CheckoutForm({ bankDetails }) {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
          customer: form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">Your cart is empty.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:col-span-2">
        <h2 className="text-base">Delivery details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <input
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
          className="border border-line bg-surface px-3 py-2 text-sm"
        />
        <input
          name="address"
          required
          value={form.address}
          onChange={handleChange}
          placeholder="Delivery address"
          className="border border-line bg-surface px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-4 border border-line p-5">
          <h3 className="mb-2 text-sm">Payment - bank transfer</h3>
          <p className="mb-3 text-sm text-muted">
            Transfer the total below to the account details shown, then place your order.
            You will receive an email once payment is confirmed.
          </p>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Bank</dt>
              <dd>{bankDetails.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Account name</dt>
              <dd>{bankDetails.bankAccountName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Account number</dt>
              <dd>{bankDetails.bankAccountNumber}</dd>
            </div>
          </dl>
        </div>

        {error && <p className="text-sm text-muted">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 bg-ink py-3 text-sm text-paper disabled:opacity-60"
        >
          {status === "loading" ? "Placing order" : "Place order"}
        </button>
      </form>

      <div className="border border-line p-6">
        <h2 className="mb-4 text-base">Order summary</h2>
        <ul className="flex flex-col gap-3 text-sm">
          {items.map((item) => (
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
          <span>{formatNaira(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
