import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

type RoleTab = 'ROLE_CUSTOMER' | 'ROLE_RESTAURANT_OWNER' | 'ROLE_COURIER';

const tabs: { value: RoleTab; label: string }[] = [
  { value: 'ROLE_CUSTOMER', label: 'Customer' },
  { value: 'ROLE_RESTAURANT_OWNER', label: 'Restaurant Owner' },
  { value: 'ROLE_COURIER', label: 'Courier' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<RoleTab>('ROLE_CUSTOMER');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        username,
        email,
        password,
        role,
        firstName,
        lastName,
      });
      navigate('/customer/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
        {/* Branding */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[#1a1a2e]">
            Munch<span className="text-[#ff6b35]">Go</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>

        {/* Role tabs */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setRole(t.value)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${
                role === t.value
                  ? 'bg-[#ff6b35] text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
              placeholder="Min 8 characters"
            />
          </div>

          {/* Role-specific fields */}
          {(role === 'ROLE_CUSTOMER' || role === 'ROLE_COURIER') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>
          )}

          {role === 'ROLE_RESTAURANT_OWNER' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ownerFirst" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="ownerFirst"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                  />
                </div>
                <div>
                  <label htmlFor="ownerLast" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="ownerLast"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700">
                  Restaurant ID
                </label>
                <input
                  id="restaurantId"
                  type="text"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  placeholder="Will be a dropdown in future"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#004e89] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
