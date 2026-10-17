import { test, expect } from '@playwright/test';

test.describe('Student Profile Picture Feature', () => {
	test.setTimeout(60000);

	test('renders profile avatar and interactive controls on student dashboard', async ({ page }) => {
		const mockUser = {
			id: '11111111-2222-3333-4444-555555555555',
			email: 'student.test@trailblazer.edu',
			fullName: 'Test Student',
			role: 'Student',
			isActive: true,
			profilePictureUrl: null
		};

		// Intercept ALL API requests to prevent network hang
		await page.route('**/api/**', async (route) => {
			const url = route.request().url();
			if (url.includes('/api/auth/me') || url.includes('/api/students/me/profile')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockUser)
				});
				return;
			}
			if (url.includes('/api/students/me/exam-history')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						studentEmail: mockUser.email,
						totalTestsTaken: 0,
						averagePercentage: 0,
						highestPercentage: 0,
						attempts: []
					})
				});
				return;
			}
			if (url.includes('/api/attendance')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						todayStatus: 'NotClockedIn',
						clockInTime: null,
						clockOutTime: null,
						totalPresentDays: 0,
						attendancePercentage: 0
					})
				});
				return;
			}
			if (url.includes('/api/announcements')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify([])
				});
				return;
			}
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({})
			});
		});

		// Set mock session in localStorage
		await page.addInitScript((user) => {
			localStorage.setItem('auth_token', 'mock-jwt-token');
			localStorage.setItem('auth_user', JSON.stringify(user));
		}, mockUser);

		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify avatar fallback letter
		await expect(page.locator('text=Welcome, Test Student')).toBeVisible({ timeout: 15000 });
		await expect(page.getByRole('button', { name: /upload photo/i })).toBeVisible();

		// Verify file input exists
		const fileInput = page.locator('input[type="file"][accept*="image"]');
		await expect(fileInput).toBeAttached();

		// Create a mock 1x1 png image buffer to simulate upload
		const mockPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
		const buffer = Buffer.from(mockPngBase64, 'base64');

		// Set input files
		await fileInput.setInputFiles({
			name: 'avatar.png',
			mimeType: 'image/png',
			buffer
		});

		// Verify Crop Modal opens
		await expect(page.getByRole('heading', { name: /crop profile picture/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /confirm & upload/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

		// Click cancel and verify modal closes
		await page.getByRole('button', { name: /cancel/i }).click();
		await expect(page.getByRole('heading', { name: /crop profile picture/i })).not.toBeVisible();
	});

	test('renders existing profile picture and delete confirmation modal', async ({ page }) => {
		const mockUserWithPhoto = {
			id: '11111111-2222-3333-4444-555555555555',
			email: 'student.photo@trailblazer.edu',
			fullName: 'Photo Student',
			role: 'Student',
			isActive: true,
			profilePictureUrl: 'https://res.cloudinary.com/dssjoxdom/image/upload/v1/trailblazers/profiles/test.webp'
		};

		// Intercept ALL API requests
		await page.route('**/api/**', async (route) => {
			const url = route.request().url();
			if (url.includes('/api/auth/me') || url.includes('/api/students/me/profile')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockUserWithPhoto)
				});
				return;
			}
			if (url.includes('/api/students/me/exam-history')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						studentEmail: mockUserWithPhoto.email,
						totalTestsTaken: 0,
						averagePercentage: 0,
						highestPercentage: 0,
						attempts: []
					})
				});
				return;
			}
			if (url.includes('/api/attendance')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						todayStatus: 'NotClockedIn',
						clockInTime: null,
						clockOutTime: null,
						totalPresentDays: 0,
						attendancePercentage: 0
					})
				});
				return;
			}
			if (url.includes('/api/announcements')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify([])
				});
				return;
			}
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({})
			});
		});

		// Set mock session in localStorage
		await page.addInitScript((user) => {
			localStorage.setItem('auth_token', 'mock-jwt-token');
			localStorage.setItem('auth_user', JSON.stringify(user));
		}, mockUserWithPhoto);

		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify image is rendered
		const avatarImg = page.locator('.group img[src*="res.cloudinary.com"]');
		await expect(avatarImg).toBeVisible({ timeout: 15000 });

		// Verify "Change photo" and "Remove" buttons
		await expect(page.getByRole('button', { name: /change photo/i })).toBeVisible();
		const removeBtn = page.getByRole('button', { name: /remove/i });
		await expect(removeBtn).toBeVisible();

		// Click remove and verify custom modal appears (not native popup)
		await removeBtn.click();
		await expect(page.getByRole('heading', { name: /remove profile picture/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /keep photo/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /delete photo/i })).toBeVisible();

		// Click "Keep Photo" and verify modal closes
		await page.getByRole('button', { name: /keep photo/i }).click();
		await expect(page.getByRole('heading', { name: /remove profile picture/i })).not.toBeVisible();
	});

	test('renders student notification banner with reason when photo was removed and allows acknowledgment', async ({ page }) => {
		const mockStudentWithNotif = {
			id: '22222222-3333-4444-5555-666666666666',
			email: 'notified.student@trailblazer.edu',
			fullName: 'Notified Student',
			role: 'Student',
			isActive: true,
			profilePictureUrl: null
		};

		const mockNotifications = [
			{
				id: 'notif-1234',
				title: 'Profile Picture Removed by Administration',
				message: 'Your profile picture was removed as it does not comply with our student code of conduct: Inappropriate or non-compliant image.',
				type: 'ProfilePictureRemoved',
				isRead: false,
				createdAt: new Date().toISOString()
			}
		];

		let readCalled = false;

		await page.route('**/api/**', async (route) => {
			const url = route.request().url();
			if (url.includes('/api/auth/me') || url.includes('/api/students/me/profile')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockStudentWithNotif)
				});
				return;
			}
			if (url.includes('/api/students/me/notifications/notif-1234/read')) {
				readCalled = true;
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Marked as read' })
				});
				return;
			}
			if (url.includes('/api/students/me/notifications')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(mockNotifications)
				});
				return;
			}
			if (url.includes('/api/students/me/exam-history')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						studentEmail: mockStudentWithNotif.email,
						totalTestsTaken: 0,
						averagePercentage: 0,
						highestPercentage: 0,
						attempts: []
					})
				});
				return;
			}
			if (url.includes('/api/attendance')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						todayStatus: 'NotClockedIn',
						clockInTime: null,
						clockOutTime: null,
						totalPresentDays: 0,
						attendancePercentage: 0
					})
				});
				return;
			}
			if (url.includes('/api/announcements')) {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify([
						{
							id: 'ann-1',
							title: 'Mock UTME Announcement',
							content: 'Regular scheduled mock exams will begin on Saturday.',
							priority: 'General',
							priorityName: 'General',
							authorName: 'Academic Director',
							createdAt: new Date().toISOString()
						}
					])
				});
				return;
			}
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({})
			});
		});

		await page.addInitScript((user) => {
			localStorage.setItem('auth_token', 'mock-jwt-token');
			localStorage.setItem('auth_user', JSON.stringify(user));
		}, mockStudentWithNotif);

		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify noticeboard is stable and renders announcement
		await expect(page.locator('text=Academy Noticeboard')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('text=Mock UTME Announcement')).toBeVisible();

		// Verify notification banner is visible with reason
		await expect(page.locator('text=Profile Picture Removed by Administration')).toBeVisible();
		await expect(page.locator('text=Inappropriate or non-compliant image')).toBeVisible();

		// Click Acknowledge button
		const ackBtn = page.getByRole('button', { name: /acknowledge/i });
		await expect(ackBtn).toBeVisible();
		await ackBtn.click();

		// Verify notification is dismissed
		await expect(page.locator('text=Profile Picture Removed by Administration')).not.toBeVisible();
		expect(readCalled).toBe(true);
	});
});
