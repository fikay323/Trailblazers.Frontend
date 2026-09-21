import { test, expect } from '@playwright/test';

test.describe('Password Recovery Workflow (Forgot & Reset Password)', () => {
	test('Sign In page contains "Forgot password?" link that navigates to /auth/forgot-password', async ({ page }) => {
		await page.goto('/auth/login');
		await page.waitForLoadState('domcontentloaded');

		const forgotLink = page.getByRole('link', { name: /Forgot password\?/i });
		await expect(forgotLink).toBeVisible();
		await expect(forgotLink).toHaveAttribute('href', '/auth/forgot-password');

		await forgotLink.click();
		await expect(page).toHaveURL(/\/auth\/forgot-password/);
		await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
	});

	test('Forgot Password page submits request and displays confirmation message', async ({ page }) => {
		await page.route('**/api/auth/forgot-password', async (route) => {
			const req = route.request();
			const postData = JSON.parse(req.postData() || '{}');
			expect(postData.email).toBe('student@trailblazer.edu');

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'If an account exists with that email address, a password reset link has been dispatched.'
				})
			});
		});

		await page.goto('/auth/forgot-password');
		await page.waitForLoadState('domcontentloaded');

		// Verify elements
		await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
		const emailInput = page.locator('#forgot-email');
		await expect(emailInput).toBeVisible();

		// Fill email and submit
		await emailInput.click();
		await emailInput.pressSequentially('student@trailblazer.edu', { delay: 10 });
		const submitBtn = page.getByRole('button', { name: /Send Reset Link/i });
		await submitBtn.click();

		// Verify success confirmation card
		await expect(page.getByRole('heading', { name: 'Check Your Inbox' })).toBeVisible();
		await expect(page.getByText('If an account exists with that email address')).toBeVisible();
	});

	test('Reset Password page without token displays "Invalid Reset Link" alert and recovery action', async ({ page }) => {
		await page.goto('/auth/reset-password');
		await page.waitForLoadState('domcontentloaded');

		await expect(page.getByRole('heading', { name: 'Invalid Reset Link' })).toBeVisible();
		await expect(page.getByRole('link', { name: /Request New Reset Link/i })).toBeVisible();
	});

	test('Reset Password page with token validates matching passwords and completes reset', async ({ page }) => {
		await page.route('**/api/auth/reset-password', async (route) => {
			const req = route.request();
			const postData = JSON.parse(req.postData() || '{}');
			expect(postData.email).toBe('student@trailblazer.edu');
			expect(postData.token).toBe('valid-test-token');
			expect(postData.newPassword).toBe('NewSecurePass123!');

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Password has been reset successfully. You may now sign in with your new password.'
				})
			});
		});

		await page.goto('/auth/reset-password?token=valid-test-token&email=student%40trailblazer.edu');
		await page.waitForLoadState('domcontentloaded');

		// Verify form elements
		await expect(page.getByRole('heading', { name: 'Set New Password' })).toBeVisible();
		await expect(page.getByText('student@trailblazer.edu')).toBeVisible();

		const newPasswordInput = page.locator('#new-password');
		const confirmPasswordInput = page.locator('#confirm-password');

		// Fill mismatching passwords first
		await newPasswordInput.click();
		await newPasswordInput.pressSequentially('NewSecurePass123!', { delay: 10 });
		await confirmPasswordInput.click();
		await confirmPasswordInput.pressSequentially('DifferentPassword123!', { delay: 10 });
		await page.getByRole('button', { name: /Reset Password/i }).click();

		// Verify client validation error
		await expect(page.getByText('Passwords do not match')).toBeVisible();

		// Fix confirm password and submit
		await confirmPasswordInput.fill('');
		await confirmPasswordInput.pressSequentially('NewSecurePass123!', { delay: 10 });
		await page.getByRole('button', { name: /Reset Password/i }).click();

		// Verify success confirmation card
		await expect(page.getByRole('heading', { name: 'Password Reset Complete' })).toBeVisible();
		const signInBtn = page.getByRole('link', { name: /Sign In Now/i });
		await expect(signInBtn).toBeVisible();
		await expect(signInBtn).toHaveAttribute('href', '/auth/login');
	});
});
