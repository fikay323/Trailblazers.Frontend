const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface StudentExamAttemptDto {
	sessionId: string;
	targetYear: number;
	totalScore: number;
	totalQuestions: number;
	percentage: number;
	completedAt: string;
	startTime: string;
}

export interface StudentHistoryResponseDto {
	studentEmail: string;
	totalTestsTaken: number;
	averagePercentage: number;
	highestPercentage: number;
	attempts: StudentExamAttemptDto[];
}

export interface StudentProfileDto {
	id: string;
	email: string;
	fullName: string;
	phoneNumber?: string | null;
	isActive: boolean;
	disabledReason?: string | null;
	createdAt: string;
}

export async function getMyExamHistory(email?: string, token?: string): Promise<StudentHistoryResponseDto> {
	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const queryParam = email ? `?email=${encodeURIComponent(email)}` : '';
	const res = await fetch(`${getApiUrl()}/api/students/me/exam-history${queryParam}`, {
		headers
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to retrieve exam history.');
	}

	return res.json();
}

export async function getMyProfile(email?: string, token?: string): Promise<StudentProfileDto> {
	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const queryParam = email ? `?email=${encodeURIComponent(email)}` : '';
	const res = await fetch(`${getApiUrl()}/api/students/me/profile${queryParam}`, {
		headers
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to load profile.');
	}

	return res.json();
}
