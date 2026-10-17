import { test, expect } from '@playwright/test';

test.describe('Trailblazers Blog & Knowledge Hub E2E Tests', () => {
	const mockArticles = [
		{
			id: 'post-1',
			title: 'How to Score 300+ in JAMB UTME 2026',
			slug: 'how-to-score-300-in-jamb-utme-2026',
			excerpt: 'A comprehensive study blueprint covering syllabus mastery, past question drills, and time management.',
			content: `# How to Score 300+ in JAMB UTME\n\nScoring above 300 in JAMB requires discipline and strategic preparation.\n\n## 1. Study the Official Syllabus\nNever read blindly. Focus on key topics outlined in the JAMB brochure.\n\n## 2. Daily CBT Practice\nPractice with the computer-based testing interface at Trailblazer Academy.`,
			coverImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
			category: 'JAMB & UTME Tips',
			tags: ['JAMB', 'UTME', 'StudyTips'],
			authorName: 'Lead Academic Director',
			authorId: 'author-1',
			isPublished: true,
			publishedAt: '2026-09-20T10:00:00Z',
			createdAt: '2026-09-20T09:00:00Z',
			viewCount: 42
		},
		{
			id: 'post-2',
			title: 'Top 5 Common Mistakes in WAEC Physics Practical',
			slug: 'top-5-common-mistakes-in-waec-physics-practical',
			excerpt: 'Avoid losing critical marks in your optics, mechanics, and electricity practicals.',
			content: `# Top 5 Common Mistakes in WAEC Physics Practical\n\nPractical exams test precision.\n\n- Inaccurate slope calculations\n- Ignoring significant figures\n- Poor graph plotting.`,
			coverImageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
			category: 'WAEC & NECO Guides',
			tags: ['WAEC', 'Physics', 'Practicals'],
			authorName: 'Senior Physics Tutor',
			authorId: 'author-2',
			isPublished: true,
			publishedAt: '2026-09-18T14:00:00Z',
			createdAt: '2026-09-18T13:00:00Z',
			viewCount: 28
		}
	];

	const setupPublicMocks = async (page: any) => {
		await page.route('**/api/blog?*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					totalCount: mockArticles.length,
					pageNumber: 1,
					pageSize: 12,
					items: mockArticles,
					categories: ['JAMB & UTME Tips', 'WAEC & NECO Guides', 'Study Strategies']
				})
			});
		});

		await page.route('**/api/blog/how-to-score-300-in-jamb-utme-2026', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockArticles[0])
			});
		});
	};

	const setupAdminMocks = async (page: any) => {
		let adminList = [...mockArticles];

		// Mock Admin Profile & Me endpoints
		const mockAdminUser = {
			id: 'admin-1',
			fullName: 'Lead Academy Admin',
			email: 'admin@trailblazers.com',
			role: 'Admin',
			isActive: true
		};

		await page.route('**/api/auth/profile', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockAdminUser)
			});
		});

		await page.route('**/api/auth/me', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockAdminUser)
			});
		});

		// Mock Students list fallback
		await page.route('**/api/admin/students*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					totalCount: 0,
					pageNumber: 1,
					pageSize: 20,
					items: []
				})
			});
		});

		// Mock Admin Blog List
		await page.route('**/api/admin/blog?*', async (route: any) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					totalCount: adminList.length,
					pageNumber: 1,
					pageSize: 20,
					items: adminList,
					categories: ['JAMB & UTME Tips', 'WAEC & NECO Guides', 'Study Strategies']
				})
			});
		});

		// Mock Admin Get / Put / Delete by ID
		await page.route('**/api/admin/blog/*', async (route: any) => {
			const url = route.request().url();
			const id = url.split('/').pop()?.split('?')[0];
			const post = adminList.find(p => p.id === id) || adminList[0];

			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(post)
				});
				return;
			}
			if (route.request().method() === 'PUT') {
				const body = route.request().postDataJSON();
				const idx = adminList.findIndex(p => p.id === id);
				if (idx !== -1) {
					adminList[idx] = { ...adminList[idx], ...body };
				}
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(idx !== -1 ? adminList[idx] : post)
				});
				return;
			}
			if (route.request().method() === 'DELETE') {
				adminList = adminList.filter(p => p.id !== id);
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Deleted' })
				});
				return;
			}
			await route.continue();
		});

		// Mock Create Post
		await page.route('**/api/admin/blog', async (route: any) => {
			if (route.request().method() === 'POST') {
				const body = route.request().postDataJSON();
				const created = {
					id: 'post-new',
					title: body.title,
					slug: body.slug || 'new-article',
					excerpt: body.excerpt,
					content: body.content,
					coverImageUrl: body.coverImageUrl,
					category: body.category || 'Study Strategies',
					tags: body.tags || [],
					authorName: 'Lead Academy Admin',
					authorId: 'admin-1',
					isPublished: !!body.isPublished,
					publishedAt: new Date().toISOString(),
					createdAt: new Date().toISOString(),
					viewCount: 0
				};
				adminList.unshift(created);
				await route.fulfill({
					status: 201,
					contentType: 'application/json',
					body: JSON.stringify(created)
				});
				return;
			}
			await route.continue();
		});

		// Add wildcard cookies for cross-subdomain authentication
		await page.context().addCookies([
			{
				name: 'auth_token',
				value: 'fake-admin-jwt',
				domain: '.localhost',
				path: '/'
			},
			{
				name: 'admin_api_key',
				value: 'trailblazers-secret-key',
				domain: '.localhost',
				path: '/'
			}
		]);

		// Seed localStorage
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

	test('Public /blog catalog displays featured article, categories, and article cards', async ({ page }) => {
		await setupPublicMocks(page);
		await page.goto('/blog', { waitUntil: 'domcontentloaded' });

		// Verify Hero
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Master JAMB, WAEC & Admissions');
		await expect(page.getByPlaceholder(/Search topics, exams/i)).toBeVisible();

		// Verify Featured Article
		await expect(page.getByText('Featured Article')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'How to Score 300+ in JAMB UTME 2026' })).toBeVisible();

		// Verify Grid Article
		await expect(page.getByRole('heading', { name: 'Top 5 Common Mistakes in WAEC Physics Practical' })).toBeVisible();

		// Verify Enrollment CTA
		await expect(page.getByRole('heading', { name: /Ready to Score 300\+ in JAMB or Ace WAEC/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Register for Coaching Today/i })).toBeVisible();
	});

	test('Public /blog/[slug] displays markdown content, author info, share buttons, and CTA', async ({ page }) => {
		await setupPublicMocks(page);
		await page.goto('/blog/how-to-score-300-in-jamb-utme-2026', { waitUntil: 'domcontentloaded' });

		// Verify Article Heading & Category
		await expect(page.getByRole('heading', { level: 1, name: 'How to Score 300+ in JAMB UTME 2026' })).toBeVisible();
		await expect(page.getByText('Lead Academic Director').first()).toBeVisible();

		// Verify Markdown Body
		await expect(page.getByText('Scoring above 300 in JAMB requires discipline and strategic preparation.')).toBeVisible();
		await expect(page.getByRole('heading', { name: '1. Study the Official Syllabus' })).toBeVisible();

		// Verify Share Buttons
		await expect(page.getByTitle('Share on WhatsApp')).toBeVisible();
		await expect(page.getByTitle('Share on Twitter / X')).toBeVisible();
		await expect(page.getByTitle('Copy Article Link')).toBeVisible();

		// Verify Academy Enrollment CTA Banner
		await expect(page.getByRole('heading', { name: 'Achieve Your Dream Score at Trailblazers' })).toBeVisible();
		await expect(page.getByRole('article').getByRole('link', { name: 'Register Now' })).toBeVisible();
	});

	test('Admin CMS allows creating, editing, and deleting blog posts', async ({ page }) => {
		await setupAdminMocks(page);
		await page.goto('/admin/submissions?tab=blog');

		const blogHeading = page.getByRole('heading', { level: 1, name: 'Blog & Knowledge Hub Management' });

		// Ensure we are switched to the blog tab in staff portal
		const staffBlogLink = page.getByRole('banner').getByRole('link', { name: 'Blog' });
		if (await staffBlogLink.isVisible().catch(() => false)) {
			await staffBlogLink.click();
		} else {
			const mobileMenuBtn = page.getByRole('button', { name: 'Toggle App Menu' });
			if (await mobileMenuBtn.isVisible().catch(() => false)) {
				await mobileMenuBtn.click();
				await page.locator('div.fixed nav a[href*="tab=blog"]').first().click();
			}
		}

		// Verify Admin Blog Section Header
		await expect(blogHeading).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('How to Score 300+ in JAMB UTME 2026')).toBeVisible();

		// 1. CREATE NEW ARTICLE
		const newArticleBtn = page.getByRole('button', { name: /New Article/i });
		await expect(newArticleBtn).toBeVisible();
		await newArticleBtn.click();

		// Check Modal opened
		await expect(page.getByRole('heading', { name: 'Create New Article' })).toBeVisible();

		// Fill fields
		await page.fill('input[placeholder*="e.g. How to Score 300+"]', 'New Study Guide for Chemistry');
		await page.fill('textarea[placeholder*="Brief 1-2 sentence overview"]', 'A concise guide to organic chemistry reactions for secondary school students.');
		await page.fill('textarea[placeholder*="Write your article in markdown"]', '# Chemistry Study Guide\n\nMastering organic synthesis.');

		// Submit creation
		const submitCreateBtn = page.getByRole('button', { name: 'Publish Article' });
		await submitCreateBtn.click();

		// Verify Success Alert
		await expect(page.getByText(/created successfully/i)).toBeVisible();

		// 2. EDIT ARTICLE
		const editBtn = page.getByTitle('Edit article').first();
		await editBtn.click();

		// Verify Edit Modal opened
		await expect(page.getByRole('heading', { name: 'Edit Article' })).toBeVisible();
		const titleInput = page.locator('input[placeholder*="e.g. How to Score 300+"]');
		await titleInput.fill('How to Score 320+ in JAMB UTME 2026 (Updated)');

		// Save Edit
		const updateBtn = page.getByRole('button', { name: 'Update Article' });
		await updateBtn.click();

		// Verify Edit Success
		await expect(page.getByText(/updated successfully/i)).toBeVisible();

		// 3. DELETE ARTICLE
		const deleteBtn = page.getByTitle('Delete article').first();
		await deleteBtn.click();

		// Verify Delete Confirmation Dialog
		await expect(page.getByRole('heading', { name: 'Delete Article?' })).toBeVisible();
		const confirmDeleteBtn = page.getByRole('button', { name: 'Delete Article', exact: true });
		await confirmDeleteBtn.click();

		// Verify Delete Success
		await expect(page.getByText(/deleted successfully/i)).toBeVisible();
	});
});
