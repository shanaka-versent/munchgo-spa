import { test, expect } from '@playwright/test';
import { generateUser, registerUser, login, logout } from './helpers/auth';

test.describe('Role-Based Dashboard Routing', () => {
  test('customer redirected to customer dashboard after login', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // SPA auto-redirects to /customer/dashboard after registration
    await expect(page).toHaveURL(/\/customer\/dashboard/);

    // Dashboard should show welcome message
    await expect(page.getByText(/Dashboard|Welcome/i)).toBeVisible({ timeout: 10_000 });
  });

  test('restaurant owner sees restaurant nav link', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await registerUser(page, user);

    // Navbar should show Restaurant link
    await expect(page.getByRole('link', { name: 'Restaurant' })).toBeVisible();
  });

  test('courier sees deliveries nav link', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await registerUser(page, user);

    // Navbar should show Deliveries link
    await expect(page.getByRole('link', { name: 'Deliveries' })).toBeVisible();
  });

  test('restaurant owner can access restaurant dashboard', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await registerUser(page, user);

    await page.goto('/restaurant/dashboard');
    await expect(page.getByText('Restaurant Dashboard')).toBeVisible({ timeout: 10_000 });
  });

  test('courier can access courier dashboard', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await registerUser(page, user);

    await page.goto('/courier/dashboard');
    await expect(page.getByText('Courier Dashboard')).toBeVisible({ timeout: 10_000 });
  });
});
