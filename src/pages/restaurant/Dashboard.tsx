import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ordersApi } from '../../api/orders';
import Spinner from '../../components/Spinner';
import type { Order, OrderState } from '../../types';

const WORKFLOW_STATES: {
  state: OrderState;
  label: string;
  action: string;
  handler: (orderId: string) => Promise<unknown>;
}[] = [
  {
    state: 'APPROVAL_PENDING',
    label: 'Pending Approval',
    action: 'Approve',
    handler: (id) => ordersApi.approve(id, ''),
  },
  {
    state: 'APPROVED',
    label: 'Approved',
    action: 'Accept',
    handler: (id) => ordersApi.accept(id, new Date(Date.now() + 30 * 60000).toISOString()),
  },
  {
    state: 'ACCEPTED',
    label: 'Accepted',
    action: 'Start Preparing',
    handler: (id) => ordersApi.markPreparing(id),
  },
  {
    state: 'PREPARING',
    label: 'Preparing',
    action: 'Ready for Pickup',
    handler: (id) => ordersApi.markReadyForPickup(id),
  },
  {
    state: 'READY_FOR_PICKUP',
    label: 'Ready for Pickup',
    action: '',
    handler: () => Promise.resolve(),
  },
];

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [ordersByState, setOrdersByState] = useState<Record<string, Order[]>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // For MVP: Use a hardcoded restaurantId or extract from user profile
  // In production this would come from the user's linked restaurant
  const restaurantId = user?.userId; // Placeholder – replace with actual restaurant linkage

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await ordersApi.getByRestaurant(restaurantId, 0, 100);
      const allOrders = res.data.data.content;

      const grouped: Record<string, Order[]> = {};
      for (const ws of WORKFLOW_STATES) {
        grouped[ws.state] = allOrders.filter((o) => o.state === ws.state);
      }
      setOrdersByState(grouped);
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleAction(orderId: string, handler: (id: string) => Promise<unknown>) {
    setActionLoading(orderId);
    try {
      await handler(orderId);
      await fetchOrders();
    } catch {
      /* handled by interceptor */
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Restaurant Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage incoming orders and track their progress.
      </p>

      <div className="mt-8 space-y-10">
        {WORKFLOW_STATES.map((ws) => {
          const orders = ordersByState[ws.state] ?? [];
          return (
            <section key={ws.state}>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-[#1a1a2e]">{ws.label}</h2>
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-700">
                  {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">No orders in this state.</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                        {ws.action && (
                          <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-[#004e89]">
                            {order.id.slice(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {order.lineItems
                              .map((li) => `${li.name} x${li.quantity}`)
                              .join(', ')}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            ${order.total?.amount?.toFixed(2) ?? '0.00'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                            {order.timestamps?.createdAt
                              ? new Date(order.timestamps.createdAt).toLocaleString()
                              : '---'}
                          </td>
                          {ws.action && (
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              <button
                                onClick={() => handleAction(order.id, ws.handler)}
                                disabled={actionLoading === order.id}
                                className="inline-flex items-center rounded-lg bg-[#ff6b35] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#e55a2b] disabled:opacity-50"
                              >
                                {actionLoading === order.id ? 'Processing...' : ws.action}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
