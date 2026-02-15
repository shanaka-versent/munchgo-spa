import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { restaurantsApi } from '../../api/restaurants';
import { sagasApi } from '../../api/sagas';
import Spinner from '../../components/Spinner';
import type { Restaurant, MenuItem } from '../../types';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function Menu() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());

  // Delivery address
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zip, setZip] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    restaurantsApi
      .getById(restaurantId)
      .then((res) => setRestaurant(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  function updateQty(item: MenuItem, qty: number) {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(item.menuItemId);
      } else {
        next.set(item.menuItemId, { menuItem: item, quantity: qty });
      }
      return next;
    });
  }

  function getQty(menuItemId: string): number {
    return cart.get(menuItemId)?.quantity ?? 0;
  }

  const orderTotal = Array.from(cart.values()).reduce(
    (sum, ci) => sum + ci.menuItem.price * ci.quantity,
    0,
  );

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (!user || !restaurantId || cart.size === 0) return;
    setError(null);
    setSubmitting(true);

    try {
      const lineItems = Array.from(cart.values()).map((ci) => ({
        menuItemId: ci.menuItem.menuItemId,
        name: ci.menuItem.name,
        quantity: ci.quantity,
        unitPrice: ci.menuItem.price,
      }));

      await sagasApi.createOrder({
        consumerId: user.userId,
        restaurantId,
        lineItems,
        deliveryAddress: {
          street1,
          street2: street2 || undefined,
          city,
          state: addrState,
          zip,
        },
      });

      navigate('/customer/orders');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;
  if (!restaurant) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Restaurant not found.</p>
      </div>
    );
  }

  const menuItems = restaurant.menuItems?.filter((mi) => mi.available) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Restaurant header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">{restaurant.name}</h1>
        {restaurant.address && (
          <p className="mt-1 text-sm text-gray-500">
            {restaurant.address.street1}, {restaurant.address.city}, {restaurant.address.state}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handlePlaceOrder}>
        {/* Menu items */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Item</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No menu items available.
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item.menuItemId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#1a1a2e]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.description ?? '---'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={getQty(item.menuItemId)}
                        onChange={(e) => updateQty(item, parseInt(e.target.value, 10) || 0)}
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Order total */}
        {cart.size > 0 && (
          <div className="mt-4 text-right text-lg font-semibold text-[#1a1a2e]">
            Order Total: <span className="text-[#ff6b35]">${orderTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Delivery address */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Delivery Address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="street1" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                id="street1"
                type="text"
                required
                value={street1}
                onChange={(e) => setStreet1(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="street2" className="block text-sm font-medium text-gray-700">
                Street Address 2 (optional)
              </label>
              <input
                id="street2"
                type="text"
                value={street2}
                onChange={(e) => setStreet2(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                  ZIP
                </label>
                <input
                  id="zip"
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Place order button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={submitting || cart.size === 0}
            className="inline-flex items-center rounded-lg bg-[#ff6b35] px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
