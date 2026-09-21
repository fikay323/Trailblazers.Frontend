import { test, expect } from '@playwright/test';

test.describe('Academy Announcements & Noticeboard Workflow', () => {
	const setupAdminSession = async (page: any) => {
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

		// Mock Admin Announcements List
		let mockAnnouncements = [
			{
				id: 'notice-1',
				title: 'Independence Day Academy Holiday',
				content: 'The academy premises and CBT labs will be closed on Tuesday in observance of the public holiday.',
				priority: 'Holiday',
				priorityName: 'Holiday',
				targetAudience: 'All',
				isActive: true,
				createdAt: '2026-09-20T10:00:00Z',
				authorName: 'Academy Administration',
				sentEmailBroadcast: false,
				sentSmsBroadcast: false
			}
		];

		await page.route('**/api/admin/announcements?*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					totalCount: mockAnnouncements.length,
					pageNumber: 1,
					pageSize: 20,
					items: mockAnnouncements
				})
			});
		});

		// Mock Create Announcement API
		await page.route('**/api/admin/announcements', async (route: any) => {
			if (route.request().method() === 'POST') {
				const body = route.request().postDataJSON();
				const newNotice = {
					id: 'notice-new',
					title: body.title,
					content: body.content,
					priority: body.priority,
					priorityName: body.priority,
					targetAudience: body.targetAudience || 'All',
					isActive: true,
					createdAt: new Date().toISOString(),
					authorName: 'Lead Academy Admin',
					sentEmailBroadcast: !!body.sendEmailBroadcast,
					sentSmsBroadcast: !!body.sendSmsBroadcast
				};
				mockAnnouncements.unshift(newNotice);
				await route.fulfill({
					status: 201,
					contentType: 'application/json',
					body: JSON.stringify(newNotice)
				});
				return;
			}
			await route.continue();
		});

		// Initialize localStorage for admin
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

	const setupStudentSession = async (page: any) => {
		// Mock student authentication and data
		await page.route('**/api/auth/profile', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					id: 'student-1',
					fullName: 'Amina Bello',
					email: 'amina@example.com',
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
					studentEmail: 'amina@example.com',
					totalTestsTaken: 2,
					averagePercentage: 81.0,
					highestPercentage: 88.0,
					attempts: []
				})
			});
		});

		await page.route('**/api/attendance/my-today', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					studentId: 'student-1',
					hasClockedInToday: true,
					hasClockedOutToday: false,
					todayRecord: {
						status: 'Present',
						clockInTime: '2026-09-22T08:15:00Z'
					}
				})
			});
		});

		// Mock active announcements for student
		await page.route('**/api/announcements?*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([
					{
						id: 'ann-1',
						title: 'Mock Exam #3 Schedule Notice',
						content: 'The third JAMB UTME mock exam will take place on Saturday, 10:00 AM prompt in CBT Lab 1.',
						priority: 'MockExamSchedule',
						priorityName: 'MockExamSchedule',
						targetAudience: 'All',
						isActive: true,
						createdAt: '2026-09-21T14:00:00Z',
						authorName: 'Academy Administration',
						sentEmailBroadcast: true,
						sentSmsBroadcast: false
					},
					{
						id: 'ann-2',
						title: 'Urgent Tuition Clearance Notice',
						content: 'Students with outstanding tuition fees must clear balances at the bursary before Friday.',
						priority: 'FeeReminder',
						priorityName: 'FeeReminder',
						targetAudience: 'All',
						isActive: true,
						createdAt: '2026-09-20T09:00:00Z',
						authorName: 'Bursary Department',
						sentEmailBroadcast: false,
						sentSmsBroadcast: false
					}
				])
			});
		});

		// Seed localStorage for student
		await page.addInitScript(() => {
			localStorage.setItem('auth_token', 'fake-student-jwt');
			localStorage.setItem(
				'auth_user',
				JSON.stringify({
					id: 'student-1',
					fullName: 'Amina Bello',
					email: 'amina@example.com',
					role: 'Student',
					isActive: true
				})
			);
		});
	};

	test('Admin can compose and publish a new academy announcement', async ({ page }) => {
		await setupAdminSession(page);
		await page.goto('/admin/submissions?tab=noticeboard', { waitUntil: 'domcontentloaded' });

		// Verify page header
		await expect(page.getByRole('heading', { name: 'Academy Noticeboard & Broadcasts', level: 1 })).toBeVisible();
		await expect(page.getByText('Independence Day Academy Holiday')).toBeVisible();

		// Click "Create Announcement" to expand composer
		const createBtn = page.getByRole('button', { name: /Create Announcement/i });
		await expect(createBtn).toBeVisible();
		await createBtn.click();

		// Fill in announcement details
		await expect(page.getByText('Publish New Notice')).toBeVisible();
		await page.fill('input[placeholder*="JAMB CBT Mock Exam #3"]', 'Mock Exam #3 Schedule Notice');

		// Select priority
		const examScheduleBtn = page.getByRole('button', { name: 'Mock Exam Schedule' });
		await examScheduleBtn.click();

		// Select target audience
		await page.selectOption('select', 'JAMB');

		// Fill content
		await page.fill('textarea[placeholder*="Write the full announcement details here"]', 'The third JAMB UTME mock exam will take place on Saturday, 10:00 AM prompt in CBT Lab 1.');

		// Check email broadcast
		const emailCheckbox = page.locator('input[type="checkbox"]').first();
		await emailCheckbox.check();

		// Submit announcement
		const publishBtn = page.getByRole('button', { name: /Publish Notice/i });
		await publishBtn.click();

		// Verify success confirmation
		await expect(page.getByText(/published successfully and enqueued for email broadcast/i)).toBeVisible();

		// Verify new notice appears in the list
		await expect(page.getByRole('heading', { name: 'Mock Exam #3 Schedule Notice' })).toBeVisible();
		await expect(page.getByText('The third JAMB UTME mock exam will take place on Saturday')).toBeVisible();
	});

	test('Student Dashboard renders Academy Noticeboard with priority badges and announcements', async ({ page }) => {
		await setupStudentSession(page);
		await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

		// Verify Noticeboard widget is displayed
		await expect(page.getByRole('heading', { name: 'Academy Noticeboard' })).toBeVisible();
		await expect(page.getByText('2 Notices')).toBeVisible();

		// Verify announcement cards and priority badges
		await expect(page.getByText('Mock Exam #3 Schedule Notice')).toBeVisible();
		await expect(page.getByText('The third JAMB UTME mock exam will take place on Saturday, 10:00 AM prompt in CBT Lab 1.')).toBeVisible();
		await expect(page.getByText('Urgent Tuition Clearance Notice')).toBeVisible();
		await expect(page.getByText('Students with outstanding tuition fees must clear balances at the bursary before Friday.')).toBeVisible();
	});
});
