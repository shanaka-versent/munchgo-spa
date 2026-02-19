import { test, expect } from '@playwright/test';

test.describe('Browse Restaurants and Menu (Public)', () => {
  test('display home page with branding and hero elements', async ({ page }) => {
    await page.goto('/');

    // MunchGo branding in navbar
    await expect(page.getByRole('link', { name: /MunchGo/ })).toBeVisible();

    // Hero section
    await expect(page.getByRole('link', { name: 'Browse Restaurants' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' }).first()).toBeVisible();

    // Feature cards (SPA equivalent of monolith feature section)
    await expect(page.getByText('Fast Delivery')).toBeVisible();
    await expect(page.getByText('Live Tracking')).toBeVisible();
    await expect(page.getByText('Secure Payments')).toBeVisible();

    // Footer
    await expect(page.getByText(/MunchGo. All rights reserved/)).toBeVisible();
  });

  test('navbar shows correct links for unauthenticated user', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Public navbar links
    await expect(page.getByRole('link', { name: 'Restaurants', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' }).first()).toBeVisible();

    // Authenticated-only links should NOT be visible
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders', exact: true })).not.toBeVisible();
  });

  test('browse restaurants without login', async ({ page }) => {
    // Clear any session (must navigate first to avoid SecurityError on about:blank)
    await page.goto('/customer/restaurants');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Page heading
    await expect(page.getByText('Browse Restaurants')).toBeVisible();

    // Seed restaurant should be visible
    await expect(page.getByText('MunchGo Burger Palace')).toBeVisible({ timeout: 10_000 });

    // View Menu button should exist
    await expect(page.getByRole('link', { name: 'View Menu' }).first()).toBeVisible();

    // Restaurant cards should show address and menu item count
    await expect(page.getByText(/menu item/)).toBeVisible();
  });

  test('view restaurant menu items with correct table columns', async ({ page }) => {
    await page.goto('/customer/restaurants');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Click first View Menu link
    await page.getByRole('link', { name: 'View Menu' }).first().click();

    // Should be on menu page
    await expect(page).toHaveURL(/\/customer\/restaurants\/.*\/menu/);

    // Restaurant name heading
    await expect(page.getByText('MunchGo Burger Palace')).toBeVisible({ timeout: 10_000 });

    // Menu table columns (monolith: Item, Price, Quantity; SPA: Item, Description, Price, Quantity)
    const menuHeaders = page.locator('thead th');
    await expect(menuHeaders.filter({ hasText: 'Item' })).toBeVisible();
    await expect(menuHeaders.filter({ hasText: 'Price' })).toBeVisible();
    await expect(menuHeaders.filter({ hasText: 'Quantity' })).toBeVisible();

    // Menu items from seed data should be visible
    await expect(page.getByText('Classic Burger')).toBeVisible();

    // Quantity input fields should exist
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test('show prices on menu', async ({ page }) => {
    await page.goto('/customer/restaurants');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: 'View Menu' }).first().click();

    // Prices should be displayed (e.g., $9.99)
    await expect(page.getByText('$9.99')).toBeVisible({ timeout: 10_000 });
  });

  test('guest user sees login prompt when adding items to cart', async ({ page }) => {
    await page.goto('/customer/restaurants');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: 'View Menu' }).first().click();

    // Add item to cart
    const qtyInput = page.locator('input[type="number"]').first();
    await qtyInput.fill('2');

    // Should show "Sign in to place your order" prompt
    await expect(page.getByText('Sign in to place your order')).toBeVisible();

    // Guest prompt should have Sign In and Create Account buttons (scope to prompt area to avoid navbar collision)
    const guestPrompt = page.locator('.bg-amber-50');
    await expect(guestPrompt.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(guestPrompt.getByRole('link', { name: 'Create Account' })).toBeVisible();

    // Order Total should be visible
    await expect(page.getByText('Order Total:')).toBeVisible();

    // Delivery address form should NOT be visible for guest users
    await expect(page.locator('#street1')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Place Order' })).not.toBeVisible();
  });

  test('authenticated user sees delivery address form on menu', async ({ page }) => {
    // Register and login
    const { generateUser, registerUser } = await import('./helpers/auth');
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    await page.goto('/customer/restaurants');
    await page.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });

    // Delivery address section should be visible for authenticated users
    await expect(page.getByText('Delivery Address')).toBeVisible();

    // All address fields present (matching monolith: street1, street2, city, state, zip)
    await expect(page.locator('#street1')).toBeVisible();
    await expect(page.locator('#street2')).toBeVisible();
    await expect(page.locator('#city')).toBeVisible();
    await expect(page.locator('#state')).toBeVisible();
    await expect(page.locator('#zip')).toBeVisible();

    // Address field labels (use exact match to avoid matching "Street Address 2 (optional)")
    await expect(page.getByText('Street Address', { exact: true })).toBeVisible();
    await expect(page.getByText('City', { exact: true })).toBeVisible();
    await expect(page.getByText('State', { exact: true })).toBeVisible();
    await expect(page.getByText('ZIP', { exact: true })).toBeVisible();

    // Place Order button should be visible
    await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible();
  });
});
