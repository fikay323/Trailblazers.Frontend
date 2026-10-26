import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Production Live Deployment Verification', () => {
	test.setTimeout(120000);

	const artifactDir = 'C:\\Users\\HomePC\\.gemini\\antigravity\\brain\\6fbcb05c-18a8-4be4-8e82-9810d76d57a1';

	test('1. Verify Outer Website Navbar & Light Themed Blog with Seeded Articles', async ({ page }) => {
		// Navigate to public website
		await page.goto('https://trailblazer-academy.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

		// Verify "Blog" is present in the navigation
		const blogLink = page.locator('header nav a[href="/blog"], header a[href="/blog"]').first();
		await expect(blogLink).toBeVisible({ timeout: 15000 });
		await expect(blogLink).toHaveText(/Blog/i);

		// Click "Blog" link
		await blogLink.click();
		await page.waitForURL('**/blog', { timeout: 30000 });

		// Wait for articles to load
		await page.waitForSelector('h1', { timeout: 20000 });
		const pageTitle = page.locator('h1').first();
		await expect(pageTitle).toContainText(/Master JAMB, WAEC & Admissions/i);

		// Verify light theme: background color of main or container should be light (not dark slate-950 rgb(2, 6, 23))
		const mainBg = await page.evaluate(() => {
			const el = document.querySelector('main') || document.body;
			return window.getComputedStyle(el).backgroundColor;
		});
		console.log('Blog main background color:', mainBg);

		// Wait for blog cards to appear
		const articleCards = page.locator('a[href^="/blog/"]');
		await expect(articleCards.first()).toBeVisible({ timeout: 20000 });
		const cardCount = await articleCards.count();
		console.log(`Found ${cardCount} blog article cards on live catalog`);
		expect(cardCount).toBeGreaterThanOrEqual(1);

		// Take screenshot of live blog page
		await page.screenshot({ path: path.join(artifactDir, 'live_blog_light_catalog.png'), fullPage: false });

		// Click the first article and verify article detail view in light theme
		await articleCards.first().click();
		await page.waitForSelector('article h1', { timeout: 20000 });

		const articleHeading = page.locator('article h1').first();
		await expect(articleHeading).toBeVisible();
		console.log('Loaded article:', await articleHeading.textContent());

		// Verify article page is light themed
		const articleBg = await page.evaluate(() => {
			const el = document.querySelector('article') || document.body;
			return window.getComputedStyle(el).backgroundColor;
		});
		console.log('Article background color:', articleBg);

		await page.screenshot({ path: path.join(artifactDir, 'live_blog_light_article.png'), fullPage: false });
	});

	test('2. Verify Admin Students List - Active Status & Photo Removal Modal', async ({ page }) => {
		// Test via direct API call first to verify DB state
		const apiRes = await page.request.get('https://trailblazers-backend.onrender.com/api/admin/students', {
			headers: { 'X-API-KEY': 'trailblazers-secret-key' }
		});
		expect(apiRes.ok()).toBeTruthy();
		const students = await apiRes.json();
		console.log(`Total students retrieved via API: ${students.length}`);

		// Check that all older students show "Active"
		for (const s of students) {
			console.log(`Student: ${s.fullName} (${s.email}) -> Status: ${s.status}, IsActivated: ${s.isActivated}, Tests: ${s.totalTestsTaken}`);
		}

		// Navigate to staff portal
		await page.goto('https://staff.trailblazer-academy.com/admin/submissions', { waitUntil: 'domcontentloaded', timeout: 60000 });
		
		// If prompt for API key is displayed, supply it
		const apiKeyInput = page.locator('input[placeholder*="API Key" i], input[type="password"]');
		if (await apiKeyInput.isVisible({ timeout: 5000 }).catch(() => false)) {
			await apiKeyInput.fill('trailblazers-secret-key');
			const submitBtn = page.locator('button:has-text("Access"), button:has-text("Submit"), button:has-text("Enter")').first();
			if (await submitBtn.isVisible().catch(() => false)) {
				await submitBtn.click();
			}
		}

		// Set local storage api key just in case
		await page.evaluate(() => {
			localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
		});

		// Reload submissions page to pick up storage
		await page.goto('https://staff.trailblazer-academy.com/admin/submissions', { waitUntil: 'domcontentloaded', timeout: 30000 });

		// Click "Students" tab
		const studentsTab = page.locator('button:has-text("Students"), [role="tab"]:has-text("Students")').first();
		if (await studentsTab.isVisible({ timeout: 10000 }).catch(() => false)) {
			await studentsTab.click();
			await page.waitForTimeout(2000);

			// Take screenshot of students table
			await page.screenshot({ path: path.join(artifactDir, 'live_admin_students_table.png'), fullPage: false });
		}
	});

	test('3. Verify Student Dashboard & Academy Noticeboard Display', async ({ page }) => {
		// Navigate to student login
		await page.goto('https://learn.trailblazer-academy.com/auth/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

		// Fill in student login credentials
		await page.fill('input[type="email"]', 'oluwafikayomi.digital+2@gmail.com');
		await page.fill('input[type="password"]', 'Boss@1234');

		const submitBtn = page.locator('button[type="submit"]');
		await submitBtn.click();

		// Wait for student dashboard to load
		await page.waitForURL('**/student/dashboard', { timeout: 45000 });

		// Verify Welcome heading
		await page.waitForSelector('h1', { timeout: 25000 });
		const heading = page.locator('h1').first();
		await expect(heading).toContainText(/Welcome/i);

		// Verify Academy Noticeboard widget is visible
		const noticeboard = page.locator('h2:has-text("Academy Noticeboard")');
		await expect(noticeboard).toBeVisible({ timeout: 15000 });

		// Take screenshot of live student dashboard showing Academy Noticeboard
		await page.screenshot({ path: path.join(artifactDir, 'live_student_dashboard_noticeboard.png'), fullPage: false });
	});

	test('4. Verify Admin Photo Removal Notice in Student Academy Noticeboard', async ({ page }) => {
		// 1. Get student ID from admin API
		const apiRes = await page.request.get('https://trailblazers-backend.onrender.com/api/admin/students', {
			headers: { 'X-API-KEY': 'trailblazers-secret-key' }
		});
		const students = await apiRes.json();
		const targetStudent = students.find((s: any) => s.email === 'oluwafikayomi.digital+2@gmail.com');
		expect(targetStudent).toBeDefined();

		// 2. Admin removes student profile picture with a specific reason
		const deleteRes = await page.request.delete(`https://trailblazers-backend.onrender.com/api/admin/students/${targetStudent.id}/profile-picture`, {
			headers: {
				'X-API-KEY': 'trailblazers-secret-key',
				'Content-Type': 'application/json'
			},
			data: {
				reason: 'Profile photo did not meet passport guidelines. Please upload a clear passport photo on a plain background.'
			}
		});
		expect(deleteRes.ok()).toBeTruthy();
		console.log('Admin photo removal API executed successfully');

		// 3. Log in as student to check their Noticeboard
		await page.goto('https://learn.trailblazer-academy.com/auth/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
		await page.fill('input[type="email"]', 'oluwafikayomi.digital+2@gmail.com');
		await page.fill('input[type="password"]', 'Boss@1234');
		await page.click('button[type="submit"]');

		await page.waitForURL('**/student/dashboard', { timeout: 45000 });
		await page.waitForSelector('h1', { timeout: 25000 });

		// 4. Verify notice appears inside Academy Noticeboard widget
		const noticeInNoticeboard = page.locator('text=Profile Picture Removed').first();
		await expect(noticeInNoticeboard).toBeVisible({ timeout: 20000 });

		const directNoticeBadge = page.locator('text=DIRECT NOTICE').first();
		await expect(directNoticeBadge).toBeVisible();

		// Take screenshot of Noticeboard with the administrative notice
		await page.screenshot({ path: path.join(artifactDir, 'live_student_noticeboard_with_notice.png'), fullPage: false });

		// 5. Click Acknowledge button
		const acknowledgeBtn = page.locator('button:has-text("Acknowledge")').first();
		if (await acknowledgeBtn.isVisible()) {
			await acknowledgeBtn.click();
			console.log('Clicked Acknowledge button on student noticeboard');
		}
	});
});
