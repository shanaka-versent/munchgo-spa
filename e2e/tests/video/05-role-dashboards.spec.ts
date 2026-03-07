import { test, expect } from '@playwright/test';
import { generateUser, registerUser } from '../helpers/auth';

test.describe('Role-Based Dashboard Journey', () => {
  test('customer dashboard', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    await expect(page.getByText(/Welcome/)).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Active Orders')).toBeVisible();
    await expect(page.getByText('Recent Orders')).toBeVisible();
    await page.waitForTimeout(2_000);
  });

  test('restaurant owner dashboard', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await registerUser(page, user);

    await page.goto('/restaurant/dashboard');
    await expect(page.getByText('Restaurant Dashboard')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Pending Approval')).toBeVisible();
    await expect(page.getByText('Approved').first()).toBeVisible();
    await expect(page.getByText('Accepted').first()).toBeVisible();
    await expect(page.getByText('Preparing').first()).toBeVisible();
    await expect(page.getByText('Ready for Pickup').first()).toBeVisible();
    await page.waitForTimeout(2_000);
  });

  test('courier dashboard', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await registerUser(page, user);

    await page.goto('/courier/dashboard');
    await expect(page.getByText('Courier Dashboard')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Available Pickups' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Active Deliveries' })).toBeVisible();
    await page.waitForTimeout(2_000);
  });
});
