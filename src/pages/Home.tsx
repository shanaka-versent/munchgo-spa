import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#004e89] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Welcome to MunchGo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Your favourite food, delivered fast.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/customer/restaurants"
              className="inline-flex items-center rounded-lg bg-[#ff6b35] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:ring-offset-2"
            >
              Browse Restaurants
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Order Food */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md text-center">
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Order Food</h3>
              <p className="mt-2 text-sm text-gray-600">
                Browse restaurants and order your favourite meals.
              </p>
            </div>

            {/* Manage Restaurant */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md text-center">
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Manage Restaurant</h3>
              <p className="mt-2 text-sm text-gray-600">
                Accept orders and keep your kitchen running smoothly.
              </p>
            </div>

            {/* Deliver Orders */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md text-center">
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Deliver Orders</h3>
              <p className="mt-2 text-sm text-gray-600">
                Pick up and deliver food to hungry customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] py-8 text-center text-sm text-gray-400">
        &copy; 2024 MunchGo Food Delivery. All rights reserved.
      </footer>
    </div>
  );
}
