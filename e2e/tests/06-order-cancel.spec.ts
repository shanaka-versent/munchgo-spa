import { test, expect } from '@playwright/test';
import { generateUser, registerUser, login } from './helpers/auth';

test.describe('Order Cancellation', () => {
  test('customer cancels approved order', async ({ browser }) => {
    test.setTimeout(60_000);

    // ── Setup: Register customer and restaurant owner ──
    const customer = generateUser('ROLE_CUSTOMER');
    const owner = generateUser('ROLE_RESTAURANT_OWNER');

    const custPage = await browser.newPage();
    await registerUser(custPage, customer);

    const ownerPage = await browser.newPage();
    await registerUser(ownerPage, owner);
    await ownerPage.close();

    // ── Customer places order ──
    await custPage.goto('/customer/restaurants');
    await custPage.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(custPage.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });

    await custPage.locator('input[type="number"]').first().fill('1');
    await custPage.locator('#street1').fill('123 Cancel St');
    await custPage.locator('#city').fill('CancelCity');
    await custPage.locator('#state').fill('CC');
    await custPage.locator('#zip').fill('11111');

    await custPage.getByRole('button', { name: 'Place Order' }).click();
    await expect(custPage).toHaveURL(/\/customer\/orders/, { timeout: 15_000 });
    await custPage.close();

    // ── Restaurant owner approves ──
    const restPage = await browser.newPage();
    await login(restPage, owner.email, owner.password);
    await restPage.goto('/restaurant/dashboard');

    const approveBtn = restPage.getByRole('button', { name: 'Approve' }).first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });
    await approveBtn.click();
    await restPage.waitForTimeout(1_000);
    await restPage.close();

    // ── Customer cancels the APPROVED order ──
    const cancelPage = await browser.newPage();
    await login(cancelPage, customer.email, customer.password);
    await cancelPage.goto('/customer/orders');
    await expect(cancelPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });

    // Click first order to view detail
    await cancelPage.locator('table tbody tr').first().click();
    await expect(cancelPage).toHaveURL(/\/customer\/orders\/.+/);

    // Cancel button should be visible for APPROVED orders
    const cancelBtn = cancelPage.getByRole('button', { name: 'Cancel Order' });
    await expect(cancelBtn).toBeVisible({ timeout: 5_000 });
    await cancelBtn.click();

    // Verify order shows CANCELLED
    await expect(cancelPage.getByText('CANCELLED')).toBeVisible({ timeout: 10_000 });

    await cancelPage.close();
  });
});
