import { type Page } from '@playwright/test';

let counter = Date.now();

export function uniqueId(): string {
  return String(counter++);
}

export interface UserCredentials {
  username: string;
  email: string;
  password: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_RESTAURANT_OWNER' | 'ROLE_COURIER' | 'ROLE_ADMIN';
  firstName?: string;
  lastName?: string;
}

/**
 * Generate test user credentials for the given role.
 */
export function generateUser(
  role: UserCredentials['role'],
  overrides?: Partial<UserCredentials>,
): UserCredentials {
  const id = uniqueId();
  const roleShort = role.replace('ROLE_', '').toLowerCase();

  const base: UserCredentials = {
    username: `test_${roleShort}_${id}`,
    email: `test_${roleShort}_${id}@munchgo-test.com`,
    password: 'Test1234!',
    role,
  };

  if (role === 'ROLE_CUSTOMER' || role === 'ROLE_COURIER') {
    base.firstName = `First${id}`;
    base.lastName = `Last${id}`;
  }

  if (role === 'ROLE_RESTAURANT_OWNER') {
    base.firstName = `Owner${id}`;
    base.lastName = `Rest${id}`;
  }

  return { ...base, ...overrides };
}

/**
 * Role tab label mapping for the SPA register page.
 */
const ROLE_TAB_LABELS: Record<UserCredentials['role'], string> = {
  ROLE_CUSTOMER: 'Customer',
  ROLE_RESTAURANT_OWNER: 'Restaurant Owner',
  ROLE_COURIER: 'Courier',
  ROLE_ADMIN: 'Customer', // Admin doesn't register via UI
};

/**
 * Register a new user via the SPA register page.
 * Note: SPA auto-logs-in after registration and redirects to /customer/dashboard.
 */
export async function registerUser(page: Page, user: UserCredentials): Promise<void> {
  await page.goto('/register');

  // Click role tab
  await page.getByRole('button', { name: ROLE_TAB_LABELS[user.role] }).click();
  await page.waitForTimeout(200);

  // Common fields
  await page.locator('#username').fill(user.username);

  if (user.role === 'ROLE_RESTAURANT_OWNER') {
    await page.locator('#reg-email').fill(user.email);
    await page.locator('#reg-password').fill(user.password);
    await page.locator('#ownerFirst').fill(user.firstName ?? '');
    await page.locator('#ownerLast').fill(user.lastName ?? '');
  } else {
    await page.locator('#reg-email').fill(user.email);
    await page.locator('#reg-password').fill(user.password);
    if (user.firstName) await page.locator('#firstName').fill(user.firstName);
    if (user.lastName) await page.locator('#lastName').fill(user.lastName);
  }

  // Submit
  await page.getByRole('button', { name: 'Create Account' }).click();

  // SPA auto-logs-in and redirects
  await page.waitForURL(/\/customer\/dashboard/, { timeout: 20_000 });
}

/**
 * Login via the SPA login page (uses email, not username).
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/customer\/dashboard|\/restaurant\/dashboard|\/courier\/dashboard|\/admin/, {
    timeout: 20_000,
  });
}

/**
 * Logout via the navbar button.
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL(/\/login|\/$/, { timeout: 10_000 });
}

/**
 * Register a new user and stay logged in (SPA does this automatically).
 */
export async function registerAndLogin(page: Page, user: UserCredentials): Promise<void> {
  await registerUser(page, user);
  // SPA is already logged in after registration
}
