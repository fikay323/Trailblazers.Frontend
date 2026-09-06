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
	latitude?: number | null;
	longitude?: number | null;
	accuracyMeters?: number | null;
	distanceMeters?: number | null;
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
						reject(new Error('Location access was denied. Please allow location permissions in your browser or device settings to clock in.'));
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

/**
 * Staff / Admin: Get full daily attendance roster for a specific date (YYYY-MM-DD).
 */
export async function getDailyAttendanceRoster(date?: string, apiKey?: string): Promise<DailyRosterResponseDto> {
	const headers: Record<string, string> = {};
	if (apiKey) {
		headers['X-API-KEY'] = apiKey;
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

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
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (apiKey) {
		headers['X-API-KEY'] = apiKey;
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

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
	const headers: Record<string, string> = {};
	if (apiKey) {
		headers['X-API-KEY'] = apiKey;
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

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
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (apiKey) {
		headers['X-API-KEY'] = apiKey;
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

	const res = await fetch(`${getApiUrl()}/api/attendance/settings`, {
		method: 'PUT',
		headers,
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to save attendance settings.');
	}

	return res.json();
}
