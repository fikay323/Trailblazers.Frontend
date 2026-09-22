const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';
export type VerificationType = 'Geolocated' | 'ManualStaff';

export interface ClockInPayload {
	latitude: number;
	longitude: number;
	accuracyMeters: number;
	clientTimestamp: string;
}

export interface AttendanceRecordDto {
	id: string;
	studentId: string;
	studentName: string;
	studentEmail: string;
	studentPhone?: string | null;
	date: string;
	clockInTime: string;
	clockOutTime?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	accuracyMeters?: number | null;
	distanceMeters?: number | null;
	clockOutLatitude?: number | null;
	clockOutLongitude?: number | null;
	clockOutAccuracyMeters?: number | null;
	clockOutDistanceMeters?: number | null;
	status: AttendanceStatus;
	verificationType: VerificationType;
	markedByUserName?: string | null;
	remarks?: string | null;
}

export interface RosterStudentItemDto {
	studentId: string;
	studentName: string;
	studentEmail: string;
	phoneNumber?: string | null;
	isActive: boolean;
	status: AttendanceStatus;
	clockInTime?: string | null;
	clockOutTime?: string | null;
	distanceMeters?: number | null;
	accuracyMeters?: number | null;
	verificationType?: VerificationType | null;
	markedByUserName?: string | null;
	remarks?: string | null;
	attendanceRecordId?: string | null;
}

export interface DailyRosterResponseDto {
	date: string;
	totalEnrolled: number;
	presentCount: number;
	lateCount: number;
	absentCount: number;
	excusedCount: number;
	students: RosterStudentItemDto[];
}

export interface AttendanceOverridePayload {
	studentId: string;
	date: string;
	status: AttendanceStatus;
	remarks?: string;
}

export interface AttendanceSettingDto {
	centerLatitude: number;
	centerLongitude: number;
	allowedRadiusMeters: number;
	maxAllowedAccuracyMeters: number;
	earliestClockInTime: string;
	lateCutoffTime: string;
	latestClockInTime: string;
	updatedAt: string;
	updatedBy?: string | null;
}

export interface StudentAttendanceStatsDto {
	date: string;
	hasClockedInToday: boolean;
	hasClockedOutToday: boolean;
	todayRecord?: AttendanceRecordDto | null;
	totalDays: number;
	presentDays: number;
	lateDays: number;
	absentDays: number;
	attendanceRate: number;
	punctualStreak: number;
}

export interface GpsLocationResult {
	latitude: number;
	longitude: number;
	accuracyMeters: number;
	clientTimestamp: string;
}

/**
 * Robust HTML5 Geolocation wrapper using device GPS with High Accuracy.
 */
export async function getCurrentGpsPosition(): Promise<GpsLocationResult> {
	if (typeof window === 'undefined' || !navigator.geolocation) {
		throw new Error('Geolocation is not supported by your browser or device.');
	}

	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					accuracyMeters: position.coords.accuracy,
					clientTimestamp: new Date(position.timestamp).toISOString()
				});
			},
			(err) => {
				switch (err.code) {
					case err.PERMISSION_DENIED:
						reject(new Error('Location access was denied. Please allow location permissions in your browser or device settings to clock in/out.'));
						break;
					case err.POSITION_UNAVAILABLE:
						reject(new Error('Unable to determine location. Please ensure device Location / GPS is turned ON and retry.'));
						break;
					case err.TIMEOUT:
						reject(new Error('GPS location request timed out. Please move near a window or outdoors and try again.'));
						break;
					default:
						reject(new Error('Failed to acquire device location. Please try again.'));
				}
			},
			{
				enableHighAccuracy: true,
				timeout: 12000,
				maximumAge: 0
			}
		);
	});
}

/**
 * Student: Clock in to tutorial center with device GPS coordinates.
 */
