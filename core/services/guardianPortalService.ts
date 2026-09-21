const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface GuardianAccessRequest {
	studentEmail: string;
	guardianContact: string; // Phone or Email
}

export interface GuardianWardExam {
	sessionId: string;
	targetYear: number;
	totalScore: number;
	totalQuestions: number;
	percentage: number;
	passed: boolean;
	completedAt: string;
}

export interface GuardianWardAttendance {
	id: string;
	date: string;
	clockInTime: string;
	clockOutTime?: string;
	status: string;
	remarks?: string;
}

export interface GuardianWardAnnouncement {
	id: string;
	title: string;
	content: string;
	priority: string;
	targetAudience: string;
	authorName: string;
	createdAt: string;
}

export interface GuardianWardOverview {
	studentName: string;
	studentEmail: string;
	studentPhone: string;
	targetExam: string;
	status: string;
	enrolledAt?: string;

	guardianName: string;
	guardianRelationship: string;
	guardianPhone: string;
	guardianEmail: string;

	totalExamsTaken: number;
	averageScorePercentage: number;
	highestScorePercentage: number;
	passRatePercentage: number;
	recentExams: GuardianWardExam[];

	totalAttendanceRecorded: number;
	presentDays: number;
	lateDays: number;
	attendanceRatePercentage: number;
	recentAttendance: GuardianWardAttendance[];

	announcements: GuardianWardAnnouncement[];
}

export interface GuardianAccessResponse {
	success: boolean;
	message: string;
	accessToken?: string;
	wardOverview?: GuardianWardOverview;
}

export interface GuardianInquiryPayload {
	studentEmail: string;
	guardianName?: string;
	guardianPhone?: string;
	guardianEmail?: string;
	subject: string;
	message: string;
}

export interface GuardianInquiryResponse {
	success: boolean;
	message: string;
}

const GUARDIAN_TOKEN_KEY = 'tb_guardian_access_token';
const GUARDIAN_STUDENT_EMAIL_KEY = 'tb_guardian_student_email';

export function saveGuardianSession(token: string, studentEmail: string) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(GUARDIAN_TOKEN_KEY, token);
		localStorage.setItem(GUARDIAN_STUDENT_EMAIL_KEY, studentEmail);
	}
}

export function getGuardianSession(): { token: string | null; studentEmail: string | null } {
	if (typeof window === 'undefined') {
		return { token: null, studentEmail: null };
	}
	return {
		token: localStorage.getItem(GUARDIAN_TOKEN_KEY),
		studentEmail: localStorage.getItem(GUARDIAN_STUDENT_EMAIL_KEY)
	};
}

export function clearGuardianSession() {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(GUARDIAN_TOKEN_KEY);
		localStorage.removeItem(GUARDIAN_STUDENT_EMAIL_KEY);
	}
}

/**
 * Verify guardian credentials (student email + guardian phone or email)
 */
export async function verifyGuardianAccess(payload: GuardianAccessRequest): Promise<GuardianAccessResponse> {
	const res = await fetch(`${getApiUrl()}/api/guardian/access`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || data.message || 'Failed to verify guardian credentials.');
	}

	return data;
}

/**
 * Fetch ward overview using an active access token
 */
export async function getWardOverview(accessToken: string): Promise<GuardianWardOverview> {
	const res = await fetch(`${getApiUrl()}/api/guardian/ward-overview?token=${encodeURIComponent(accessToken)}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || 'Failed to retrieve ward overview.');
	}

	return data;
}

/**
 * Submit an inquiry from a guardian to the academy administration
 */
export async function submitGuardianInquiry(payload: GuardianInquiryPayload): Promise<GuardianInquiryResponse> {
	const res = await fetch(`${getApiUrl()}/api/guardian/inquiry`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || data.message || 'Failed to submit inquiry.');
	}

	return data;
}
