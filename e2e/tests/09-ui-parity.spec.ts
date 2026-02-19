import { test, expect } from '@playwright/test';
import { generateUser, registerUser, login } from './helpers/auth';

/**
 * UI Parity Tests — Monolith vs SPA
 *
 * These tests verify that every key UI element from the monolith Thymeleaf
 * templates has an equivalent in the SPA React implementation.
 *
 * Known intentional differences (SPA modernization):
 * - Login uses email instead of username (Cognito)
 * - Register uses role tabs instead of dropdown
 * - SPA auto-logs-in after registration (no redirect to /login?registered)
 * - No "Remember me" checkbox (JWT-based auth)
 * - No admin/users page (users managed via Cognito, not DB)
 * - No dedicated 403 page (RequireAuth redirects to /login)
 * - Order cancel allowed for APPROVAL_PENDING + APPROVED (monolith: APPROVED only)
 * - SPA adds pagination on orders lists (monolith had none)
 * - SPA adds state filter pills on admin orders (monolith had none)
 */

test.describe('UI Parity: Login Page', () => {
  test('all login form elements present', async ({ page }) => {
    await page.goto('/login');

    // Heading
    await expect(page.getByText('Sign in to your account')).toBeVisible();

    // Email field with label (monolith had Username; SPA uses Email for Cognito)
    await expect(page.getByText('Email', { exact: true })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    await expect(page.locator('#email')).toHaveAttribute('required', '');

    // Password field with label
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    await expect(page.locator('#password')).toHaveAttribute('required', '');

    // Submit button
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Register link (monolith: "Register here", SPA: "Create one")
    await expect(page.getByRole('link', { name: 'Create one' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/register');
  });
});

test.describe('UI Parity: Register Page', () => {
  test('all register form elements present for customer', async ({ page }) => {
    await page.goto('/register');

    // Heading
    await expect(page.getByText('Create your account')).toBeVisible();

    // Role selector (monolith: dropdown; SPA: tabs)
    await expect(page.getByRole('button', { name: 'Customer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restaurant Owner' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Courier' })).toBeVisible();

    // Common fields (matching monolith: username, email, password)
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#username')).toHaveAttribute('required', '');
    await expect(page.locator('#reg-email')).toBeVisible();
    await expect(page.locator('#reg-password')).toBeVisible();

    // Customer-specific fields (matching monolith nameFields)
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();

    // Submit button (monolith: "Register"; SPA: "Create Account")
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

    // Login link (monolith: "Login here"; SPA: "Sign in")
    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute('href', '/login');
  });

  test('restaurant owner fields match monolith', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Restaurant Owner' }).click();
    await page.waitForTimeout(200);

    // Owner name fields (monolith shows firstName/lastName only for non-owners;
    // SPA uses ownerFirst/ownerLast for owners)
    await expect(page.locator('#ownerFirst')).toBeVisible();
    await expect(page.locator('#ownerLast')).toBeVisible();

    // Restaurant ID (monolith: dropdown <select>; SPA: text input for now)
    await expect(page.locator('#restaurantId')).toBeVisible();

    // Customer fields should be hidden
    await expect(page.locator('#firstName')).not.toBeVisible();
    await expect(page.locator('#lastName')).not.toBeVisible();
  });
});

test.describe('UI Parity: Navbar', () => {
  test('authenticated customer navbar links', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // Brand (monolith: "MunchGo" → /home; SPA: "MunchGo" → /)
    await expect(page.getByRole('link', { name: /MunchGo/ })).toBeVisible();

    // Browse link (monolith: "Browse Restaurants"; SPA: "Restaurants")
    await expect(page.getByRole('link', { name: 'Restaurants', exact: true })).toBeVisible();

    // Customer links (monolith: "My Dashboard", "My Orders"; SPA: "Dashboard", "Orders")
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders', exact: true })).toBeVisible();

    // User display (monolith shows username; SPA shows email)
    await expect(page.getByText(user.email)).toBeVisible();

    // Logout button (monolith: form button; SPA: onClick button — both say "Logout")
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('unauthenticated navbar links', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Login link (monolith: "Login"; SPA: "Sign In")
    await expect(page.getByRole('link', { name: 'Sign In', exact: true })).toBeVisible();

    // Register link (monolith: "Register"; SPA: "Get Started")
    await expect(page.getByRole('link', { name: 'Get Started' }).first()).toBeVisible();

    // Authenticated links should NOT be visible
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  });
});

test.describe('UI Parity: Home Page', () => {
  test('home page hero and feature sections', async ({ page }) => {
    await page.goto('/');

    // Hero title (monolith: "Welcome to MunchGo"; SPA: "MunchGo")
    await expect(page.locator('h1').filter({ hasText: /MunchGo/ })).toBeVisible();

    // CTA buttons (monolith: Browse Restaurants, Get Started, Login; SPA: Browse Restaurants, Get Started)
    await expect(page.getByRole('link', { name: 'Browse Restaurants' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' }).first()).toBeVisible();

    // Feature section (monolith: Order Food, Manage Restaurant, Deliver Orders;
    // SPA: Fast Delivery, Live Tracking, Secure Payments)
    // Both have 3 feature cards — content differs but concept matches
    await expect(page.getByText('Fast Delivery')).toBeVisible();
    await expect(page.getByText('Live Tracking')).toBeVisible();
    await expect(page.getByText('Secure Payments')).toBeVisible();
  });
});

test.describe('UI Parity: Customer Dashboard', () => {
  test('customer dashboard has all monolith-equivalent sections', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // Welcome message (monolith: "Welcome, {username}!"; SPA: "Welcome back, {firstName}")
    await expect(page.getByText(/Welcome/)).toBeVisible();

    // Stats cards (SPA enhancement — Total Orders + Active Orders)
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Active Orders')).toBeVisible();

    // Recent Orders section (matching monolith)
    await expect(page.getByText('Recent Orders')).toBeVisible();

    // Quick actions (matching monolith "Browse" + "View Orders" buttons)
    await expect(page.getByRole('link', { name: 'Browse Restaurants' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View All Orders' }).first()).toBeVisible();
  });
});

test.describe('UI Parity: Restaurant Dashboard', () => {
  test('restaurant dashboard has all workflow states', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await registerUser(page, user);

    await page.goto('/restaurant/dashboard');
    await expect(page.getByText('Restaurant Dashboard')).toBeVisible({ timeout: 10_000 });

    // All workflow states from monolith must be present
    await expect(page.getByText('Pending Approval')).toBeVisible();
    await expect(page.getByText('Approved').first()).toBeVisible();
    await expect(page.getByText('Accepted').first()).toBeVisible();
    await expect(page.getByText('Preparing').first()).toBeVisible();
    await expect(page.getByText('Ready for Pickup').first()).toBeVisible();

    // Count badges next to each section
    const countBadges = page.locator('.rounded-full');
    const badgeCount = await countBadges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(5);
  });
});

test.describe('UI Parity: Courier Dashboard', () => {
  test('courier dashboard has both sections from monolith', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await registerUser(page, user);

    await page.goto('/courier/dashboard');
    await expect(page.getByText('Courier Dashboard')).toBeVisible({ timeout: 10_000 });

    // Available Pickups section (matching monolith)
    await expect(page.getByText('Available Pickups')).toBeVisible();

    // Active Deliveries section (matching monolith "My Active Deliveries")
    await expect(page.getByText('My Active Deliveries')).toBeVisible();

    // Empty state messages (matching monolith)
    await expect(page.getByText(/No orders ready for pickup|No orders available/)).toBeVisible();
    await expect(page.getByText('No active deliveries')).toBeVisible();
  });
});

test.describe('UI Parity: Admin Pages', () => {
  const ADMIN_EMAIL = 'admin@munchgo.com';
  const ADMIN_PASSWORD = 'Admin123!';

  test('admin dashboard cards match monolith (minus Users)', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin');

    await expect(page.getByText('Admin Dashboard')).toBeVisible({ timeout: 10_000 });

    // Monolith has 5 cards: Consumers, Restaurants, Orders, Couriers, Users
    // SPA has 4 cards (Users managed via Cognito — intentional omission)
    await expect(page.getByText('Consumers').first()).toBeVisible();
    await expect(page.getByText('Restaurants').first()).toBeVisible();
    await expect(page.getByText('Orders').first()).toBeVisible();
    await expect(page.getByText('Couriers').first()).toBeVisible();

    // Each card has count + "View All" link (matching monolith)
    const viewAllLinks = page.getByText('View All');
    expect(await viewAllLinks.count()).toBe(4);
  });

  test('admin consumers table columns match monolith', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/consumers');

    // Monolith columns: ID, First Name, Last Name, City
    // SPA columns: ID, First Name, Last Name, Email, City (Email is extra)
    const headers = page.locator('thead th');
    await expect(headers.filter({ hasText: 'ID' })).toBeVisible({ timeout: 10_000 });
    await expect(headers.filter({ hasText: 'First Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Last Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'City' })).toBeVisible();
  });

  test('admin restaurants table columns match monolith', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/restaurants');

    // Monolith columns: ID, Name, City, Menu Items (exact match)
    const headers = page.locator('thead th');
    await expect(headers.filter({ hasText: 'ID' })).toBeVisible({ timeout: 10_000 });
    await expect(headers.filter({ hasText: 'Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'City' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Menu Items' })).toBeVisible();
  });

  test('admin orders table columns match monolith', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/orders');

    // Monolith columns: ID, Consumer, Restaurant, Total, Status, Created
    // SPA columns: ID, Consumer, Restaurant, Total, Status, Date (same semantics)
    const headers = page.locator('thead th');
    await expect(headers.filter({ hasText: 'ID' }).first()).toBeVisible({ timeout: 10_000 });
    await expect(headers.filter({ hasText: 'Consumer' }).first()).toBeVisible();
    await expect(headers.filter({ hasText: 'Restaurant' }).first()).toBeVisible();
    await expect(headers.filter({ hasText: 'Total' }).first()).toBeVisible();
    await expect(headers.filter({ hasText: 'Status' }).first()).toBeVisible();
    await expect(headers.filter({ hasText: 'Date' }).first()).toBeVisible();
  });

  test('admin couriers table columns match monolith', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/couriers');

    // Monolith columns: ID, First Name, Last Name, Available (exact match)
    const headers = page.locator('thead th');
    await expect(headers.filter({ hasText: 'ID' })).toBeVisible({ timeout: 10_000 });
    await expect(headers.filter({ hasText: 'First Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Last Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Available' })).toBeVisible();

    // Available badges should show Yes/No (matching monolith badge-success/badge-danger)
    const badges = page.getByText(/^(Yes|No)$/);
    await expect(badges.first()).toBeVisible();
  });
});
