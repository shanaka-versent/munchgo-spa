import { useEffect, useState } from 'react';
import { restaurantsApi } from '../../api/restaurants';
import Spinner from '../../components/Spinner';
import type { Restaurant } from '../../types';

export default function AdminRestaurants() {
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
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Restaurants</h1>
      <p className="mt-1 text-sm text-gray-500">
        All registered restaurants ({restaurants.length}).
      </p>

      {restaurants.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No restaurants found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">City</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Menu Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                    {r.id.slice(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#1a1a2e]">
                    {r.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {r.address?.city ?? '---'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {r.menuItems?.length ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
