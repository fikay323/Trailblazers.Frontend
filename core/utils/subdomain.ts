/**
 * Utility to resolve cross-subdomain portal URLs based on the current environment and user role.
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

	// Fallback for Vercel preview URLs (*.vercel.app) or IP addresses
	return targetPath;
}
