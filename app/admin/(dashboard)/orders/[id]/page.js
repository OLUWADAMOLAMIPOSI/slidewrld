import { notFound } from "next/navigation";
import { readData } from "@/lib/db";
import { formatNaira } from "@/lib/format";
import OrderStatusForm from "@/components/OrderStatusForm";
import DeleteOrderButton from "@/components/DeleteOrderButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({ params }) {
  const data = await readData();
  const order = data.orders.find((o) => o.id === params.id);

  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl">Order {order.id}</h1>
        <DeleteOrderButton orderId={order.id} />
      </div>
      <p className="mb-8 text-sm text-muted">
        Placed on {new Date(order.createdAt).toLocaleString("en-NG")}
      </p>

      <div className="mb-8 border border-line p-6">
        <h2 className="mb-3 text-sm text-muted">Status</h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="mb-8 border border-line p-6">
        <h2 className="mb-3 text-sm text-muted">Customer</h2>
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Name</dt>
            <dd>{order.customer.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd>{order.customer.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Phone</dt>
            <dd>{order.customer.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Address</dt>
            <dd className="text-right">
              {order.customer.address}
              {order.customer.city ? `, ${order.customer.city}` : ""}
              {order.customer.state ? `, ${order.customer.state}` : ""}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border border-line p-6">
        <h2 className="mb-3 text-sm text-muted">Items</h2>
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
    </div>
  );
}
