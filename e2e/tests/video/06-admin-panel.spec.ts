import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

const ADMIN_EMAIL = 'admin@munchgo.com';
const ADMIN_PASSWORD = 'Admin@123';

test.describe('Admin Panel Journey', () => {
  test('admin dashboard and data tables', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Admin dashboard
    await page.goto('/admin');
    await expect(page.getByText('Admin Dashboard')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Consumers').first()).toBeVisible();
    await expect(page.getByText('Restaurants').first()).toBeVisible();
    await expect(page.getByText('Orders').first()).toBeVisible();
    await expect(page.getByText('Couriers').first()).toBeVisible();
    await page.waitForTimeout(2_000);

    // Consumers table
    await page.goto('/admin/consumers');
    await expect(page.locator('thead th').filter({ hasText: 'First Name' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_500);

    // Restaurants table
    await page.goto('/admin/restaurants');
    await expect(page.locator('thead th').filter({ hasText: 'Name' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_500);

    // Orders table
    await page.goto('/admin/orders');
    await expect(page.locator('thead th').filter({ hasText: 'Status' }).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_500);

    // Couriers table
    await page.goto('/admin/couriers');
    await expect(page.locator('thead th').filter({ hasText: 'Available' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);
  });
});
