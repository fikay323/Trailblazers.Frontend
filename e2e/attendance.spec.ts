import { test, expect } from '@playwright/test';

test.describe('Student Attendance & Clock-Out Workflow', () => {
	const setupStudentSession = async (page: any, attendanceResponse: any) => {
		// Mock student authentication and data
		await page.route('**/api/auth/profile', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					id: 'student-1',
					fullName: 'Tariq Student',
					email: 'tariq@example.com',
					role: 'Student',
					isActive: true
				})
			});
		});

		await page.route('**/api/student/history?email=*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					studentEmail: 'tariq@example.com',
					totalAttempts: 0,
					passedAttempts: 0,
					averageScorePercentage: 0,
					attempts: []
				})
			});
		});

		await page.route('**/api/attendance/my-today', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(attendanceResponse)
			});
		});

		// Seed localStorage before navigation so AuthContext loads the authenticated session
		await page.addInitScript(() => {
			localStorage.setItem('auth_token', 'fake-jwt-token');
			localStorage.setItem(
				'auth_user',
				JSON.stringify({
					id: 'student-1',
					fullName: 'Tariq Student',
					email: 'tariq@example.com',
					role: 'Student',
					isActive: true
				})
			);
		});
	};

	test('Displays "Check In Now" when student has not clocked in yet', async ({ page }) => {
		await setupStudentSession(page, {
			studentId: 'student-1',
			todayDate: '2026-09-22',
			hasClockedInToday: false,
			hasClockedOutToday: false,
			todayRecord: null,
			totalPresentDays: 10,
			punctualStreak: 3
		});

		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify attendance card elements
		await expect(page.getByRole('heading', { name: 'Daily Attendance' })).toBeVisible();
		await expect(page.getByText('Not Checked In Today')).toBeVisible();
		await expect(page.getByRole('button', { name: /Check In Now/i })).toBeVisible();
	});

	test('Displays "Clock Out" button when student is clocked in but has not clocked out', async ({ page }) => {
		await setupStudentSession(page, {
			studentId: 'student-1',
			todayDate: '2026-09-22',
			hasClockedInToday: true,
			hasClockedOutToday: false,
			todayRecord: {
				id: 101,
				studentId: 'student-1',
				date: '2026-09-22',
				clockInTime: '2026-09-22T08:15:00Z',
				clockOutTime: null,
				status: 'Present',
				distanceMeters: 25.5
			},
			totalPresentDays: 11,
			punctualStreak: 4
		});

		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify "Clock Out" button and "Present" badge
		await expect(page.getByRole('heading', { name: 'Daily Attendance' })).toBeVisible();
		await expect(page.getByText('Present')).toBeVisible();
		await expect(page.getByRole('button', { name: /Clock Out/i })).toBeVisible();
	});

	test('Displays "Day Completed" badge when student has completed clock-out', async ({ page }) => {
		await setupStudentSession(page, {
			studentId: 'student-1',
			todayDate: '2026-09-22',
			hasClockedInToday: true,
			hasClockedOutToday: true,
			todayRecord: {
				id: 101,
				studentId: 'student-1',
				date: '2026-09-22',
				clockInTime: '2026-09-22T08:15:00Z',
				clockOutTime: '2026-09-22T16:30:00Z',
				status: 'Present',
				distanceMeters: 25.5
			},
			totalPresentDays: 11,
			punctualStreak: 4
		});

		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify "Day Completed" badge and "Presence Completed" indicator
		await expect(page.getByRole('heading', { name: 'Daily Attendance' })).toBeVisible();
		await expect(page.getByText('Day Completed')).toBeVisible();
		await expect(page.getByText('Presence Completed')).toBeVisible();
		await expect(page.getByRole('button', { name: /Clock Out/i })).toHaveCount(0);
	});
});
