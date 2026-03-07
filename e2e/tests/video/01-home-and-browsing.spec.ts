import { test, expect } from '@playwright/test';

test.describe('1. Home Page & Guest Browsing', () => {
  test('explore MunchGo as a guest visitor', async ({ page }) => {
    // --- Landing on the home page ---
    await page.goto('/');
    await expect(page.locator('h1').filter({ hasText: /MunchGo/ })).toBeVisible();
    await page.waitForTimeout(2_000);

    // Scroll down to see feature cards
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(2_000);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_500);

    // Back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1_000);

    // --- Navigate to Browse Restaurants ---
    const nav = page.getByRole('navigation');
    await nav.getByRole('link', { name: 'Browse Restaurants' }).click();
    await expect(page.getByRole('heading', { name: 'Browse Restaurants' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Menu' }).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // Scroll to see more restaurants
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1_500);

    // --- View a restaurant menu ---
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(page).toHaveURL(/\/customer\/restaurants\/.*\/menu/);
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // Scroll to see menu items and prices
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1_500);

    // --- Try adding an item as a guest ---
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('input[type="number"]').first().fill('2');
    await page.waitForTimeout(1_000);

    // Guest prompt appears: "Sign in to place your order"
    await expect(page.getByText('Sign in to place your order')).toBeVisible();
    await page.waitForTimeout(3_000);
  });
});
