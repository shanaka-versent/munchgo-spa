import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { consumersApi } from '../../api/consumers';
import { restaurantsApi } from '../../api/restaurants';
import { ordersApi } from '../../api/orders';
import { couriersApi } from '../../api/couriers';
import Spinner from '../../components/Spinner';

interface Counts {
  consumers: number;
  restaurants: number;
  orders: number;
  couriers: number;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({
    consumers: 0,
    restaurants: 0,
    orders: 0,
    couriers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consumersApi.getAll(),
      restaurantsApi.getAll(),
      ordersApi.getByState('APPROVAL_PENDING', 0, 1),
      couriersApi.getAll(),
    ])
      .then(([consumersRes, restaurantsRes, ordersRes, couriersRes]) => {
        setCounts({
          consumers: consumersRes.data.data.length,
          restaurants: restaurantsRes.data.data.length,
          orders: ordersRes.data.data.totalElements,
          couriers: couriersRes.data.data.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const cards = [
    {
      label: 'Consumers',
      count: counts.consumers,
      link: '/admin/consumers',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Restaurants',
      count: counts.restaurants,
      link: '/admin/restaurants',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'Orders',
      count: counts.orders,
      link: '/admin/orders',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Couriers',
      count: counts.couriers,
      link: '/admin/couriers',
      color: 'bg-green-50 text-green-700',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">System-wide overview of MunchGo.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#1a1a2e]">{card.count}</p>
            <Link
              to={card.link}
              className={`mt-4 inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${card.color} transition hover:opacity-80`}
            >
              View All
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
