import { test, expect } from '@playwright/test';
import { generateUser, registerUser } from './helpers/auth';

test.describe('User Registration', () => {
  test('register new customer', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await page.goto('/register');

    // Customer tab is selected by default
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();

    await registerUser(page, user);

    // SPA auto-logs-in and redirects to dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test('register new restaurant owner', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');
    await page.goto('/register');

    // Click Restaurant Owner tab
    await page.getByRole('button', { name: 'Restaurant Owner' }).click();
    await page.waitForTimeout(200);

    // Owner-specific fields visible
    await expect(page.locator('#ownerFirst')).toBeVisible();
    await expect(page.locator('#ownerLast')).toBeVisible();
    await expect(page.locator('#restaurantId')).toBeVisible();

    await registerUser(page, user);
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test('register new courier', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');
    await page.goto('/register');

    // Click Courier tab
    await page.getByRole('button', { name: 'Courier' }).click();
    await page.waitForTimeout(200);

    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();

    await registerUser(page, user);
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test('duplicate email shows error', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');

    // Register first user
    await registerUser(page, user);

    // Clear localStorage and try to register with same email
    await page.evaluate(() => localStorage.clear());
    await page.goto('/register');

    const duplicate = generateUser('ROLE_CUSTOMER', { email: user.email });
    await page.locator('#username').fill(duplicate.username);
    await page.locator('#reg-email').fill(duplicate.email);
    await page.locator('#reg-password').fill(duplicate.password);
    if (duplicate.firstName) await page.locator('#firstName').fill(duplicate.firstName);
    if (duplicate.lastName) await page.locator('#lastName').fill(duplicate.lastName);

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show error message
    const errorBanner = page.locator('.bg-red-50');
    await expect(errorBanner).toBeVisible({ timeout: 5_000 });
  });

  test('toggle fields by role tab', async ({ page }) => {
    await page.goto('/register');

    // Customer (default) — shows firstName/lastName
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#restaurantId')).not.toBeVisible();

    // Switch to Restaurant Owner — shows ownerFirst/ownerLast + restaurantId
    await page.getByRole('button', { name: 'Restaurant Owner' }).click();
    await page.waitForTimeout(200);
    await expect(page.locator('#ownerFirst')).toBeVisible();
    await expect(page.locator('#restaurantId')).toBeVisible();
    await expect(page.locator('#firstName')).not.toBeVisible();

    // Switch to Courier — shows firstName/lastName
    await page.getByRole('button', { name: 'Courier' }).click();
    await page.waitForTimeout(200);
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#restaurantId')).not.toBeVisible();
  });
});
