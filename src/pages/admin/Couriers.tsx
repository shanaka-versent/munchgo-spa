import { useEffect, useState } from 'react';
import { couriersApi } from '../../api/couriers';
import Spinner from '../../components/Spinner';
import type { Courier } from '../../types';

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    couriersApi
      .getAll()
      .then((res) => setCouriers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Couriers</h1>
      <p className="mt-1 text-sm text-gray-500">
        All registered couriers ({couriers.length}).
      </p>

      {couriers.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No couriers found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">First Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Last Name</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {couriers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                    {c.id.slice(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{c.firstName}</td>
                  <td className="whitespace-nowrap px-4 py-3">{c.lastName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {c.available ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        No
                      </span>
                    )}
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
