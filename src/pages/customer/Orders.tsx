import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import type { Order } from '../../types';

export default function CustomerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    ordersApi
      .getByConsumer(user.userId, page, 10)
      .then((res) => {
        const paged = res.data.data;
        setOrders(paged.content);
        setTotalPages(paged.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">My Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Track and manage all your orders.</p>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">No orders found.</p>
          <Link
            to="/customer/restaurants"
            className="mt-4 inline-flex items-center rounded-lg bg-[#ff6b35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e55a2b]"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/customer/orders/${order.id}`)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#004e89]">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {order.restaurantName ?? '---'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
