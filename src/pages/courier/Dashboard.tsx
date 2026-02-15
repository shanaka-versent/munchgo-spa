import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/useAuth';
import { ordersApi } from '../../api/orders';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import type { Order } from '../../types';

export default function CourierDashboard() {
  const { user } = useAuth();

  const [availablePickups, setAvailablePickups] = useState<Order[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [pickupsRes, deliveriesRes] = await Promise.all([
        ordersApi.getByState('READY_FOR_PICKUP', 0, 50),
        ordersApi.getByCourier(user.userId, 0, 50),
      ]);

      setAvailablePickups(pickupsRes.data.data.content);
      setActiveDeliveries(
        deliveriesRes.data.data.content.filter((o) => o.state === 'PICKED_UP'),
      );
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handlePickUp(orderId: string) {
    setActionLoading(orderId);
    try {
      await ordersApi.markPickedUp(orderId);
      await fetchData();
    } catch {
      /* handled by interceptor */
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelivered(orderId: string) {
    setActionLoading(orderId);
    try {
      await ordersApi.markDelivered(orderId);
      await fetchData();
    } catch {
      /* handled by interceptor */
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Courier Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        View available pickups and manage your active deliveries.
      </p>

      {/* Available Pickups */}
      <section className="mt-8">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Available Pickups</h2>
          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-orange-100 px-2 text-xs font-medium text-orange-700">
            {availablePickups.length}
          </span>
        </div>

        {availablePickups.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No orders ready for pickup right now.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Restaurant</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Delivery City</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {availablePickups.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#004e89]">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {order.restaurantName ?? '---'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {order.deliveryAddress?.city ?? '---'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => handlePickUp(order.id)}
                        disabled={actionLoading === order.id}
                        className="inline-flex items-center rounded-lg bg-[#ff6b35] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#e55a2b] disabled:opacity-50"
                      >
                        {actionLoading === order.id ? 'Processing...' : 'Pick Up'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* My Active Deliveries */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">My Active Deliveries</h2>
          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-cyan-100 px-2 text-xs font-medium text-cyan-700">
            {activeDeliveries.length}
          </span>
        </div>

        {activeDeliveries.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No active deliveries.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Delivery Address</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {activeDeliveries.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#004e89]">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge state={order.state} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.deliveryAddress
                        ? `${order.deliveryAddress.street1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}`
                        : '---'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelivered(order.id)}
                        disabled={actionLoading === order.id}
                        className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === order.id ? 'Processing...' : 'Mark Delivered'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
