import { readData, writeData } from "@/lib/db";
import { queryPaymentStatus } from "@/lib/opay";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/mail";

export async function finalizeOpayPayment(reference) {
  const before = await readData();

  const existing = before.orders.find((o) => o.id === reference);
  if (existing) return { state: "paid", order: existing };

  const pending = (before.pendingPayments || []).find((p) => p.reference === reference);
  if (!pending) return { state: "unknown" };

  const result = await queryPaymentStatus(reference);
  const info = result?.data;
  const opayStatus = info?.status;

  if (opayStatus === "FAIL" || opayStatus === "CLOSE") {
    return { state: "failed" };
  }

  if (opayStatus !== "SUCCESS") {
    return { state: "pending" };
  }

  const expectedKobo = Math.round(pending.total * 100);
  const paidKobo = Number(info?.amount?.total);
  const currency = info?.amount?.currency;

  if (paidKobo !== expectedKobo || currency !== "NGN") {
    console.error("OPay amount mismatch:", { reference, paidKobo, expectedKobo, currency });
    return { state: "failed" };
  }

  const requested = {};
  for (const item of pending.items) {
    requested[item.productId] = (requested[item.productId] || 0) + item.quantity;
  }

  let created = null;

  await writeData((data) => {
    if (data.orders.some((o) => o.id === reference)) return;

    const order = {
      id: reference,
      items: pending.items,
      total: pending.total,
      customer: pending.customer,
      paymentMethod: "opay",
      paymentReference: info.orderNo || reference,
      status: "paid",
      createdAt: new Date().toISOString(),
    };

    data.orders.push(order);

    for (const [productId, quantity] of Object.entries(requested)) {
      const product = data.products.find((p) => p.id === productId);
      if (product && typeof product.stock === "number") {
        product.stock = Math.max(0, product.stock - quantity);
        if (product.stock === 0) product.inStock = false;
      }
    }

    data.pendingPayments = (data.pendingPayments || []).filter((p) => p.reference !== reference);
    created = order;
  });

  if (created) {
    const [confirmation, adminNotice] = await Promise.allSettled([
      sendOrderConfirmationEmail(created),
      sendAdminOrderNotification(created),
    ]);
    if (confirmation.status === "rejected") {
      console.error("Customer confirmation email failed:", confirmation.reason);
    }
    if (adminNotice.status === "rejected") {
      console.error("Admin notification email failed:", adminNotice.reason);
    }
    return { state: "paid", order: created };
  }

  const after = await readData();
  const order = after.orders.find((o) => o.id === reference);
  return order ? { state: "paid", order } : { state: "pending" };
}