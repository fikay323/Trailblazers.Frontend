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
	profilePictureUrl?: string | null;
}

export interface ProfilePictureResponseDto {
	message: string;
	profilePictureUrl: string;
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

export async function uploadProfilePicture(
	imageBlob: Blob,
	token?: string,
	email?: string
): Promise<ProfilePictureResponseDto> {
	const formData = new FormData();
	formData.append('file', imageBlob, 'avatar.webp');

	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const queryParam = email ? `?email=${encodeURIComponent(email)}` : '';
	const res = await fetch(`${getApiUrl()}/api/students/me/profile-picture${queryParam}`, {
		method: 'POST',
		headers,
		body: formData,
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to upload profile picture.');
	}

	return res.json();
}

export async function deleteProfilePicture(
	token?: string,
	email?: string
): Promise<{ message: string }> {
	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const queryParam = email ? `?email=${encodeURIComponent(email)}` : '';
	const res = await fetch(`${getApiUrl()}/api/students/me/profile-picture${queryParam}`, {
		method: 'DELETE',
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to delete profile picture.');
	}

	return res.json();
}

export interface StudentNotificationDto {
	id: string;
	title: string;
	message: string;
	type: string;
	isRead: boolean;
	createdAt: string;
	createdBy?: string | null;
}

export async function getMyNotifications(email?: string, token?: string): Promise<StudentNotificationDto[]> {
	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const queryParam = email ? `?email=${encodeURIComponent(email)}` : '';
	try {
		const res = await fetch(`${getApiUrl()}/api/students/me/notifications${queryParam}`, {
			headers,
			credentials: 'include'
		});

		if (!res.ok) {
			return [];
		}

		const data = await res.json();
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

export async function markNotificationAsRead(id: string, token?: string): Promise<void> {
	const headers: Record<string, string> = {
		'Accept': 'application/json'
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	try {
		await fetch(`${getApiUrl()}/api/students/me/notifications/${id}/read`, {
			method: 'POST',
			headers,
			credentials: 'include'
		});
	} catch {
		// Non-fatal
	}
}

