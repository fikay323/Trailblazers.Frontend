const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface AdminStudentListItem {
	id: string;
	fullName: string;
	email: string;
	phoneNumber?: string | null;
	isActive: boolean;
	disabledReason?: string | null;
	totalTestsTaken: number;
	averageScore: number;
	createdAt: string;
}

export interface StudentHistoryAttempt {
	sessionId: string;
	targetYear: number;
	totalScore: number;
	totalQuestions: number;
	percentage: number;
	completedAt: string;
	startTime: string;
}

export interface StudentHistoryResult {
	studentEmail: string;
	totalTestsTaken: number;
	averagePercentage: number;
	highestPercentage: number;
	attempts: StudentHistoryAttempt[];
}

export interface AdminQuestionItem {
	id: string;
	subject: string;
	examYear: number;
	questionText: string;
	correctOption: string;
	options: Record<string, string>;
	examType: string;
	questionNumber?: number | null;
	imageUrl?: string | null;
	comprehensionPassage?: string | null;
}

export interface QuestionsListResponse {
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	items: AdminQuestionItem[];
}

export interface CreateQuestionPayload {
	subject: string;
	examYear: number;
	questionText: string;
	correctOption: string;
	options: Record<string, string>;
	examType?: string;
	questionNumber?: number;
	imageUrl?: string;
	comprehensionPassage?: string;
}

function getAuthHeaders(tokenOrApiKey: string): HeadersInit {
	if (tokenOrApiKey.startsWith('tb_') || tokenOrApiKey.startsWith('trailblazers-')) {
		return {
			'Content-Type': 'application/json',
			'X-API-KEY': tokenOrApiKey
		};
	}
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${tokenOrApiKey}`,
		'X-API-KEY': 'trailblazers-secret-key'
	};
}

export async function getAllStudents(tokenOrApiKey: string): Promise<AdminStudentListItem[]> {
	const res = await fetch(`${getApiUrl()}/api/admin/students`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch student directory.');
	}

	return res.json();
}

export async function toggleStudentStatus(
	id: string,
	isActive: boolean,
	reason: string | undefined,
	tokenOrApiKey: string
): Promise<any> {
	const res = await fetch(`${getApiUrl()}/api/admin/students/${id}/status`, {
		method: 'POST',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify({ isActive, reason })
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to update student status.');
	}

	return res.json();
}

export async function getStudentHistory(email: string, tokenOrApiKey: string): Promise<StudentHistoryResult> {
	const res = await fetch(`${getApiUrl()}/api/admin/students/${encodeURIComponent(email)}/history`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch student exam history.');
	}

	return res.json();
}

export async function getQuestions(
	params: {
		subject?: string;
		year?: number;
		examType?: string;
		searchTerm?: string;
		pageNumber?: number;
		pageSize?: number;
	},
	tokenOrApiKey: string
): Promise<QuestionsListResponse> {
	const query = new URLSearchParams();
	if (params.subject) query.append('subject', params.subject);
	if (params.year) query.append('year', params.year.toString());
	if (params.examType) query.append('examType', params.examType);
	if (params.searchTerm) query.append('searchTerm', params.searchTerm);
	if (params.pageNumber) query.append('pageNumber', params.pageNumber.toString());
	if (params.pageSize) query.append('pageSize', params.pageSize.toString());

	const res = await fetch(`${getApiUrl()}/api/admin/questions?${query.toString()}`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch question bank.');
	}

	return res.json();
}

export async function createQuestion(
	payload: CreateQuestionPayload,
	tokenOrApiKey: string
): Promise<any> {
	const res = await fetch(`${getApiUrl()}/api/admin/questions`, {
		method: 'POST',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to create question.');
	}

	return res.json();
}

export async function deleteQuestion(id: string, tokenOrApiKey: string): Promise<any> {
	const res = await fetch(`${getApiUrl()}/api/admin/questions/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to delete question.');
	}

	return res.json();
}
