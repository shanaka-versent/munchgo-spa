import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { ordersApi } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import type { Order } from '../../types';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    ordersApi
      .getByConsumer(user.userId, 0, 5)
      .then((res) => {
        const paged = res.data.data;
        setOrders(paged.content);
        setTotalOrders(paged.totalElements);
      })
      .catch(() => {
        /* handled by interceptor */
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.state),
  );

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <h1 className="text-2xl font-bold text-[#1a1a2e]">
        Welcome back, {user?.firstName ?? user?.username ?? 'Customer'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Here is an overview of your orders.</p>

      {/* Stats cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-[#1a1a2e]">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Orders</p>
          <p className="mt-2 text-3xl font-bold text-[#ff6b35]">{activeOrders.length}</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Recent Orders</h2>
          <Link to="/customer/orders" className="text-sm font-medium text-[#004e89] hover:underline">
            View All Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#004e89]">
                      <Link to={`/customer/orders/${order.id}`}>{order.id.slice(0, 8)}...</Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{order.restaurantName ?? '---'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      ${order.total?.amount?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge state={order.state} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {order.timestamps?.createdAt
                        ? new Date(order.timestamps.createdAt).toLocaleDateString()
                        : '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/customer/restaurants"
          className="inline-flex items-center rounded-lg bg-[#ff6b35] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#e55a2b]"
        >
          Browse Restaurants
        </Link>
        <Link
          to="/customer/orders"
          className="inline-flex items-center rounded-lg border border-[#004e89] px-5 py-2.5 text-sm font-semibold text-[#004e89] transition hover:bg-[#004e89] hover:text-white"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
}
