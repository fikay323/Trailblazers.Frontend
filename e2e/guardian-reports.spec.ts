import { test, expect } from '@playwright/test';

test.describe('Guardian Academic & Attendance Reports Workflow', () => {
	const setupAdminStudentSession = async (page: any) => {
		// Mock Admin Profile
		await page.route('**/api/auth/profile', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					id: 'admin-1',
					fullName: 'Lead Academy Admin',
					email: 'admin@trailblazers.com',
					role: 'Admin',
					isActive: true
				})
			});
		});

		// Mock Admin Students List
		await page.route('**/api/admin/students', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([
					{
						id: 'student-chidinma',
						fullName: 'Chidinma Okafor',
						email: 'chidinma@example.com',
						phoneNumber: '08099887766',
						isActive: true,
						disabledReason: null,
						totalTestsTaken: 4,
						averageScore: 78.5,
						createdAt: '2026-08-15T09:00:00Z'
					}
				])
			});
		});

		// Mock Student Exam History
		await page.route('**/api/admin/students/*/history', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					studentEmail: 'chidinma@example.com',
					totalTestsTaken: 4,
					averagePercentage: 78.5,
					highestPercentage: 86.0,
					attempts: [
						{
							sessionId: 'sess-1',
							targetYear: 2024,
							totalScore: 43,
							totalQuestions: 50,
							percentage: 86.0,
							completedAt: '2026-09-18T14:30:00Z',
							startTime: '2026-09-18T13:30:00Z'
						},
						{
							sessionId: 'sess-2',
							targetYear: 2023,
							totalScore: 36,
							totalQuestions: 50,
							percentage: 72.0,
							completedAt: '2026-09-12T11:00:00Z',
							startTime: '2026-09-12T10:00:00Z'
						}
					]
				})
			});
		});

		// Mock Guardian Report Preview API
		await page.route('**/api/admin/guardian-reports/preview?*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					studentName: 'Chidinma Okafor',
					studentEmail: 'chidinma@example.com',
					guardianName: 'Chief Emeka Okafor',
					guardianPhone: '08031234567',
					guardianEmail: 'emeka.okafor@example.com',
					guardianRelationship: 'Father',
					startDate: '2026-08-20T00:00:00Z',
					endDate: '2026-09-20T23:59:59Z',
					totalTestsTaken: 4,
					averagePercentage: 78.5,
					highestPercentage: 86.0,
					passRatePercentage: 100.0,
					attendancePresentDays: 18,
					attendanceLateDays: 1,
					attempts: [
						{
							sessionId: 'sess-1',
							targetYear: 2024,
							totalScore: 43,
							totalQuestions: 50,
							percentage: 86.0,
							completedAt: '2026-09-18T14:30:00Z'
						}
					]
				})
			});
		});

		// Mock Send Guardian Report API
		await page.route('**/api/admin/guardian-reports/send', async (route: any) => {
			const postData = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					message: `Academic performance report dispatched to ${postData.guardianName || 'Guardian'} via ${postData.channel}.`,
					emailSent: postData.channel === 'Email' || postData.channel === 'Both',
					smsSent: postData.channel === 'Sms' || postData.channel === 'Both',
					deliveredTo: postData.guardianEmail || postData.guardianPhone
				})
			});
		});

		// Initialize localStorage
		await page.addInitScript(() => {
			localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
			localStorage.setItem('auth_token', 'fake-admin-jwt');
			localStorage.setItem(
				'auth_user',
				JSON.stringify({
					id: 'admin-1',
					fullName: 'Lead Academy Admin',
					email: 'admin@trailblazers.com',
					role: 'Admin',
					isActive: true
				})
			);
		});
	};

	test('Admin can open Guardian Report Modal from table and dispatch report to guardian', async ({ page }) => {
		await setupAdminStudentSession(page);
		await page.goto('/admin/submissions?tab=students', { waitUntil: 'domcontentloaded' });

		// Verify student is listed
		await expect(page.getByText('Chidinma Okafor')).toBeVisible();

		// Click "Report" button in the table row
		const reportButton = page.getByRole('button', { name: /Report/i }).first();
		await expect(reportButton).toBeVisible();
		await reportButton.click();

		// Verify Guardian Academic Report Dispatch modal opens
		await expect(page.getByText('Guardian Academic Report Dispatch')).toBeVisible();
		await expect(page.getByText('Chief Emeka Okafor')).toHaveCount(0); // input holds the value

		// Verify prefilled guardian contact details
		const nameInput = page.locator('input[placeholder="e.g. Mr. John Doe"]');
		const emailInput = page.locator('input[type="email"]');
		const phoneInput = page.locator('input[type="tel"]');

		await expect(nameInput).toHaveValue('Chief Emeka Okafor');
		await expect(emailInput).toHaveValue('emeka.okafor@example.com');
		await expect(phoneInput).toHaveValue('08031234567');

		// Verify performance summary cards inside modal
		const modal = page.locator('div.fixed').filter({ hasText: 'Guardian Academic Report Dispatch' });
		await expect(modal.getByText('Tests', { exact: true })).toBeVisible();
		await expect(modal.getByText('78.5%')).toBeVisible();
		await expect(modal.getByText('86%')).toBeVisible();
		await expect(modal.getByText('100%')).toBeVisible();
		await expect(modal.getByText('18d present / 1d late')).toBeVisible();

		// Select Both (Email & SMS) channel
		const bothChannelBtn = page.getByRole('button', { name: /Both \(Email & SMS\)/i });
		await bothChannelBtn.click();

		// Add custom instructor remark
		const remarksArea = page.locator('#instructor-remarks');
		await remarksArea.fill('Outstanding progress in all CBT simulations this month. Keep up the dedication!');

		// Click "Send Report to Guardian"
		const sendBtn = page.getByRole('button', { name: /Send Report to Guardian/i });
		await expect(sendBtn).toBeEnabled();
		await sendBtn.click();

		// Verify success confirmation
		await expect(page.getByText('Report Dispatched Successfully')).toBeVisible();
		await expect(page.getByText(/dispatched to Chief Emeka Okafor via Both/i)).toBeVisible();

		// Close modal
		const doneBtn = page.getByRole('button', { name: 'Done' });
		await doneBtn.click();
		await expect(page.getByText('Guardian Academic Report Dispatch')).not.toBeVisible();
	});

	test('Admin can open Guardian Report Modal from within the Student History Modal', async ({ page }) => {
		await setupAdminStudentSession(page);
		await page.goto('/admin/submissions?tab=students', { waitUntil: 'domcontentloaded' });

		// Click "History" button in table row
		const historyBtn = page.getByRole('button', { name: /History/i }).first();
		await historyBtn.click();

		// Verify History modal is open
		await expect(page.getByText('Student Exam Performance History')).toBeVisible();
		await expect(page.getByText('2024 JAMB UTME Simulation')).toBeVisible();

		// Click "Send Guardian Report" from history modal footer
		const sendFromHistoryBtn = page.getByRole('button', { name: /Send Guardian Report/i });
		await expect(sendFromHistoryBtn).toBeVisible();
		await sendFromHistoryBtn.click();

		// Verify History modal closed and Guardian Report modal is open
		await expect(page.getByText('Guardian Academic Report Dispatch')).toBeVisible();
		await expect(page.getByText('Student Exam Performance History')).not.toBeVisible();

		// Verify recipient name is prefilled
		const nameInput = page.locator('input[placeholder="e.g. Mr. John Doe"]');
		await expect(nameInput).toHaveValue('Chief Emeka Okafor');

		// Cancel modal
		const cancelBtn = page.getByRole('button', { name: 'Cancel' });
		await cancelBtn.click();
		await expect(page.getByText('Guardian Academic Report Dispatch')).not.toBeVisible();
	});
});
