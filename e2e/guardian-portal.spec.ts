import { test, expect } from '@playwright/test';

test.describe('Dedicated Guardian / Parent Portal Workflow', () => {
	const mockWardOverview = {
		studentName: 'Chidinma Okafor',
		studentEmail: 'chidinma@example.com',
		studentPhone: '08099887766',
		targetExam: 'JAMB/UTME',
		status: 'Enrolled & Active',
		enrolledAt: '2026-08-15T09:00:00Z',
		guardianName: 'Dr. Emeka Okafor',
		guardianRelationship: 'Father',
		guardianPhone: '08033221100',
		guardianEmail: 'emeka.okafor@example.com',
		totalExamsTaken: 4,
		averageScorePercentage: 78.5,
		highestScorePercentage: 86.0,
		passRatePercentage: 100.0,
		recentExams: [
			{
				sessionId: 'sess-101',
				targetYear: 2025,
				totalScore: 43,
				totalQuestions: 50,
				percentage: 86.0,
				passed: true,
				completedAt: '2026-09-18T14:30:00Z'
			},
			{
				sessionId: 'sess-102',
				targetYear: 2024,
				totalScore: 37,
				totalQuestions: 50,
				percentage: 74.0,
				passed: true,
				completedAt: '2026-09-12T10:15:00Z'
			}
		],
		totalAttendanceRecorded: 18,
		presentDays: 17,
		lateDays: 1,
		attendanceRatePercentage: 94.4,
		recentAttendance: [
			{
				id: 'att-1',
				date: '2026-09-20',
				clockInTime: '2026-09-20T07:48:00Z',
				clockOutTime: '2026-09-20T14:02:00Z',
				status: 'Present',
				remarks: 'On time'
			},
			{
				id: 'att-2',
				date: '2026-09-19',
				clockInTime: '2026-09-19T08:12:00Z',
				clockOutTime: '2026-09-19T14:00:00Z',
				status: 'Late',
				remarks: 'Traffic delay'
			}
		],
		announcements: [
			{
				id: 'ann-1',
				title: 'Mock Examination Schedule: Series 3',
				content: 'The 3rd Series of JAMB/UTME Mock Examinations will commence on Saturday, October 4th. Please ensure students arrive by 8:00 AM.',
				priority: 'MockExamSchedule',
				targetAudience: 'All',
				authorName: 'Academic Director',
				createdAt: '2026-09-21T10:00:00Z'
			},
			{
				id: 'ann-2',
				title: 'Parent-Teacher Consultations',
				content: 'Virtual consultations with subject tutors will take place this Thursday. Please submit any inquiries in advance via the portal.',
				priority: 'General',
				targetAudience: 'Guardians',
				authorName: 'Admissions Office',
				createdAt: '2026-09-19T12:00:00Z'
			}
		]
	};

	test.beforeEach(async ({ page }) => {
		// Mock Verify Access API
		await page.route('**/api/guardian/access', async (route) => {
			const postData = route.request().postDataJSON();
			if (postData?.studentEmail === 'chidinma@example.com' && (postData?.guardianContact === '08033221100' || postData?.guardianContact === 'emeka.okafor@example.com')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						message: 'Guardian access verified successfully.',
						accessToken: 'mock-guardian-token-chidinma',
						wardOverview: mockWardOverview
					})
				});
			} else {
				await route.fulfill({
					status: 400,
					contentType: 'application/json',
					body: JSON.stringify({
						error: 'The guardian contact provided does not match our records for this student.'
					})
				});
			}
		});

		// Mock Get Ward Overview API
		await page.route('**/api/guardian/ward-overview*', async (route) => {
			const url = new URL(route.request().url());
			const token = url.searchParams.get('token');
			if (token === 'mock-guardian-token-chidinma' || token === 'valid-test-guardian-token') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockWardOverview)
				});
			} else {
				await route.fulfill({
					status: 401,
					contentType: 'application/json',
					body: JSON.stringify({
						error: 'Session expired or invalid token.'
					})
				});
			}
		});

		// Mock Submit Inquiry API
		await page.route('**/api/guardian/inquiry', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					message: 'Your inquiry has been sent to the academy administration. We will review it and get back to you shortly.'
				})
			});
		});
	});

	test('1. Validates guardian login credentials and displays error on mismatch', async ({ page }) => {
		await page.goto('/guardian/portal');

		await expect(page.getByRole('heading', { name: /guardian & parent portal/i })).toBeVisible();

		// Fill incorrect credentials
		await page.getByPlaceholder('e.g. student@gmail.com').fill('chidinma@example.com');
		await page.getByPlaceholder(/08123456789 or parent@gmail\.com/i).fill('08000000000');

		await page.getByRole('button', { name: /access ward portal/i }).click();

		// Check for error banner
		await expect(page.getByText(/verification failed/i)).toBeVisible();
		await expect(page.getByText(/does not match our records/i)).toBeVisible();
	});

	test('2. Successfully logs in with student email + guardian phone, loads ward dashboard and tabs', async ({ page }) => {
		await page.goto('/guardian/portal');

		// Fill valid credentials
		await page.getByPlaceholder('e.g. student@gmail.com').fill('chidinma@example.com');
		await page.getByPlaceholder(/08123456789 or parent@gmail\.com/i).fill('08033221100');

		await page.getByRole('button', { name: /access ward portal/i }).click();

		// Verify Ward Header
		await expect(page.getByRole('heading', { name: 'Chidinma Okafor' })).toBeVisible();
		await expect(page.getByText(/JAMB\/UTME/i).first()).toBeVisible();
		await expect(page.getByText(/Enrolled & Active/i).first()).toBeVisible();

		// Verify KPI stats
		await expect(page.getByText('78.5%').first()).toBeVisible();
		await expect(page.getByText('94.4%').first()).toBeVisible();

		// Check Mock Exams tab
		await page.getByRole('button', { name: /mock exams/i }).click();
		await expect(page.getByRole('heading', { name: 'Full Mock Examination History' })).toBeVisible();
		await expect(page.getByText('86%').first()).toBeVisible();
		await expect(page.getByText('PASSED').first()).toBeVisible();

		// Check Attendance tab
		await page.getByRole('button', { name: /attendance/i }).click();
		await expect(page.getByRole('heading', { name: 'Daily Physical Attendance Logs' })).toBeVisible();
		await expect(page.getByText('Traffic delay')).toBeVisible();

		// Check Notices tab
		await page.getByRole('button', { name: /notices/i }).click();
		await expect(page.getByText('Mock Examination Schedule: Series 3')).toBeVisible();
		await expect(page.getByText('Parent-Teacher Consultations')).toBeVisible();
	});

	test('3. Direct magic link with token automatically logs in guardian', async ({ page }) => {
		await page.goto('/guardian/portal?token=valid-test-guardian-token');

		// Verifies dashboard renders immediately without login form
		await expect(page.getByRole('heading', { name: 'Chidinma Okafor' })).toBeVisible();
		await expect(page.getByRole('main').getByText('Dr. Emeka Okafor')).toBeVisible();
		await expect(page.getByRole('main').getByText('Father')).toBeVisible();
	});

	test('4. Guardian submits an inquiry message to academy tutors and administration', async ({ page }) => {
		await page.goto('/guardian/portal?token=valid-test-guardian-token');

		await page.getByRole('button', { name: /contact academy/i }).click();
		await expect(page.getByRole('heading', { name: 'Contact Academy Administration' })).toBeVisible();

		// Fill inquiry form
		await page.getByPlaceholder(/describe your inquiry/i).fill('Hello, please provide an update on Chidinma\'s mock exam preparation in Physics and Chemistry.');

		await page.getByRole('button', { name: /send inquiry to academy/i }).click();

		// Verify success confirmation
		await expect(page.getByText(/message delivered successfully/i)).toBeVisible();
		await expect(page.getByText(/your inquiry has been sent to the academy administration/i)).toBeVisible();
	});

	test('5. Sign out clears session and returns to login screen', async ({ page }) => {
		await page.goto('/guardian/portal?token=valid-test-guardian-token');
		await expect(page.getByRole('heading', { name: 'Chidinma Okafor' })).toBeVisible();

		// Click sign out
		await page.getByRole('button', { name: /sign out/i }).click();

		// Should be back at login form
		await expect(page.getByRole('heading', { name: /guardian & parent portal/i })).toBeVisible();
		await expect(page.getByPlaceholder('e.g. student@gmail.com')).toBeVisible();
	});
});
