import { UserDto } from '../services/authService';

/**
 * Resolves destination URLs across subdomains based on the current environment.
 */
export function getPortalUrl(role: 'Student' | 'Admin' | 'Instructor' | string, path?: string): string {
	if (typeof window === 'undefined') {
		return role === 'Student' ? '/student/dashboard' : '/admin/submissions';
	}

	const { hostname, protocol, port } = window.location;
	const portSuffix = port ? `:${port}` : '';
	const defaultPath = role === 'Student' ? '/student/dashboard' : '/admin/submissions';
	const targetPath = path || defaultPath;

	const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
	const isProduction = hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com');

	if (isLocalhost) {
		const targetSubdomain = role === 'Student' ? 'learn' : 'staff';
		return `${protocol}//${targetSubdomain}.localhost${portSuffix}${targetPath}`;
	}

	if (isProduction) {
		const targetSubdomain = role === 'Student' ? 'learn' : 'staff';
		return `https://${targetSubdomain}.trailblazer-academy.com${targetPath}`;
	}

	return targetPath;
}

/**
 * Returns the direct URL to the Student Portal Login page.
 */
export function getStudentLoginUrl(): string {
	if (typeof window === 'undefined') return '/auth/login';

	const { hostname, protocol, port } = window.location;
	const portSuffix = port ? `:${port}` : '';

	if (hostname.startsWith('learn.')) return '/auth/login';
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		return `${protocol}//learn.localhost${portSuffix}/auth/login`;
	}
	if (hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com')) {
		return `https://learn.trailblazer-academy.com/auth/login`;
	}
	return '/auth/login';
}

/**
 * Returns the direct URL to the Student Portal Registration page.
 */
export function getStudentRegisterUrl(): string {
	if (typeof window === 'undefined') return '/auth/register';

	const { hostname, protocol, port } = window.location;
	const portSuffix = port ? `:${port}` : '';

	if (hostname.startsWith('learn.')) return '/auth/register';
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		return `${protocol}//learn.localhost${portSuffix}/auth/register`;
	}
	if (hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com')) {
		return `https://learn.trailblazer-academy.com/auth/register`;
	}
	return '/auth/register';
}

/**
 * Returns the direct URL to the Staff Portal Login page.
 */
export function getStaffLoginUrl(): string {
	if (typeof window === 'undefined') return '/auth/login';

	const { hostname, protocol, port } = window.location;
	const portSuffix = port ? `:${port}` : '';

	if (hostname.startsWith('staff.')) return '/auth/login';
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		return `${protocol}//staff.localhost${portSuffix}/auth/login`;
	}
	if (hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com')) {
		return `https://staff.trailblazer-academy.com/auth/login`;
	}
	return '/auth/login';
}

export interface SharedSessionData {
	token: string;
	user: UserDto;
}

const COOKIE_NAME = 'tb_shared_session';

/**
 * Writes a wildcard first-party cookie so that subdomains (learn, staff, apex) can share the session.
 */
export function setSharedAuthCookie(token: string, user: UserDto): void {
	if (typeof document === 'undefined' || typeof window === 'undefined') return;

	try {
		const { hostname, protocol } = window.location;
		const isSecure = protocol === 'https:';
		const sessionData: SharedSessionData = { token, user };
		const encodedValue = encodeURIComponent(JSON.stringify(sessionData));
		const maxAge = 60 * 60 * 24 * 7; // 7 days

		// Determine cookie domain attribute
		let domainAttr = '';
		if (hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com')) {
			domainAttr = '; domain=.trailblazer-academy.com';
		} else if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
			domainAttr = '; domain=localhost';
		}

		const cookieString = `${COOKIE_NAME}=${encodedValue}${domainAttr}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
		document.cookie = cookieString;

		// Fallback: Also write host-only cookie for environments with strict subdomain policies
		if (domainAttr) {
			document.cookie = `${COOKIE_NAME}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
		}
	} catch (e) {
		console.warn('Failed to write shared auth cookie:', e);
	}
}

/**
 * Reads the shared session cookie across subdomains.
 */
export function getSharedAuthCookie(): SharedSessionData | null {
	if (typeof document === 'undefined') return null;

	try {
		const prefix = `${COOKIE_NAME}=`;
		const cookies = document.cookie.split(';');
		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.startsWith(prefix)) {
				const raw = cookie.substring(prefix.length);
				const decoded = decodeURIComponent(raw);
				return JSON.parse(decoded) as SharedSessionData;
			}
		}
	} catch (e) {
		console.warn('Failed to read shared auth cookie:', e);
	}
	return null;
}

/**
 * Clears the shared session cookie across all subdomains.
 */
export function clearSharedAuthCookie(): void {
	if (typeof document === 'undefined' || typeof window === 'undefined') return;

	try {
		const { hostname } = window.location;
		let domainAttr = '';
		if (hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com')) {
			domainAttr = '; domain=.trailblazer-academy.com';
		} else if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
			domainAttr = '; domain=localhost';
		}

		document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;
		document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	} catch (e) {
		console.warn('Failed to clear shared auth cookie:', e);
	}
}
