import { test, expect } from '@playwright/test';
import { generateUser, registerUser, login, logout } from './helpers/auth';

test.describe('Login and Logout', () => {
  test('login page has correct form elements', async ({ page }) => {
    await page.goto('/login');

    // Branding
    await expect(page.getByText('MunchGo')).toBeVisible();
    await expect(page.getByText('Sign in to your account')).toBeVisible();

    // Form fields (SPA uses email-based login vs monolith username)
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // Field labels
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Register link
    await expect(page.getByText("Don't have an account?")).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create one' })).toBeVisible();
  });

  test('login with valid credentials', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // Logout first
    await logout(page);

    // Login again
    await login(page, user.email, user.password);
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('wrong@munchgo-test.com');
    await page.locator('#password').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error
    const errorBanner = page.locator('.bg-red-50');
    await expect(errorBanner).toBeVisible({ timeout: 5_000 });
  });

  test('logout successfully', async ({ page }) => {
    const user = generateUser('ROLE_CUSTOMER');
    await registerUser(page, user);

    // User is logged in — navbar should show Logout button
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // Navbar should show user email
    await expect(page.getByText(user.email)).toBeVisible();

    await logout(page);

    // Should be redirected to login or home
    await expect(page).toHaveURL(/\/login|\/$/);

    // Navbar should show Sign In link
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    // Clear any existing session
    await page.evaluate(() => localStorage.clear());

    await page.goto('/customer/dashboard');

    // RequireAuth should redirect to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
