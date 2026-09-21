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
      size: item.size || "",
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }

  if (!orderItems.length) {
    return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
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