const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface GuardianReportAttemptDto {
	sessionId: string;
	targetYear: number;
	totalScore: number;
	totalQuestions: number;
	percentage: number;
	completedAt: string;
}

export interface GuardianReportPreviewDto {
	studentName: string;
	studentEmail: string;
	guardianName: string;
	guardianPhone: string;
	guardianEmail: string;
	guardianRelationship: string;
	startDate: string;
	endDate: string;
	totalTestsTaken: number;
	averagePercentage: number;
	highestPercentage: number;
	passRatePercentage: number;
	attendancePresentDays: number;
	attendanceLateDays: number;
	attempts: GuardianReportAttemptDto[];
}

export interface SendGuardianReportPayload {
	studentEmail: string;
	guardianName?: string;
	guardianPhone?: string;
	guardianEmail?: string;
	startDate: string;
	endDate: string;
	channel: 'Email' | 'Sms' | 'Both';
	customRemarks?: string;
}

export interface SendGuardianReportResponse {
	success: boolean;
	message: string;
	emailSent: boolean;
	smsSent: boolean;
	deliveredTo: string;
	reportSummary?: GuardianReportPreviewDto;
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
 * Fetch a student's academic & attendance performance report preview for a selected timeframe.
 */
export async function getGuardianReportPreview(
	studentEmail: string,
	startDate?: string,
	endDate?: string,
	tokenOrApiKey?: string
): Promise<GuardianReportPreviewDto> {
	const params = new URLSearchParams();
	params.append('studentEmail', studentEmail);
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const res = await fetch(`${getApiUrl()}/api/admin/guardian-reports/preview?${params.toString()}`, {
		headers: getAuthHeaders(tokenOrApiKey)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch guardian report preview.');
	}

	return res.json();
}

/**
 * Dispatch an academic & attendance performance report to a student's guardian via Email, SMS, or Both.
 */
export async function sendGuardianReport(
	payload: SendGuardianReportPayload,
	tokenOrApiKey?: string
): Promise<SendGuardianReportResponse> {
	const res = await fetch(`${getApiUrl()}/api/admin/guardian-reports/send`, {
		method: 'POST',
		headers: getAuthHeaders(tokenOrApiKey),
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || err.message || 'Failed to dispatch guardian report.');
	}

	return res.json();
}
