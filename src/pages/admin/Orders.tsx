import { useEffect, useState } from 'react';
import { ordersApi } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import type { Order, OrderState } from '../../types';

const ALL_STATES: OrderState[] = [
  'APPROVAL_PENDING',
  'APPROVED',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
  'REJECTED',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedState, setSelectedState] = useState<OrderState>('APPROVAL_PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .getByState(selectedState, page, 20)
      .then((res) => {
        const paged = res.data.data;
        setOrders(paged.content);
        setTotalPages(paged.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedState, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">All Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Browse orders by state.</p>

      {/* State filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {ALL_STATES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSelectedState(s);
              setPage(0);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selectedState === s
                ? 'bg-[#ff6b35] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No orders in this state.</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Consumer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {order.consumerName ?? order.consumerId.slice(0, 8)}
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
