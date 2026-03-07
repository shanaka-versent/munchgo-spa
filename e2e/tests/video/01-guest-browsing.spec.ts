import { test, expect } from '@playwright/test';

test.describe('Guest Browsing Journey', () => {
  test('browse home, restaurants, and menu as guest', async ({ page }) => {
    // Home page
    await page.goto('/');
    await expect(page.locator('h1').filter({ hasText: /MunchGo/ })).toBeVisible();
    await page.waitForTimeout(1_500);

    // Browse Restaurants page
    await page.getByRole('link', { name: 'Browse Restaurants' }).first().click();
    await expect(page.getByText('Browse Restaurants')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Menu' }).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_500);

    // View restaurant menu
    await page.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(page).toHaveURL(/\/customer\/restaurants\/.*\/menu/);
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);

    // Add item to cart (shows guest login prompt)
    await page.locator('input[type="number"]').first().fill('2');
    await expect(page.getByText('Sign in to place your order')).toBeVisible();
    await page.waitForTimeout(2_000);
  });
});
