import { test, expect } from '@playwright/test';
import { generateUser, registerUser } from '../helpers/auth';

test.describe('Login and Logout Journey', () => {
  test('login, view dashboard, and logout', async ({ page }) => {
    // Register a user first
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
    await page.waitForTimeout(1_000);

    // Login again
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await expect(page.getByText(/Welcome/)).toBeVisible();
    await page.waitForTimeout(1_500);

    // View dashboard stats
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Active Orders')).toBeVisible();
    await page.waitForTimeout(1_000);

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
    await page.waitForTimeout(1_500);
  });
});
