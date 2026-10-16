import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { readData, writeData } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/mail";

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const data = await readData();
  const orders = [...data.orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return NextResponse.json({ orders });
}

export async function POST(request) {
  const body = await request.json();
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

  const order = {
    id: "SW-" + Date.now().toString(36).toUpperCase(),
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
    status: "pending",
    createdAt: new Date().toISOString(),
  };

    await writeData((data) => {
    data.orders.push(order);

    for (const [productId, quantity] of Object.entries(requested)) {
      const product = data.products.find((p) => p.id === productId);
      if (product && typeof product.stock === "number") {
        product.stock = Math.max(0, product.stock - quantity);
        if (product.stock === 0) product.inStock = false;
      }
    }
  });
  const [confirmationResult, adminNotificationResult] = await Promise.allSettled([
    sendOrderConfirmationEmail(order),
    sendAdminOrderNotification(order),
  ]);

  if (confirmationResult.status === "rejected") {
    console.error("Customer order confirmation email failed to send:", confirmationResult.reason);
  }
  if (adminNotificationResult.status === "rejected") {
    console.error("Admin new-order notification email failed to send:", adminNotificationResult.reason);
  }

  return NextResponse.json({ order }, { status: 201 });
}