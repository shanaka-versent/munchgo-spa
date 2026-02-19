import { test, expect } from '@playwright/test';
import { generateUser, registerUser } from './helpers/auth';

test.describe('Order Placement (Customer)', () => {
  /**
   * Helper: Navigate to restaurant menu, add items, fill delivery address, place order.
   */
  async function placeOrder(page: import('@playwright/test').Page) {
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

    // Page heading
    await expect(page.getByText('My Orders')).toBeVisible();

    // Orders table should have correct columns (matching monolith: Order #, Restaurant, Total, Status, Date)
    const headers = page.locator('thead th');
    await expect(headers.nth(0)).toContainText('Order #');
    await expect(headers.nth(1)).toContainText('Restaurant');
    await expect(headers.nth(2)).toContainText('Total');
    await expect(headers.nth(3)).toContainText('Status');
    await expect(headers.nth(4)).toContainText('Date');

    // Orders page should show at least one order
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });
  });

  test('view order details with all sections', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);
    await placeOrder(page);

    // Click first order row to view details
    await page.locator('table tbody tr').first().click();

    // Should be on order detail page
    await expect(page).toHaveURL(/\/customer\/orders\/.+/);

    // Order info should be visible
    await expect(page.getByText('Order #')).toBeVisible();

    // Status badge should be visible
    await expect(page.getByText(/APPROVAL_PENDING|APPROVED|ACCEPTED/)).toBeVisible();

    // Order Items section (matching monolith: Item, Qty, Price, Subtotal columns)
    await expect(page.getByText('Order Items')).toBeVisible();
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
    await expect(page.getByRole('button', { name: 'Cancel Order' })).toBeVisible({ timeout: 5_000 });

    // Back to orders link
    await expect(page.getByText('Back to orders')).toBeVisible();
  });
});
