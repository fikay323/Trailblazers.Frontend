const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export type StaffRole = 'Admin' | 'Instructor';
export type StaffStatus = 'Active' | 'PendingInvite' | 'ExpiredInvite' | 'Suspended';

export interface StaffMemberDto {
	id: string;
	fullName: string;
	email: string;
	phoneNumber?: string | null;
	role: StaffRole;
	isActive: boolean;
	status: StaffStatus;
	createdAt: string;
	invitationId?: string | null;
	invitationExpiresAt?: string | null;
	emailDeliveryStatus?: string; // "Sent", "Failed", "Pending"
	emailDeliveryError?: string | null;
}

export interface StaffInvitationResponse {
	id: string;
	email: string;
	fullName: string;
	role: StaffRole;
	expiresAt: string;
	invitedByUserName: string;
	isAccepted: boolean;
	createdAt: string;
	inviteUrl?: string;
	emailSent: boolean;
	emailStatusMessage?: string;
}

export interface ResendInvitationResponse {
	message: string;
	inviteUrl?: string;
	emailSent: boolean;
	emailStatusMessage?: string;
}

export interface InviteStaffPayload {
	email: string;
	fullName: string;
	role: StaffRole;
}

export interface ValidateInvitationResponse {
	isValid: boolean;
	fullName: string;
	email: string;
	role: string;
	errorMessage?: string;
}

export interface AcceptInvitationPayload {
	token: string;
	email: string;
	password: string;
}

function getAuthHeaders(apiKey?: string): HeadersInit {
	const defaultKey = 'trailblazers-secret-key';
	const key = apiKey || defaultKey;
	if (key.startsWith('tb_') || key.startsWith('trailblazers-')) {
		return {
			'Content-Type': 'application/json',
			'X-API-KEY': key
		};
	}
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${key}`,
		'X-API-KEY': defaultKey
	};
}

/**
 * Fetch list of all instructors, administrators, and pending invitations.
 */
export async function getStaffRoster(apiKey?: string): Promise<StaffMemberDto[]> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff`, {
		headers: getAuthHeaders(apiKey),
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to fetch staff roster.');
	}

	return res.json();
}

/**
 * Send a branded invitation email to a new instructor or administrator.
 */
export async function inviteStaffMember(payload: InviteStaffPayload, apiKey?: string): Promise<StaffInvitationResponse> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff/invite`, {
		method: 'POST',
		headers: getAuthHeaders(apiKey),
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to send staff invitation.');
	}

	return res.json();
}

/**
 * Resend invitation email with a fresh 48-hour token.
 */
export async function resendStaffInvitation(invitationId: string, apiKey?: string): Promise<ResendInvitationResponse> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff/invitations/${invitationId}/resend`, {
		method: 'POST',
		headers: getAuthHeaders(apiKey),
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to resend staff invitation.');
	}

	return res.json();
}

/**
 * Delete a pending staff invitation.
 */
export async function deleteStaffInvitation(invitationId: string, apiKey?: string): Promise<{ message: string }> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff/invitations/${invitationId}`, {
		method: 'DELETE',
		headers: getAuthHeaders(apiKey),
		credentials: 'include'
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to delete staff invitation.');
	}

	return res.json();
}

/**
 * Switch staff role between Instructor and Admin.
 */
export async function updateStaffRole(staffId: string, newRole: StaffRole, apiKey?: string): Promise<StaffMemberDto> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff/${staffId}/role`, {
		method: 'PUT',
		headers: getAuthHeaders(apiKey),
		credentials: 'include',
		body: JSON.stringify({ role: newRole })
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to update staff role.');
	}

	return res.json();
}

/**
 * Activate or deactivate staff member account.
 */
export async function toggleStaffStatus(
	staffId: string,
	isActive: boolean,
	reason?: string,
	apiKey?: string
): Promise<{ message: string }> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff/${staffId}/status`, {
		method: 'PUT',
		headers: getAuthHeaders(apiKey),
		credentials: 'include',
		body: JSON.stringify({ isActive, reason })
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to update staff status.');
	}

	return res.json();
}

/**
 * Public: Validate invitation token and email for the password setup screen.
 */
export async function validateInvitation(token: string, email: string): Promise<ValidateInvitationResponse> {
	const params = new URLSearchParams({ token, email });
	const res = await fetch(`${getApiUrl()}/api/admin/staff/invitations/validate?${params.toString()}`);

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		return {
			isValid: false,
			fullName: '',
			email: '',
			role: '',
			errorMessage: data.errorMessage || 'Invalid or expired invitation link.'
		};
	}

	return data;
}

/**
 * Public: Accept invitation, set password, and receive auth session.
 */
export async function acceptInvitation(payload: AcceptInvitationPayload): Promise<any> {
	const res = await fetch(`${getApiUrl()}/api/admin/staff/invitations/accept`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to set password and activate account.');
	}

	return res.json();
}
