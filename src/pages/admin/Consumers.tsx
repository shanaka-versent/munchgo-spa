import { useEffect, useState } from 'react';
import { consumersApi } from '../../api/consumers';
import Spinner from '../../components/Spinner';
import type { Consumer } from '../../types';

export default function AdminConsumers() {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consumersApi
      .getAll()
      .then((res) => setConsumers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Consumers</h1>
      <p className="mt-1 text-sm text-gray-500">
        All registered consumers ({consumers.length}).
      </p>

      {consumers.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">No consumers found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">First Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Last Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">City</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {consumers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                    {c.id.slice(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{c.firstName}</td>
                  <td className="whitespace-nowrap px-4 py-3">{c.lastName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{c.address?.city ?? '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
