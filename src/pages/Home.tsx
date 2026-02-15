import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#004e89] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Munch<span className="text-[#ff6b35]">Go</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Food delivery, reimagined
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
            Order from your favourite local restaurants and track your delivery in real time.
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
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-[#1a1a2e]">
            Why MunchGo?
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Fast Delivery */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff6b35]/10">
                <svg className="h-6 w-6 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a1a2e]">Fast Delivery</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get your meals delivered in minutes. Our optimised routing keeps your food hot and fresh.
              </p>
            </div>

            {/* Live Tracking */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#004e89]/10">
                <svg className="h-6 w-6 text-[#004e89]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a1a2e]">Live Tracking</h3>
              <p className="mt-2 text-sm text-gray-600">
                Follow your order from kitchen to doorstep with real-time status updates.
              </p>
            </div>

            {/* Secure Payments */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a1a2e]">Secure Payments</h3>
              <p className="mt-2 text-sm text-gray-600">
                Pay safely with encrypted transactions. Your payment details are always protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} MunchGo. All rights reserved.
      </footer>
    </div>
  );
}
