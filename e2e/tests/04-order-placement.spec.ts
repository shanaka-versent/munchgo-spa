import { test, expect } from '@playwright/test';
import { generateUser, registerUser } from './helpers/auth';

test.describe('Order Placement (Customer)', () => {
  // Saga orchestration requires Kafka event propagation — increase timeout
  test.setTimeout(60_000);

  /**
   * Helper: Navigate to restaurant menu, add items, fill delivery address, place order.
   */
  async function placeOrder(page: import('@playwright/test').Page) {
    // Wait for Kafka consumer-events to propagate (registration → consumer-service auto-creates consumer)
    await page.waitForTimeout(3_000);
    await page.goto('/customer/restaurants');

    // Click first restaurant menu
    await page.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(page).toHaveURL(/\/customer\/restaurants\/.*\/menu/);

    // Wait for menu to load
    await expect(page.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });

    // Set quantity on first item
    await page.locator('input[type="number"]').first().fill('2');

    // Order total should appear
    await expect(page.getByText('Order Total:')).toBeVisible();

    // Fill delivery address
    await page.locator('#street1').fill('456 Test Street');
    await page.locator('#city').fill('Springfield');
    await page.locator('#state').fill('IL');
    await page.locator('#zip').fill('62701');

    // Place order via saga
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Should redirect to orders list
    await expect(page).toHaveURL(/\/customer\/orders/, { timeout: 15_000 });
  }

  test('place order from menu', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    await placeOrder(page);

    // Should be on orders page
    await expect(page).toHaveURL(/\/customer\/orders/);
  });

  test('order appears in orders list with correct table columns', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);
    await placeOrder(page);

    // Page heading (wait for spinner to clear after API load)
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible({ timeout: 10_000 });

    // Wait for saga to complete — poll with page reloads since the order list
    // is fetched on mount and the saga may not have completed yet
    for (let attempt = 0; attempt < 10; attempt++) {
      const hasTable = await page.locator('table tbody tr').first().isVisible().catch(() => false);
      if (hasTable) break;
      await page.waitForTimeout(3_000);
      await page.reload();
      await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible({ timeout: 10_000 });
    }
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });

    // Orders table should have correct columns (matching monolith: Order #, Restaurant, Total, Status, Ordered)
    const headers = page.locator('thead th');
    await expect(headers.nth(0)).toContainText('Order #');
    await expect(headers.nth(1)).toContainText('Restaurant');
    await expect(headers.nth(2)).toContainText('Total');
    await expect(headers.nth(3)).toContainText('Status');
    await expect(headers.nth(4)).toContainText('Ordered');
  });

  test('view order details with all sections', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);
    await placeOrder(page);

    // Wait for saga to complete — poll with page reloads
    for (let attempt = 0; attempt < 10; attempt++) {
      const hasTable = await page.locator('table tbody tr').first().isVisible().catch(() => false);
      if (hasTable) break;
      await page.waitForTimeout(3_000);
      await page.reload();
      await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible({ timeout: 10_000 });
    }
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });
    await page.locator('table tbody tr').first().click();

    // Should be on order detail page
    await expect(page).toHaveURL(/\/customer\/orders\/.+/);

    // Order info should be visible (wait for spinner to clear)
    await expect(page.getByText('Order #')).toBeVisible({ timeout: 10_000 });

    // Status badge should be visible
    await expect(page.getByText(/APPROVAL_PENDING|APPROVED|ACCEPTED/)).toBeVisible({ timeout: 10_000 });

    // Order Items section (matching monolith: Item, Qty, Price, Subtotal columns)
    await expect(page.getByText('Order Items')).toBeVisible({ timeout: 10_000 });
    const itemHeaders = page.locator('thead th');
    await expect(itemHeaders.filter({ hasText: 'Item' })).toBeVisible();
    await expect(itemHeaders.filter({ hasText: 'Qty' })).toBeVisible();
    await expect(itemHeaders.filter({ hasText: 'Price' })).toBeVisible();
    await expect(itemHeaders.filter({ hasText: 'Subtotal' })).toBeVisible();

    // Delivery address section (matching monolith)
    await expect(page.getByText('Delivery Address')).toBeVisible();
    await expect(page.getByText('456 Test Street')).toBeVisible();
    await expect(page.getByText(/Springfield/)).toBeVisible();

    // Cancel button should be visible for APPROVAL_PENDING/APPROVED orders
    await expect(page.getByRole('button', { name: 'Cancel Order' })).toBeVisible({ timeout: 10_000 });

    // Back to orders link
    await expect(page.getByText('Back to orders')).toBeVisible();
  });
});