export async function clockInToAttendance(payload: ClockInPayload, token?: string): Promise<AttendanceRecordDto> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${getApiUrl()}/api/attendance/clock-in`, {
		method: 'POST',
		headers,
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to complete clock-in.');
	}

	return res.json();
}

/**
 * Student: Clock out from tutorial center with device GPS coordinates.
 */
export async function clockOutFromAttendance(payload: ClockInPayload, token?: string): Promise<AttendanceRecordDto> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${getApiUrl()}/api/attendance/clock-out`, {
		method: 'POST',
		headers,
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to complete clock-out.');
	}

	return res.json();
}

/**
 * Student: Get today's check-in status and attendance streak stats.
 */
export async function getStudentTodayStatus(token?: string): Promise<StudentAttendanceStatsDto> {
	const headers: Record<string, string> = {};
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${getApiUrl()}/api/attendance/my-today`, {
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch attendance status.');
	}

	return res.json();
}

function getAuthHeaders(tokenOrApiKey?: string): Record<string, string> {
	const headers: Record<string, string> = {};
	const savedApiKey = typeof window !== 'undefined' ? localStorage.getItem('admin_api_key') : null;
	const defaultApiKey = savedApiKey || 'trailblazers-secret-key';

	if (!tokenOrApiKey) {
		headers['X-API-KEY'] = defaultApiKey;
		return headers;
	}

	// If it's an explicit API key (e.g. starts with 'tb_' or 'trailblazers-')
	if (tokenOrApiKey.startsWith('tb_') || tokenOrApiKey.startsWith('trailblazers-')) {
		headers['X-API-KEY'] = tokenOrApiKey;
		return headers;
	}

	// Otherwise, it's a JWT Bearer token
	headers['Authorization'] = `Bearer ${tokenOrApiKey}`;
	headers['X-API-KEY'] = defaultApiKey;
	return headers;
}

/**
 * Staff / Admin: Get full daily attendance roster for a specific date (YYYY-MM-DD).
 */
export async function getDailyAttendanceRoster(date?: string, apiKey?: string): Promise<DailyRosterResponseDto> {
	const headers = getAuthHeaders(apiKey);

	const queryParam = date ? `?date=${encodeURIComponent(date)}` : '';
	const res = await fetch(`${getApiUrl()}/api/attendance/roster${queryParam}`, {
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to load attendance roster.');
	}

	return res.json();
}

/**
 * Staff / Admin: Manually mark or unmark student attendance.
 */
export async function overrideAttendanceStatus(payload: AttendanceOverridePayload, apiKey?: string): Promise<AttendanceRecordDto> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...getAuthHeaders(apiKey)
	};

	const res = await fetch(`${getApiUrl()}/api/attendance/override`, {
		method: 'POST',
		headers,
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to update attendance status.');
	}

	return res.json();
}

/**
 * Staff / Admin: Get academy geofence and timing configuration.
 */
export async function getAttendanceSettings(apiKey?: string): Promise<AttendanceSettingDto> {
	const headers = getAuthHeaders(apiKey);

	const res = await fetch(`${getApiUrl()}/api/attendance/settings`, {
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to load attendance settings.');
	}

	return res.json();
}

/**
 * Admin: Update academy geofence and schedule settings.
 */
export async function updateAttendanceSettings(payload: AttendanceSettingDto, apiKey?: string): Promise<AttendanceSettingDto> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...getAuthHeaders(apiKey)
	};

	const res = await fetch(`${getApiUrl()}/api/attendance/settings`, {
		method: 'PUT',
		headers,
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	return res.json();
}

/**
 * Staff / Admin: Export attendance report as CSV blob.
 */
export async function exportAttendanceReport(
	startDate?: string,
	endDate?: string,
	studentId?: string,
	searchTerm?: string,
	apiKey?: string
): Promise<Blob> {
	const headers = getAuthHeaders(apiKey);

	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	if (studentId) params.append('studentId', studentId);
	if (searchTerm) params.append('searchTerm', searchTerm);

	const res = await fetch(`${getApiUrl()}/api/attendance/report/export?${params.toString()}`, {
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to export attendance CSV report.');
	}

	return res.blob();
}
