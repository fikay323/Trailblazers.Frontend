const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface ContactSubmissionPayload {
	name: string;
	email: string;
	message: string;
	honeypot?: string;
	formLoadTimestamp?: number;
}

export interface RegisterSubmissionPayload {
	name: string;
	email: string;
	phoneNumber: string;
	targetExam: string;
	guardianName?: string;
	guardianPhone?: string;
	guardianEmail?: string;
	guardianRelationship?: string;
	dateOfBirth?: string;
	gender?: string;
	address?: string;
	lastSchool?: string;
	classCompleted?: string;
	subjectCombination?: string;
	classMode?: string;
	referral?: string;
	programmes?: string[];
	honeypot?: string;
	formLoadTimestamp?: number;
}

export interface GetSubmissionsParams {
	type?: string;
	searchTerm?: string;
	startDate?: string;
	endDate?: string;
	pageNumber?: number;
	pageSize?: number;
}

export async function submitContact(payload: ContactSubmissionPayload): Promise<any> {
	const response = await fetch(`${getApiUrl()}/api/submissions/contact`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}

export async function submitRegistration(payload: RegisterSubmissionPayload): Promise<any> {
	const response = await fetch(`${getApiUrl()}/api/submissions/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
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
		'Accept': 'application/json',
		'X-API-KEY': effectiveApiKey
	};

	if (effectiveToken) {
		headers['Authorization'] = `Bearer ${effectiveToken}`;
	}

	return headers;
}

export async function getSubmissions(params: GetSubmissionsParams, apiKey: string): Promise<any> {
	const queryParams = new URLSearchParams();
	if (params.type) queryParams.append('type', params.type);
	if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
	if (params.startDate) queryParams.append('startDate', params.startDate);
	if (params.endDate) queryParams.append('endDate', params.endDate);
	if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
	if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

	const response = await fetch(`${getApiUrl()}/api/submissions?${queryParams.toString()}`, {
		method: 'GET',
		headers: getAuthHeaders(apiKey),
		credentials: 'include'
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}

export async function deleteSubmission(id: string, apiKey: string): Promise<{ message: string }> {
	const response = await fetch(`${getApiUrl()}/api/submissions/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(apiKey),
		credentials: 'include'
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}

export async function createStudentAccount(
	id: string,
	apiKey?: string
): Promise<{ message: string; invitation: any }> {
	const response = await fetch(`${getApiUrl()}/api/submissions/${id}/create-student-account`, {
		method: 'POST',
		headers: getAuthHeaders(apiKey),
		credentials: 'include'
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}
