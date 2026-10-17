const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface BlogPostDto {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	coverImageUrl?: string | null;
	category: string;
	tags: string[];
	authorName: string;
	authorId?: string | null;
	isPublished: boolean;
	publishedAt?: string | null;
	createdAt: string;
	updatedAt?: string | null;
	viewCount: number;
}

export interface BlogPostCardDto {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	coverImageUrl?: string | null;
	category: string;
	tags: string[];
	authorName: string;
	isPublished: boolean;
	publishedAt?: string | null;
	createdAt: string;
	viewCount: number;
}

export interface CreateBlogPostPayload {
	title: string;
	slug?: string;
	excerpt: string;
	content: string;
	coverImageUrl?: string | null;
	category: string;
	tags?: string[];
	isPublished?: boolean;
}

export interface UpdateBlogPostPayload {
	title?: string;
	slug?: string;
	excerpt?: string;
	content?: string;
	coverImageUrl?: string | null;
	category?: string;
	tags?: string[];
	isPublished?: boolean;
}

export interface BlogCatalogResponse {
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	items: BlogPostCardDto[];
	categories: string[];
}

function getAuthHeaders(tokenOrApiKey?: string): HeadersInit {
	const key = tokenOrApiKey || 'trailblazers-secret-key';
	if (key.startsWith('tb_') || key.startsWith('trailblazers-')) {
		return {
			'Content-Type': 'application/json',
			'X-API-KEY': key
		};
	}
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${key}`,
		'X-API-KEY': 'trailblazers-secret-key'
	};
}

/**
 * Public: Fetch published blog posts with pagination, category filter, and search.
 */
export async function getPublishedPosts(
	page: number = 1,
	pageSize: number = 12,
	category?: string,
	search?: string
): Promise<BlogCatalogResponse> {
	const params = new URLSearchParams();
	params.append('page', page.toString());
	params.append('pageSize', pageSize.toString());
	if (category && category !== 'All') params.append('category', category);
	if (search && search.trim()) params.append('search', search.trim());

	const res = await fetch(`${getApiUrl()}/api/blog?${params.toString()}`, {
		headers: { 'Accept': 'application/json' },
		next: { revalidate: 60 } // Next.js ISR revalidation
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch blog posts.');
	}

	return res.json();
}

/**
 * Public: Fetch a single blog post by its URL slug.
 */
export async function getPostBySlug(slug: string): Promise<BlogPostDto> {
	const res = await fetch(`${getApiUrl()}/api/blog/${encodeURIComponent(slug)}`, {
		headers: { 'Accept': 'application/json' },
		next: { revalidate: 60 }
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch blog post.');
	}

	return res.json();
}

/**
 * Admin: Fetch blog posts with draft/published filtering.
 */
export async function getAdminPosts(
	page: number = 1,
	pageSize: number = 20,
	isPublished?: boolean,
	category?: string,
	search?: string,
	tokenOrApiKey?: string
): Promise<BlogCatalogResponse> {
	const params = new URLSearchParams();
	params.append('page', page.toString());
	params.append('pageSize', pageSize.toString());
	if (isPublished !== undefined) params.append('isPublished', isPublished.toString());
	if (category && category !== 'All') params.append('category', category);
	if (search && search.trim()) params.append('search', search.trim());

	const res = await fetch(`${getApiUrl()}/api/admin/blog?${params.toString()}`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch admin blog posts.');
	}

	return res.json();
}

/**
 * Admin: Get blog post by GUID id for editing.
 */
export async function getAdminPostById(
	id: string,
	tokenOrApiKey?: string
): Promise<BlogPostDto> {
	const res = await fetch(`${getApiUrl()}/api/admin/blog/${id}`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch post details.');
	}

	return res.json();
}

/**
 * Admin: Create a new blog post.
 */
export async function createBlogPost(
	payload: CreateBlogPostPayload,
	tokenOrApiKey?: string
): Promise<BlogPostDto> {
	const res = await fetch(`${getApiUrl()}/api/admin/blog`, {
		method: 'POST',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to create blog post.');
	}

	return res.json();
}

/**
 * Admin: Update an existing blog post (edit).
 */
export async function updateBlogPost(
	id: string,
	payload: UpdateBlogPostPayload,
	tokenOrApiKey?: string
): Promise<BlogPostDto> {
	const res = await fetch(`${getApiUrl()}/api/admin/blog/${id}`, {
		method: 'PUT',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to update blog post.');
	}

	return res.json();
}

/**
 * Admin: Delete a blog post.
 */
export async function deleteBlogPost(
	id: string,
	tokenOrApiKey?: string
): Promise<void> {
	const res = await fetch(`${getApiUrl()}/api/admin/blog/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to delete blog post.');
	}
}
