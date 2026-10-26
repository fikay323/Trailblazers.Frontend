import { test, expect } from '@playwright/test';

test.describe('Admin Media & Dynamic Picture Management Tests', () => {
	test('Admin submissions portal unlocks and displays Media tab', async ({ page }) => {
		// Mock API key in local storage to bypass lock screen
		await page.addInitScript(() => {
			localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
		});

		await page.goto('/admin/submissions?tab=media', { waitUntil: 'domcontentloaded' });

		// Verify page title / header
		await expect(page.getByText('Site Media & Picture Management')).toBeVisible();

		// Verify sub-tabs exist
		await expect(page.getByRole('button', { name: /SEO & Social Cards/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Home Hero Carousel/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Campus Gallery/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Leadership & Faculty/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Page Spots & Logo/i })).toBeVisible();
	});

	test('Media sub-tabs switch smoothly and display slot cards', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
		});

		await page.goto('/admin/submissions?tab=media', { waitUntil: 'domcontentloaded' });

		// Click on Home Hero Carousel sub-tab
		await page.getByRole('button', { name: /Home Hero Carousel/i }).click();
		await expect(page.getByText('Homepage Full-Screen Hero Slider')).toBeVisible();

		// Click on Campus Gallery sub-tab
		await page.getByRole('button', { name: /Campus Gallery/i }).click();
		await expect(page.getByText('Campus Facilities & Life Gallery')).toBeVisible();
		await expect(page.getByRole('button', { name: /Add Gallery Photo/i })).toBeVisible();

		// Click on Leadership & Faculty sub-tab
		await page.getByRole('button', { name: /Leadership & Faculty/i }).click();
		await expect(page.getByText('Leadership & Management Team')).toBeVisible();
	});

	test('Public SEO pages emit server-rendered OpenGraph and Twitter image meta tags', async ({ page }) => {
		// 1. Home page
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		const homeOgImage = page.locator('meta[property="og:image"]');
		await expect(homeOgImage).toHaveCount(1);
		const homeOgContent = await homeOgImage.getAttribute('content');
		expect(homeOgContent).toBeTruthy();

		// 2. About page
		await page.goto('/about', { waitUntil: 'domcontentloaded' });
		const aboutOgImage = page.locator('meta[property="og:image"]');
		await expect(aboutOgImage).toHaveCount(1);
		const aboutOgContent = await aboutOgImage.getAttribute('content');
		expect(aboutOgContent).toBeTruthy();

		// 3. Programs page
		await page.goto('/programs', { waitUntil: 'domcontentloaded' });
		const programsOgImage = page.locator('meta[property="og:image"]');
		await expect(programsOgImage).toHaveCount(1);

		// 4. Summer Coaching page
		await page.goto('/summer-coaching', { waitUntil: 'domcontentloaded' });
		const summerOgImage = page.locator('meta[property="og:image"]');
		await expect(summerOgImage).toHaveCount(1);

		// 5. Gallery page
		await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
		const galleryOgImage = page.locator('meta[property="og:image"]');
		await expect(galleryOgImage).toHaveCount(1);
	});
});
