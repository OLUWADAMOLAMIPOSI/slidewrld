import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendOrderStatusEmail } from "@/lib/mail";

export async function GET(request, { params }) {
  const data = await readData();
  const order = data.orders.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();
  const allowedStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  let updated = null;
  await writeData((data) => {
    const order = data.orders.find((o) => o.id === params.id);
    if (!order) return;
    order.status = body.status;
    updated = order;
  });

  

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    await sendOrderStatusEmail(updated);
  } catch (error) {
    console.error("Order status email failed to send:", error);
  }

  return NextResponse.json({ order: updated });
}
export async function DELETE(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let removed = false;
  await writeData((data) => {
    const before = data.orders.length;
    data.orders = data.orders.filter((o) => o.id !== params.id);
    removed = data.orders.length < before;
  });

  if (!removed) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
