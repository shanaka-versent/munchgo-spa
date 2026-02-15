import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import Spinner from '../../components/Spinner';
import type { Order } from '../../types';

export default function OrderDetail() {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    ordersApi
      .getById(orderId)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id, 'Cancelled by customer');
      // Refresh
      const res = await ordersApi.getById(order.id);
      setOrder(res.data.data);
    } catch {
      /* handled by interceptor */
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <Spinner />;
  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const canCancel = ['APPROVAL_PENDING', 'APPROVED'].includes(order.state);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-medium text-[#004e89] hover:underline"
      >
        &larr; Back to orders
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order info card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#1a1a2e]">
                  Order #{order.id.slice(0, 8)}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {order.restaurantName ?? 'Unknown Restaurant'}
                </p>
              </div>
              <StatusBadge state={order.state} />
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-gray-500">Total:</span>{' '}
                <span className="font-semibold">${order.total?.amount?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div>
                <span className="text-gray-500">Courier:</span>{' '}
                <span>{order.courierName ?? 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-[#1a1a2e]">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Item</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-500">Qty</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">Price</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {order.lineItems.map((li, idx) => (
                    <tr key={idx}>
                      <td className="whitespace-nowrap px-6 py-3">{li.name}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-center">{li.quantity}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        ${li.unitPrice.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        ${li.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery address */}
          {order.deliveryAddress && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[#1a1a2e]">Delivery Address</h2>
              <p className="mt-2 text-sm text-gray-600">
                {order.deliveryAddress.street1}
                {order.deliveryAddress.street2 && `, ${order.deliveryAddress.street2}`}
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
              </p>
            </div>
          )}

          {/* Cancel button */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {/* Sidebar: Timeline */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <OrderTimeline timestamps={order.timestamps} />
        </div>
      </div>
    </div>
  );
}
