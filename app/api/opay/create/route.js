import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { createCashierPayment, isOpayConfigured } from "@/lib/opay";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isOpayConfigured()) {
    return NextResponse.json(
      { error: "OPay is not available right now. Please try again later." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { items, customer } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
    return NextResponse.json(
      { error: "Name, email, phone, and address are required." },
      { status: 400 }
    );
  }

  const data = await readData();
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const product = data.products.find((p) => p.id === item.productId);
    if (!product) continue;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    orderItems.push({
      productId: product.id,
      name: product.name,
      color: item.color || null,
      size: item.size || "",
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }

  if (!orderItems.length) {
    return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
  }

  const requested = {};
  for (const item of orderItems) {
    requested[item.productId] = (requested[item.productId] || 0) + item.quantity;
  }

  for (const [productId, quantity] of Object.entries(requested)) {
    const product = data.products.find((p) => p.id === productId);
    if (!product) continue;
    const hasLimit = typeof product.stock === "number";
    if (!product.inStock || (hasLimit && product.stock <= 0)) {
      return NextResponse.json({ error: `${product.name} is out of stock.` }, { status: 409 });
    }
    if (hasLimit && quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} of ${product.name} left. Please reduce the quantity.` },
        { status: 409 }
      );
    }
  }

  const reference =
    "SW-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase();

  const pending = {
    reference,
    items: orderItems,
    total,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city || "",
      state: customer.state || "",
    },
    createdAt: new Date().toISOString(),
  };

  await writeData((d) => {
    const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
    d.pendingPayments = (d.pendingPayments || []).filter(
      (p) => new Date(p.createdAt).getTime() > cutoff
    );
    d.pendingPayments.push(pending);
  });

  const siteUrl = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");

  try {
    const payment = await createCashierPayment({
      reference,
      totalNaira: total,
      customer: pending.customer,
      items: orderItems,
      returnUrl: `${siteUrl}/opay/return?reference=${reference}`,
      cancelUrl: `${siteUrl}/checkout`,
      callbackUrl: `${siteUrl}/api/opay/callback`,
    });

    if (!payment?.cashierUrl) {
      throw new Error("OPay did not return a payment link.");
    }

    return NextResponse.json({ cashierUrl: payment.cashierUrl, reference });
  } catch (error) {
    console.error("OPay create payment failed:", error);

    await writeData((d) => {
      d.pendingPayments = (d.pendingPayments || []).filter((p) => p.reference !== reference);
    });

        return NextResponse.json(
      {
        error:
          "We could not start the OPay payment. Please try again. Reason: " +
          (error?.message || "unknown"),
      },
      { status: 502 }
    );
  }
}