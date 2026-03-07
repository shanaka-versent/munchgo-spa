import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@munchgo.com';
const ADMIN_PASSWORD = 'Admin@123';

test.describe('4. Admin Panel — Dashboard & Data Management', () => {
  test('admin login, dashboard overview, and data tables', async ({ page }) => {
    test.setTimeout(90_000);
    // --- Login as Admin ---
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.waitForTimeout(1_000);

    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.waitForTimeout(400);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    await page.waitForTimeout(1_000);

    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/admin|\/customer\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(1_500);

    // --- Admin Dashboard ---
    await page.goto('/admin');
    await expect(page.getByText('Admin Dashboard')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // Show all 4 summary cards
    await expect(page.getByText('Consumers').first()).toBeVisible();
    await expect(page.getByText('Restaurants').first()).toBeVisible();
    await expect(page.getByText('Orders').first()).toBeVisible();
    await expect(page.getByText('Couriers').first()).toBeVisible();
    await page.waitForTimeout(2_000);

    // --- Consumers Table ---
    await page.goto('/admin/consumers');
    await expect(page.getByText(/consumers/i).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // Scroll to see data
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(1_500);

    // --- Restaurants Table ---
    await page.goto('/admin/restaurants');
    await expect(page.getByText(/restaurants/i).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(1_500);

    // --- Orders Table ---
    await page.goto('/admin/orders');
    await expect(page.getByText(/orders/i).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // --- Couriers Table ---
    await page.goto('/admin/couriers');
    await expect(page.getByText(/couriers/i).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // --- Logout ---
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
    await page.waitForTimeout(2_000);
  });
});
