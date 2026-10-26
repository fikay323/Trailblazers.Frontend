import {
	SiteAsset,
	UpdateSiteAssetPayload,
	ReorderItemPayload,
	MediaUploadResponse
} from '@/types/site-assets';

const getApiUrl = (): string => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

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
 * Public: Fetch all site assets with optional group filtering (ISR cached on Next.js server).
 */
export async function getSiteAssets(group?: string): Promise<SiteAsset[]> {
	const query = group ? `?group=${encodeURIComponent(group)}` : '';
	const res = await fetch(`${getApiUrl()}/api/site-assets${query}`, {
		headers: { 'Accept': 'application/json' },
		next: { revalidate: 60, tags: ['site-assets'] }
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch site assets.');
	}

	return res.json();
}

/**
 * Public: Fetch a single site asset by its key.
 */
export async function getSiteAssetByKey(key: string): Promise<SiteAsset | null> {
	if (!key) return null;
	const res = await fetch(`${getApiUrl()}/api/site-assets/${encodeURIComponent(key)}`, {
		headers: { 'Accept': 'application/json' },
		next: { revalidate: 60, tags: ['site-assets'] }
	});

	if (res.status === 404) {
		return null;
	}

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || `Failed to fetch site asset ${key}.`);
	}

	return res.json();
}

/**
 * Admin: Upload an image file directly to Cloudinary.
 */
export async function uploadMediaFile(
	fileBlob: Blob,
	fileName: string = 'image.webp',
	folder: string = 'site-assets',
	tokenOrApiKey?: string
): Promise<MediaUploadResponse> {
	const formData = new FormData();
	formData.append('file', fileBlob, fileName);
	formData.append('folder', folder);

	const key = tokenOrApiKey || 'trailblazers-secret-key';
	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};

	if (key.startsWith('tb_') || key.startsWith('trailblazers-')) {
		headers['X-API-KEY'] = key;
	} else {
		headers['Authorization'] = `Bearer ${key}`;
		headers['X-API-KEY'] = 'trailblazers-secret-key';
	}

	const res = await fetch(`${getApiUrl()}/api/admin/media/upload`, {
		method: 'POST',
		headers,
		body: formData
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to upload image.');
	}

	return res.json();
}

/**
 * Admin: Upsert a site asset slot or item.
 */
export async function upsertSiteAsset(
	key: string,
	payload: UpdateSiteAssetPayload,
	tokenOrApiKey?: string
): Promise<SiteAsset> {
	const res = await fetch(`${getApiUrl()}/api/admin/site-assets/${encodeURIComponent(key)}`, {
		method: 'PUT',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || `Failed to update site asset ${key}.`);
	}

	return res.json();
}

/**
 * Admin: Delete a site asset item.
 */
export async function deleteSiteAsset(
	key: string,
	tokenOrApiKey?: string
): Promise<void> {
	const res = await fetch(`${getApiUrl()}/api/admin/site-assets/${encodeURIComponent(key)}`, {
		method: 'DELETE',
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok && res.status !== 404) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || `Failed to delete site asset ${key}.`);
	}
}

/**
 * Admin: Batch reorder items.
 */
export async function reorderSiteAssets(
	items: ReorderItemPayload[],
	tokenOrApiKey?: string
): Promise<void> {
	const res = await fetch(`${getApiUrl()}/api/admin/site-assets/reorder`, {
		method: 'POST',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify({ items })
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to reorder site assets.');
	}
}

/**
 * Client & Server Helper: Safely resolves image URL for a given key, falling back to default.
 */
export function resolveAssetUrl(
	assets: SiteAsset[] | undefined,
	key: string,
	fallbackUrl: string
): string {
	if (!assets || assets.length === 0) {
		return fallbackUrl;
	}
	const match = assets.find((a) => a.key === key);
	return match?.imageUrl && match.imageUrl.trim() ? match.imageUrl.trim() : fallbackUrl;
}

/**
 * Client & Server Helper: Safely resolves the full asset object for a given key.
 */
export function resolveAsset(
	assets: SiteAsset[] | undefined,
	key: string,
	fallbackUrl: string,
	fallbackAlt: string = 'Trailblazer Academy',
	fallbackTitle: string = ''
): SiteAsset {
	const defaultAsset: SiteAsset = {
		key,
		group: key.includes('.') ? key.split('.')[0] : 'general',
		imageUrl: fallbackUrl,
		altText: fallbackAlt,
		title: fallbackTitle,
		sortOrder: 0,
		updatedAt: new Date().toISOString()
	};

	if (!assets || assets.length === 0) {
		return defaultAsset;
	}

	const match = assets.find((a) => a.key === key);
	if (!match) {
		return defaultAsset;
	}

	return {
		...match,
		imageUrl: match.imageUrl && match.imageUrl.trim() ? match.imageUrl.trim() : fallbackUrl,
		altText: match.altText && match.altText.trim() ? match.altText.trim() : fallbackAlt,
		title: match.title && match.title.trim() ? match.title.trim() : fallbackTitle
	};
}
