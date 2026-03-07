import { test, expect } from '@playwright/test';
import { generateUser, registerUser } from '../helpers/auth';

test.describe('Order Placement Journey', () => {
  test('register, browse menu, and place order', async ({ page }) => {
    // Register customer
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // Browse restaurants
    await page.goto('/customer/restaurants');
    await expect(page.getByRole('link', { name: 'View Menu' }).first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);

    // View menu
    await page.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(page).toHaveURL(/\/customer\/restaurants\/.*\/menu/);
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);

    // Add items to cart
    await page.locator('input[type="number"]').first().fill('2');
    await expect(page.getByText('Order Total:')).toBeVisible();
    await page.waitForTimeout(500);

    // Fill delivery address
    await page.locator('#street1').fill('456 Test Street');
    await page.locator('#city').fill('Springfield');
    await page.locator('#state').fill('IL');
    await page.locator('#zip').fill('62701');
    await page.waitForTimeout(1_000);

    // Place order
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page).toHaveURL(/\/customer\/orders/, { timeout: 15_000 });
    await page.waitForTimeout(2_000);

    // Poll for order to appear
    for (let attempt = 0; attempt < 6; attempt++) {
      const hasTable = await page.locator('table tbody tr').first().isVisible().catch(() => false);
      if (hasTable) break;
      await page.waitForTimeout(3_000);
      await page.reload();
    }
    await page.waitForTimeout(2_000);
  });
});
