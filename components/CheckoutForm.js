"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/components/CartContext";
import { formatNaira } from "@/lib/format";

export default function CheckoutForm({ bankDetails, paystackPublicKey }) {
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
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    function handlePageShow(event) {
      if (event.persisted) setStatus("idle");
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function cartPayload() {
    return items.map((item) => ({
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));
  }

  async function placeOrder(extra) {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartPayload(), customer: form, ...extra }),
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

  async function handleOpayPayment() {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/opay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartPayload(), customer: form }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not start the OPay payment. Please try again.");
        setStatus("idle");
        return;
      }

      window.location.href = data.cashierUrl;
    } catch {
      setError("Could not start the OPay payment. Please try again.");
      setStatus("idle");
    }
  }

  function handlePaystackPayment() {
    if (!window.PaystackPop) {
      setError("Payment system is still loading. Please wait a moment and try again.");
      return;
    }
    if (!paystackPublicKey) {
      setError("Card payment is not configured yet. Please use another method.");
      return;
    }

    setStatus("loading");
    setError("");

    const reference = `SW_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: form.email,
      amount: Math.round(subtotal * 100),
      currency: "NGN",
      ref: reference,
      callback: function (response) {
        placeOrder({ paymentMethod: "paystack", paymentReference: response.reference });
      },
      onClose: function () {
        setStatus("idle");
      },
    });

    handler.openIframe();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (paymentMethod === "paystack") {
      handlePaystackPayment();
    } else if (paymentMethod === "opay") {
      handleOpayPayment();
    } else {
      placeOrder({ paymentMethod: "bank_transfer" });
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">Your cart is empty.</p>;
  }

  const buttonLabel =
    status === "loading"
      ? "Processing"
      : paymentMethod === "paystack"
      ? "Pay now"
      : paymentMethod === "opay"
      ? "Pay with OPay"
      : "Place order";

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

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

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm">Payment method</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === "bank_transfer"}
              onChange={() => setPaymentMethod("bank_transfer")}
            />
            Bank transfer
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="opay"
              checked={paymentMethod === "opay"}
              onChange={() => setPaymentMethod("opay")}
            />
            Pay with OPay
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              value="paystack"
              checked={paymentMethod === "paystack"}
              onChange={() => setPaymentMethod("paystack")}
            />
            Pay with card (Paystack)
          </label>
        </div>

        {paymentMethod === "bank_transfer" && (
          <div className="border border-line p-5">
            <h3 className="mb-2 text-sm">Bank transfer details</h3>
            <p className="mb-3 text-sm text-muted">
              Transfer the total below to the account details shown, then place your order. You
              will receive an email once payment is confirmed.
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
        )}

        {paymentMethod === "opay" && (
          <div className="border border-line p-5">
            <h3 className="mb-2 text-sm">Pay with OPay</h3>
            <p className="text-sm text-muted">
              Clicking "Pay with OPay" takes you to OPay's secure payment page. Once your payment
              is successful you will be brought back here and shown your order confirmation.
            </p>
          </div>
        )}

        {paymentMethod === "paystack" && (
          <div className="border border-line p-5">
            <h3 className="mb-2 text-sm">Pay by card</h3>
            <p className="text-sm text-muted">
              Clicking "Pay now" opens a secure Paystack window to complete your card payment.
              Your order is confirmed automatically the moment payment succeeds.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-muted">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 bg-ink py-3 text-sm text-paper disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </form>

      <div className="border border-line p-6">
        <h2 className="mb-4 text-base">Order summary</h2>
        <ul className="flex flex-col gap-3 text-sm">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color || "none"}`}
              className="flex justify-between"
            >
              <span>
                {item.name}{" "}
                {item.color ? `(${item.color}, Size ${item.size})` : `(Size ${item.size})`} x
                {item.quantity}
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