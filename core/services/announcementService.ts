const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export type AnnouncementPriority =
	| 'General'
	| 'Urgent'
	| 'FeeReminder'
	| 'Holiday'
	| 'MockExamSchedule';

export interface AnnouncementDto {
	id: string;
	title: string;
	content: string;
	priority: AnnouncementPriority;
	priorityName: string;
	targetAudience: string;
	isActive: boolean;
	createdAt: string;
	expiresAt?: string | null;
	authorName: string;
	sentEmailBroadcast: boolean;
	sentSmsBroadcast: boolean;
}

export interface CreateAnnouncementPayload {
	title: string;
	content: string;
	priority: AnnouncementPriority;
	targetAudience?: string;
	expiresAt?: string | null;
	sendEmailBroadcast: boolean;
	sendSmsBroadcast: boolean;
}

export interface AnnouncementsListResponse {
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	items: AnnouncementDto[];
}

function getAuthHeaders(tokenOrApiKey?: string): HeadersInit {
	const savedApiKey = typeof window !== 'undefined' ? localStorage.getItem('admin_api_key') : null;
	const savedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
	const defaultApiKey = savedApiKey || 'trailblazers-secret-key';

	let effectiveApiKey = defaultApiKey;
	let effectiveToken = savedToken;

	if (tokenOrApiKey) {
		if (tokenOrApiKey.startsWith('tb_') || tokenOrApiKey.startsWith('trailblazers-')) {
			effectiveApiKey = tokenOrApiKey;
		} else {
			effectiveToken = tokenOrApiKey;
		}
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'X-API-KEY': effectiveApiKey
	};

	if (effectiveToken) {
		headers['Authorization'] = `Bearer ${effectiveToken}`;
	}

	return headers;
}

/**
 * Public / Student: Fetch active announcements filtered optionally by target audience.
 */
export async function getActiveAnnouncements(
	audience?: string,
	token?: string
): Promise<AnnouncementDto[]> {
	const params = new URLSearchParams();
	if (audience) params.append('targetAudience', audience);

	const headers: Record<string, string> = { 'Accept': 'application/json' };
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${getApiUrl()}/api/announcements?${params.toString()}`, {
		headers
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch active announcements.');
	}

	return res.json();
}

/**
 * Admin: Fetch all announcements with pagination.
 */
export async function getAllAnnouncements(
	pageNumber: number = 1,
	pageSize: number = 20,
	tokenOrApiKey?: string
): Promise<AnnouncementsListResponse> {
	const params = new URLSearchParams();
	params.append('pageNumber', pageNumber.toString());
	params.append('pageSize', pageSize.toString());

	const res = await fetch(`${getApiUrl()}/api/admin/announcements?${params.toString()}`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch announcements.');
	}

	return res.json();
}

/**
 * Admin: Create a new announcement and optionally trigger email/SMS broadcasts.
 */
export async function createAnnouncement(
	payload: CreateAnnouncementPayload,
	tokenOrApiKey?: string
): Promise<AnnouncementDto> {
	const res = await fetch(`${getApiUrl()}/api/admin/announcements`, {
		method: 'POST',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to create announcement.');
	}

	return res.json();
}

/**
 * Admin: Delete an announcement.
 */
export async function deleteAnnouncement(
	id: string,
	tokenOrApiKey?: string
): Promise<void> {
	const res = await fetch(`${getApiUrl()}/api/admin/announcements/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to delete announcement.');
	}
}
