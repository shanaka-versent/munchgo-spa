import { test, expect } from '@playwright/test';
import { generateUser } from '../helpers/auth';

test.describe('2. Customer Journey — Register, Browse & Order', () => {
  test('register as customer, browse menu, and place an order', async ({ page }) => {
    test.setTimeout(90_000);
    const user = generateUser('ROLE_CUSTOMER');

    // --- Registration ---
    await page.goto('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
    await page.waitForTimeout(1_500);

    // Customer tab is selected by default
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

    // Submit registration
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(2_000);

    // --- Customer Dashboard ---
    await expect(page.getByText(/Welcome/)).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Active Orders')).toBeVisible();
    await page.waitForTimeout(2_000);

    // --- Browse Restaurants ---
    await page.getByRole('link', { name: 'Browse Restaurants' }).first().click();
    await expect(page.getByRole('heading', { name: 'Browse Restaurants' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Menu' }).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2_000);

    // --- View Menu ---
    await page.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_500);

    // Add items to cart
    await page.locator('input[type="number"]').first().fill('2');
    await page.waitForTimeout(500);

    // Order total visible
    await expect(page.getByText('Order Total:')).toBeVisible();
    await page.waitForTimeout(1_000);

    // Scroll to delivery address section
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1_000);

    // --- Fill Delivery Address ---
    await expect(page.getByText('Delivery Address')).toBeVisible();
    await page.locator('#street1').fill('123 Main Street');
    await page.waitForTimeout(400);
    await page.locator('#city').fill('Melbourne');
    await page.waitForTimeout(400);
    await page.locator('#state').fill('VIC');
    await page.waitForTimeout(400);
    await page.locator('#zip').fill('3000');
    await page.waitForTimeout(1_500);

    // --- Place Order ---
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page).toHaveURL(/\/customer\/orders/, { timeout: 15_000 });
    await page.waitForTimeout(3_000);

    // --- Logout ---
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
    await page.waitForTimeout(2_000);
  });
});
