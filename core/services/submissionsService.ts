const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface ContactSubmissionPayload {
	name: string;
	email: string;
	message: string;
}

export interface RegisterSubmissionPayload {
	name: string;
	email: string;
	phoneNumber: string;
	targetExam: string;
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
		headers: {
			'Accept': 'application/json',
			'X-API-KEY': apiKey
		}
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}
