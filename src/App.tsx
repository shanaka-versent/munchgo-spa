import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import Restaurants from './pages/customer/Restaurants';
import Menu from './pages/customer/Menu';
import CustomerOrders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import CourierDashboard from './pages/courier/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminConsumers from './pages/admin/Consumers';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminOrders from './pages/admin/Orders';
import AdminCouriers from './pages/admin/Couriers';

/**
 * Top navigation bar shown on all pages.
 */
function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-extrabold text-[#1a1a2e]">
          Munch<span className="text-[#ff6b35]">Go</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Restaurants link always visible — guest browsing */}
          <Link to="/customer/restaurants" className="text-sm text-gray-600 hover:text-[#1a1a2e]">Restaurants</Link>

          {user ? (
            <>
              {user.roles?.includes('ROLE_CUSTOMER') && (
                <>
                  <Link to="/customer/dashboard" className="text-sm text-gray-600 hover:text-[#1a1a2e]">Dashboard</Link>
                  <Link to="/customer/orders" className="text-sm text-gray-600 hover:text-[#1a1a2e]">Orders</Link>
                </>
              )}
              {user.roles?.includes('ROLE_RESTAURANT_OWNER') && (
                <Link to="/restaurant/dashboard" className="text-sm text-gray-600 hover:text-[#1a1a2e]">Restaurant</Link>
              )}
              {user.roles?.includes('ROLE_COURIER') && (
                <Link to="/courier/dashboard" className="text-sm text-gray-600 hover:text-[#1a1a2e]">Deliveries</Link>
              )}
              {user.roles?.includes('ROLE_ADMIN') && (
                <Link to="/admin" className="text-sm text-gray-600 hover:text-[#1a1a2e]">Admin</Link>
              )}
              <span className="text-xs text-gray-400">{user.email}</span>
              <button
                onClick={() => void logout()}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-[#004e89] hover:underline">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e55a2b]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * Wrapper that requires authentication.
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer — restaurants & menus are public for guest browsing */}
        <Route path="/customer/dashboard" element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
        <Route path="/customer/restaurants" element={<Restaurants />} />
        <Route path="/customer/restaurants/:id/menu" element={<Menu />} />
        <Route path="/customer/orders" element={<RequireAuth><CustomerOrders /></RequireAuth>} />
        <Route path="/customer/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />

        {/* Restaurant */}
        <Route path="/restaurant/dashboard" element={<RequireAuth><RestaurantDashboard /></RequireAuth>} />

        {/* Courier */}
        <Route path="/courier/dashboard" element={<RequireAuth><CourierDashboard /></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/consumers" element={<RequireAuth><AdminConsumers /></RequireAuth>} />
        <Route path="/admin/restaurants" element={<RequireAuth><AdminRestaurants /></RequireAuth>} />
        <Route path="/admin/orders" element={<RequireAuth><AdminOrders /></RequireAuth>} />
        <Route path="/admin/couriers" element={<RequireAuth><AdminCouriers /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
