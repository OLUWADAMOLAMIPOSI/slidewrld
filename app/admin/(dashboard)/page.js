import Link from "next/link";
import { readData } from "@/lib/db";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const data = await readData();
  const { products, orders, subscribers } = data;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stats = [
    { label: "Products", value: products.length },
    { label: "Orders", value: orders.length },
    { label: "Pending orders", value: pendingOrders },
    { label: "Subscribers", value: subscribers.length },
    { label: "Total revenue", value: formatNaira(totalRevenue) },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-line p-4">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-lg">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-muted hover:text-ink">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto border border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.customer.name}</td>
                    <td className="px-4 py-3">{formatNaira(order.total)}</td>
                    <td className="px-4 py-3 capitalize">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
