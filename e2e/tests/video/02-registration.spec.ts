import { test, expect } from '@playwright/test';
import { generateUser } from '../helpers/auth';

test.describe('User Registration Journey', () => {
  test('register as customer', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');

    await page.goto('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
    await page.waitForTimeout(1_000);

    // Customer tab is default
    await page.locator('#username').fill(user.username);
    await page.locator('#reg-email').fill(user.email);
    await page.locator('#reg-password').fill(user.password);
    await page.locator('#firstName').fill(user.firstName ?? '');
    await page.locator('#lastName').fill(user.lastName ?? '');
    await page.waitForTimeout(500);

    // Submit
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await expect(page.getByText(/Welcome/)).toBeVisible();
    await page.waitForTimeout(2_000);
  });

  test('register as restaurant owner', async ({ page }) => {
    const user = generateUser('ROLE_RESTAURANT_OWNER');

    await page.goto('/register');
    await page.getByRole('button', { name: 'Restaurant Owner' }).click();
    await page.waitForTimeout(500);

    await page.locator('#username').fill(user.username);
    await page.locator('#reg-email').fill(user.email);
    await page.locator('#reg-password').fill(user.password);
    await page.locator('#ownerFirst').fill(user.firstName ?? '');
    await page.locator('#ownerLast').fill(user.lastName ?? '');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(2_000);
  });

  test('register as courier', async ({ page }) => {
    const user = generateUser('ROLE_COURIER');

    await page.goto('/register');
    await page.getByRole('button', { name: 'Courier' }).click();
    await page.waitForTimeout(500);

    await page.locator('#username').fill(user.username);
    await page.locator('#reg-email').fill(user.email);
    await page.locator('#reg-password').fill(user.password);
    await page.locator('#firstName').fill(user.firstName ?? '');
    await page.locator('#lastName').fill(user.lastName ?? '');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(2_000);
  });
});
