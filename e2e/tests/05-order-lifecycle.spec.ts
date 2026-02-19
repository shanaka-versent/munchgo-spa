import { test, expect, type Browser } from '@playwright/test';
import { generateUser, registerUser, login } from './helpers/auth';

test.describe('Full Order Lifecycle', () => {
  test('complete order lifecycle across all roles', async ({ browser }) => {
    test.setTimeout(90_000);

    // ── 1. Setup: Register three users ──────────────────────────────

    const customer = generateUser('ROLE_CUSTOMER');
    const owner = generateUser('ROLE_RESTAURANT_OWNER');
    const courier = generateUser('ROLE_COURIER');

    // Register customer
    const custPage = await browser.newPage();
    await registerUser(custPage, customer);

    // Register restaurant owner
    const ownerPage = await browser.newPage();
    await registerUser(ownerPage, owner);
    await ownerPage.close();

    // Register courier
    const courPage = await browser.newPage();
    await registerUser(courPage, courier);
    await courPage.close();

    // ── 2. Customer places an order ─────────────────────────────────

    await custPage.goto('/customer/restaurants');
    await custPage.getByRole('link', { name: 'View Menu' }).first().click();
    await expect(custPage.locator('input[type="number"]').first()).toBeVisible({ timeout: 10_000 });

    // Add item
    await custPage.locator('input[type="number"]').first().fill('2');

    // Fill delivery address
    await custPage.locator('#street1').fill('999 Lifecycle Blvd');
    await custPage.locator('#city').fill('Springfield');
    await custPage.locator('#state').fill('IL');
    await custPage.locator('#zip').fill('62701');

    // Place order
    await custPage.getByRole('button', { name: 'Place Order' }).click();
    await expect(custPage).toHaveURL(/\/customer\/orders/, { timeout: 15_000 });

    // Get order ID from the first row
    await expect(custPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });
    await custPage.close();

    // ── 3. Restaurant Owner: Approve → Accept → Preparing → Ready ──

    const restPage = await browser.newPage();
    await login(restPage, owner.email, owner.password);
    await restPage.goto('/restaurant/dashboard');
    await expect(restPage.getByText('Restaurant Dashboard')).toBeVisible({ timeout: 10_000 });

    // Verify restaurant dashboard has correct workflow sections
    await expect(restPage.getByText('Pending Approval')).toBeVisible();

    // Restaurant dashboard table columns (matching monolith: Order #, Items, Total, Date, Action)
    const restHeaders = restPage.locator('thead th');
    await expect(restHeaders.filter({ hasText: 'Order #' }).first()).toBeVisible();
    await expect(restHeaders.filter({ hasText: 'Items' }).first()).toBeVisible();
    await expect(restHeaders.filter({ hasText: 'Total' }).first()).toBeVisible();

    // Approve order (matching monolith button text)
    const approveBtn = restPage.getByRole('button', { name: 'Approve' }).first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });
    await approveBtn.click();
    await restPage.waitForTimeout(1_000);

    // Accept order (matching monolith button text)
    const acceptBtn = restPage.getByRole('button', { name: 'Accept' }).first();
    await expect(acceptBtn).toBeVisible({ timeout: 10_000 });
    await acceptBtn.click();
    await restPage.waitForTimeout(1_000);

    // Start Preparing (matching monolith button text)
    const prepBtn = restPage.getByRole('button', { name: 'Start Preparing' }).first();
    await expect(prepBtn).toBeVisible({ timeout: 10_000 });
    await prepBtn.click();
    await restPage.waitForTimeout(1_000);

    // Ready for Pickup (matching monolith button text)
    const readyBtn = restPage.getByRole('button', { name: 'Ready for Pickup' }).first();
    await expect(readyBtn).toBeVisible({ timeout: 10_000 });
    await readyBtn.click();
    await restPage.waitForTimeout(1_000);

    await restPage.close();

    // ── 4. Courier: Pick Up → Mark Delivered ────────────────────────

    const delPage = await browser.newPage();
    await login(delPage, courier.email, courier.password);
    await delPage.goto('/courier/dashboard');
    await expect(delPage.getByText('Courier Dashboard')).toBeVisible({ timeout: 10_000 });

    // Verify courier dashboard sections (matching monolith)
    await expect(delPage.getByRole('heading', { name: 'Available Pickups' })).toBeVisible();

    // Courier pickups table columns (matching monolith: Order #, Restaurant, Delivery City/To)
    const pickupHeaders = delPage.locator('thead th');
    await expect(pickupHeaders.filter({ hasText: 'Order #' }).first()).toBeVisible();
    await expect(pickupHeaders.filter({ hasText: 'Restaurant' }).first()).toBeVisible();

    // Pick Up (matching monolith button text)
    const pickupBtn = delPage.getByRole('button', { name: 'Pick Up' }).first();
    await expect(pickupBtn).toBeVisible({ timeout: 10_000 });
    await pickupBtn.click();
    await delPage.waitForTimeout(1_000);

    // Verify active deliveries section appears
    await expect(delPage.getByRole('heading', { name: 'My Active Deliveries' })).toBeVisible();

    // Mark Delivered (matching monolith button text)
    const deliverBtn = delPage.getByRole('button', { name: 'Mark Delivered' }).first();
    await expect(deliverBtn).toBeVisible({ timeout: 10_000 });
    await deliverBtn.click();
    await delPage.waitForTimeout(1_000);

    await delPage.close();

    // ── 5. Customer: Verify DELIVERED status ────────────────────────

    const verifyPage = await browser.newPage();
    await login(verifyPage, customer.email, customer.password);
    await verifyPage.goto('/customer/orders');
    await expect(verifyPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 });

    // Click first order
    await verifyPage.locator('table tbody tr').first().click();
    await expect(verifyPage).toHaveURL(/\/customer\/orders\/.+/);

    // Status should show DELIVERED
    await expect(verifyPage.getByText('DELIVERED')).toBeVisible({ timeout: 10_000 });

    await verifyPage.close();
  });
});
