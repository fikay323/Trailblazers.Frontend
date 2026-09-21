import { test, expect } from '@playwright/test';

test.describe('Platform Baseline Smoke Tests', () => {
  test('Home page loads successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Trailblazer/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('About page renders cleanly', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('Programs page renders cleanly', async ({ page }) => {
    await page.goto('/programs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });

  test('Contact page renders cleanly', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Get in Touch/i })).toBeVisible();
  });

  test('Sign In page renders cleanly without demo buttons', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify demo fill buttons are NOT present
    await expect(page.locator('text=Demo Testing Accounts')).not.toBeVisible();
  });

  test('Student Registration form (/register) loads properly', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input#fullName')).toBeVisible();
    await expect(page.locator('input#phone')).toBeVisible();
  });

  test('JAMB CBT Exam Setup page (/exam) loads properly', async ({ page }) => {
    await page.goto('/exam', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });
});
