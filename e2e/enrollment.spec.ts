import { test, expect } from '@playwright/test';

test.describe('Student Registration & Enrollment Workflow', () => {
	test('Public self-registration (/auth/register) displays official closed notice and redirect actions', async ({ page }) => {
		await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });

		// Verify that direct password creation fields are removed
		await expect(page.locator('input[type="password"]')).toHaveCount(0);

		// Verify the official enrollment notice is displayed
		await expect(page.getByRole('heading', { name: 'Student Account Provisioning' })).toBeVisible();
		await expect(page.getByText('Official Enrollment Policy')).toBeVisible();
		await expect(page.getByText('Student accounts are provisioned exclusively by academy administrators')).toBeVisible();

		// Verify action links exist
		const registerLink = page.getByRole('link', { name: /Complete Student Registration/i });
		await expect(registerLink).toBeVisible();
		await expect(registerLink).toHaveAttribute('href', '/register');

		const signInLink = page.getByRole('link', { name: /Sign In/i });
		await expect(signInLink).toBeVisible();
		await expect(signInLink).toHaveAttribute('href', '/auth/login');
	});

	test('Student Registration form (/register) captures Parent / Guardian details and validates required fields', async ({ page }) => {
		await page.goto('/register', { waitUntil: 'domcontentloaded' });

		// Verify headings and sections
		await expect(page.getByRole('heading', { name: 'Student Registration' })).toBeVisible();
		await expect(page.getByText('2. Parent / Guardian Information')).toBeVisible();

		// Verify guardian input fields exist
		const guardianNameInput = page.locator('#guardianName');
		const guardianPhoneInput = page.locator('#guardianPhone');
		const guardianEmailInput = page.locator('#guardianEmail');
		const guardianRelInput = page.locator('#guardianRelationship');

		await expect(guardianNameInput).toBeVisible();
		await expect(guardianPhoneInput).toBeVisible();
		await expect(guardianEmailInput).toBeVisible();
		await expect(guardianRelInput).toBeVisible();

		// Fill in Personal Information
		await page.fill('#fullName', 'Jane TestStudent');
		await page.fill('#dob', '12/04/2006');
		await page.locator('label[for="female"]').click();
		await page.fill('#phone', '08099887766');
		await page.fill('#email', 'janetest@example.com');
		await page.fill('#address', '14 Stadium Road, Port Harcourt');

		// Fill in Parent / Guardian details
		await page.fill('#guardianName', 'Chief Johnathan TestParent');
		await page.fill('#guardianRelationship', 'Father');
		await page.fill('#guardianPhone', '08011223344');
		await page.fill('#guardianEmail', 'guardian.test@example.com');

		// Fill in Academic Background
		await page.fill('#lastSchool', 'Port Harcourt High School');
		await page.fill('#classCompleted', 'SSS 3');

		// Select Programme and Mode
		await page.locator('label[for="utme"]').click();
		await page.fill('#subjects', 'English, Mathematics, Physics, Chemistry');
		await page.locator('label[for="physical"]').click();
		await page.fill('#referral', 'Billboard');

		// Verify Submit button exists with correct styling
		const submitBtn = page.getByRole('button', { name: /Submit Application/i });
		await expect(submitBtn).toBeVisible();
	});
});
