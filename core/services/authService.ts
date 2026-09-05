const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export interface UserDto {
	id: string;
	email: string;
	fullName: string;
	role: string;
	isActive: boolean;
	disabledReason?: string | null;
}

export interface AuthResponseDto {
	token: string;
	refreshToken: string;
	user: UserDto;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	fullName: string;
	email: string;
	password: string;
	phoneNumber?: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponseDto> {
	const res = await fetch(`${getApiUrl()}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Failed to sign in. Please check your credentials.');
	}

	return res.json();
}

export async function register(payload: RegisterPayload): Promise<AuthResponseDto> {
	const res = await fetch(`${getApiUrl()}/api/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || 'Registration failed. Please try again.');
	}

	return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
	const res = await fetch(`${getApiUrl()}/api/auth/refresh-token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ refreshToken })
	});

	if (!res.ok) {
		throw new Error('Session expired. Please log in again.');
	}

	return res.json();
}

export async function getCurrentUser(token?: string): Promise<UserDto> {
	const headers: Record<string, string> = {};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(`${getApiUrl()}/api/auth/me`, {
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		throw new Error('Failed to fetch user profile.');
	}

	return res.json();
}

export async function logoutUser(): Promise<void> {
	try {
		await fetch(`${getApiUrl()}/api/auth/logout`, {
			method: 'POST',
			credentials: 'include'
		});
	} catch (e) {
		console.error('Logout error on backend:', e);
	}
}
