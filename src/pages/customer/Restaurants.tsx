import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import Spinner from '../../components/Spinner';
import type { Restaurant } from '../../types';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantsApi
      .getAll()
      .then((res) => setRestaurants(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Browse Restaurants</h1>
      <p className="mt-1 text-sm text-gray-500">
        Choose a restaurant and explore their menu.
      </p>

      {restaurants.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No restaurants available yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Colour bar */}
              <div className="h-2 rounded-t-xl bg-gradient-to-r from-[#ff6b35] to-[#004e89]" />

              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-[#1a1a2e]">{r.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {r.address
                    ? `${r.address.street1}, ${r.address.city}, ${r.address.state}`
                    : 'Address not available'}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {r.menuItems?.length ?? 0} menu item{(r.menuItems?.length ?? 0) !== 1 ? 's' : ''}
                </p>

                <div className="mt-auto pt-4">
                  <Link
                    to={`/customer/restaurants/${r.id}/menu`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e55a2b]"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
