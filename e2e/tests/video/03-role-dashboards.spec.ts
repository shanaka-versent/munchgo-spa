import { test, expect } from '@playwright/test';
import { generateUser } from '../helpers/auth';

test.describe('3. Role-Based Dashboards — Restaurant Owner & Courier', () => {
  test('restaurant owner registration and dashboard', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');

    // --- Register as Restaurant Owner ---
    await page.goto('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
    await page.waitForTimeout(1_000);

    // Switch to Restaurant Owner tab
    await page.getByRole('button', { name: 'Restaurant Owner' }).click();
    await page.waitForTimeout(800);

    // Fill registration form
    await page.locator('#username').fill(user.username);
    await page.waitForTimeout(400);
    await page.locator('#reg-email').fill(user.email);
    await page.waitForTimeout(400);
    await page.locator('#reg-password').fill(user.password);
    await page.waitForTimeout(400);
    await page.locator('#ownerFirst').fill(user.firstName ?? '');
    await page.waitForTimeout(400);
    await page.locator('#ownerLast').fill(user.lastName ?? '');
    await page.waitForTimeout(1_000);

    // Submit
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(1_500);

    // --- Navigate to Restaurant Dashboard ---
    await page.getByRole('link', { name: 'Restaurant Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Restaurant Dashboard' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // Show all workflow state sections
    await expect(page.getByText('Pending Approval')).toBeVisible();
    await expect(page.getByText('Approved').first()).toBeVisible();
    await expect(page.getByText('Accepted').first()).toBeVisible();
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1_500);
    await expect(page.getByText('Preparing').first()).toBeVisible();
    await expect(page.getByText('Ready for Pickup').first()).toBeVisible();
    await page.waitForTimeout(2_000);

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
    await page.waitForTimeout(1_500);
  });

  test('courier registration and dashboard', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');

    // --- Register as Courier ---
    await page.goto('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
    await page.waitForTimeout(1_000);

    // Switch to Courier tab
    await page.getByRole('button', { name: 'Courier' }).click();
    await page.waitForTimeout(800);

    // Fill registration form
    await page.locator('#username').fill(user.username);
    await page.waitForTimeout(400);
    await page.locator('#reg-email').fill(user.email);
    await page.waitForTimeout(400);
    await page.locator('#reg-password').fill(user.password);
    await page.waitForTimeout(400);
    await page.locator('#firstName').fill(user.firstName ?? '');
    await page.waitForTimeout(400);
    await page.locator('#lastName').fill(user.lastName ?? '');
    await page.waitForTimeout(1_000);

    // Submit
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(1_500);

    // --- Navigate to Courier Dashboard ---
    await page.getByRole('link', { name: 'Courier Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Courier Dashboard' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // Show both sections
    await expect(page.getByRole('heading', { name: 'Available Pickups' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Active Deliveries' })).toBeVisible();
    await page.waitForTimeout(2_000);

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
    await page.waitForTimeout(1_500);
  });
});
