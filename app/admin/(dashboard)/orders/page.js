import Link from "next/link";
import { readData } from "@/lib/db";
import { formatNaira } from "@/lib/format";
import QuickOrderStatusButton from "@/components/QuickOrderStatusButton";
import DeleteOrderButton from "@/components/DeleteOrderButton";
export const dynamic = "force-dynamic";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const data = await readData();
  const orders = [...data.orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div>
      <h1 className="mb-8 text-2xl">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customer.name}</td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3">{formatNaira(order.total)}</td>
                  <td className="px-4 py-3"><QuickOrderStatusButton orderId={order.id} status={order.status} /></td>
                  <td className="px-4 py-3"><DeleteOrderButton orderId={order.id} /></td>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
