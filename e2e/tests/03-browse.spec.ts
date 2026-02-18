import { test, expect } from '@playwright/test';

test.describe('Browse Restaurants and Menu (Public)', () => {
  test('display home page with branding', async ({ page }) => {
    await page.goto('/');

    // MunchGo branding in navbar
    await expect(page.getByRole('link', { name: /MunchGo/ })).toBeVisible();

    // Hero section
    await expect(page.getByRole('link', { name: 'Browse Restaurants' })).toBeVisible();
  });

  test('browse restaurants without login', async ({ page }) => {
    // Clear any session
    await page.evaluate(() => localStorage.clear());

    await page.goto('/customer/restaurants');

    // Seed restaurant should be visible
    await expect(page.getByText('MunchGo Burger Palace')).toBeVisible({ timeout: 10_000 });

    // View Menu button should exist
    await expect(page.getByRole('link', { name: 'View Menu' }).first()).toBeVisible();
  });

  test('view restaurant menu items', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/customer/restaurants');

    // Click first View Menu link
    await page.getByRole('link', { name: 'View Menu' }).first().click();

    // Should be on menu page
    await expect(page).toHaveURL(/\/customer\/restaurants\/.*\/menu/);

    // Menu items from seed data should be visible
    await expect(page.getByText('Classic Burger')).toBeVisible({ timeout: 10_000 });
  });

  test('show prices on menu', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/customer/restaurants');
    await page.getByRole('link', { name: 'View Menu' }).first().click();

    // Prices should be displayed (e.g., $9.99)
    await expect(page.getByText('$9.99')).toBeVisible({ timeout: 10_000 });
  });

  test('guest user sees login prompt when adding items to cart', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/customer/restaurants');
    await page.getByRole('link', { name: 'View Menu' }).first().click();

    // Add item to cart
    const qtyInput = page.locator('input[type="number"]').first();
    await qtyInput.fill('2');

    // Should show "Sign in to place your order" prompt
    await expect(page.getByText('Sign in to place your order')).toBeVisible();
  });
});
