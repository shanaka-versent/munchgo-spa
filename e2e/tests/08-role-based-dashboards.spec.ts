import { test, expect } from '@playwright/test';
import { generateUser, registerUser, login, logout } from './helpers/auth';

test.describe('Role-Based Dashboard Routing', () => {
  test('customer redirected to customer dashboard after login', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // SPA auto-redirects to /customer/dashboard after registration
    await expect(page).toHaveURL(/\/customer\/dashboard/);

    // Dashboard should show welcome message (matching monolith "Welcome, {name}!")
    await expect(page.getByText(/Welcome/i)).toBeVisible({ timeout: 10_000 });

    // Customer dashboard elements (matching monolith: Browse card + Orders card)
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Active Orders')).toBeVisible();
    await expect(page.getByText('Recent Orders')).toBeVisible();

    // Quick action buttons (matching monolith "Browse" and "View Orders" buttons)
    await expect(page.getByRole('link', { name: 'Browse Restaurants' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View All Orders' }).first()).toBeVisible();
  });

  test('customer navbar shows correct links', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // Navbar should show customer-specific links (matching monolith: My Dashboard, My Orders)
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Restaurants' })).toBeVisible();

    // Should NOT show other role links
    await expect(page.getByRole('link', { name: 'Restaurant', exact: true })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Deliveries' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();

    // Logout button should be visible
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // User email should be displayed
    await expect(page.getByText(user.email)).toBeVisible();
  });

  test('restaurant owner sees restaurant nav link', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await registerUser(page, user);

    // Navbar should show Restaurant link (matching monolith "Restaurant Dashboard")
    await expect(page.getByRole('link', { name: 'Restaurant' })).toBeVisible();
  });

  test('courier sees deliveries nav link', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await registerUser(page, user);

    // Navbar should show Deliveries link (matching monolith "Courier Dashboard")
    await expect(page.getByRole('link', { name: 'Deliveries' })).toBeVisible();
  });

  test('restaurant owner can access restaurant dashboard with correct UI', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await registerUser(page, user);

    await page.goto('/restaurant/dashboard');
    await expect(page.getByText('Restaurant Dashboard')).toBeVisible({ timeout: 10_000 });

    // Workflow sections should be present (matching monolith order state sections)
    await expect(page.getByText('Pending Approval')).toBeVisible();
    await expect(page.getByText('Approved').first()).toBeVisible();
    await expect(page.getByText('Accepted').first()).toBeVisible();
    await expect(page.getByText('Preparing').first()).toBeVisible();
    await expect(page.getByText('Ready for Pickup').first()).toBeVisible();
  });

  test('courier can access courier dashboard with correct UI', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await registerUser(page, user);

    await page.goto('/courier/dashboard');
    await expect(page.getByText('Courier Dashboard')).toBeVisible({ timeout: 10_000 });

    // Dashboard sections should be present (matching monolith)
    await expect(page.getByText('Available Pickups')).toBeVisible();
    await expect(page.getByText('My Active Deliveries')).toBeVisible();

    // Empty state messages (matching monolith)
    await expect(page.getByText(/No orders ready for pickup|No orders available/)).toBeVisible();
    await expect(page.getByText('No active deliveries')).toBeVisible();
  });
});
