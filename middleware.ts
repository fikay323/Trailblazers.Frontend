import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getJwtRole(token: string): string | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
		const payload = JSON.parse(payloadJson);
		return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
	} catch {
		return null;
	}
}

export function middleware(request: NextRequest) {
	const url = request.nextUrl.clone();
	const hostname = request.headers.get('host') || '';
	const { pathname } = request.nextUrl;

	// Skip Next.js internal files, api routes, and static assets
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	const isStaffSubdomain = hostname.startsWith('staff.');
	const isLearnSubdomain = hostname.startsWith('learn.');

	const authToken = request.cookies.get('auth_token')?.value;
	const userRole = authToken ? getJwtRole(authToken) : null;

	// =========================================================================
	// 1. STAFF PORTAL SUBDOMAIN (staff.trailblazer-academy.com or staff.localhost)
	// =========================================================================
	if (isStaffSubdomain) {
		// If a Student account accesses the staff subdomain, block and redirect to student portal
		if (userRole === 'Student' && pathname !== '/auth/login' && pathname !== '/login') {
			const learnUrl = new URL('/student/dashboard', request.url);
			learnUrl.host = hostname.replace('staff.', 'learn.');
			return NextResponse.redirect(learnUrl);
		}

		// Rewrite root '/' to staff dashboard '/admin/submissions'
		if (pathname === '/' || pathname === '') {
			url.pathname = '/admin/submissions';
			return NextResponse.rewrite(url);
		}

		// Rewrite '/login' to '/auth/login'
		if (pathname === '/login') {
			url.pathname = '/auth/login';
			return NextResponse.rewrite(url);
		}

		return NextResponse.next();
	}

	// =========================================================================
	// 2. STUDENT LMS SUBDOMAIN (learn.trailblazer-academy.com or learn.localhost)
	// =========================================================================
	if (isLearnSubdomain) {
		// If Staff accesses student subdomain, allow or rewrite
		if (pathname === '/' || pathname === '' || pathname === '/dashboard') {
			url.pathname = '/student/dashboard';
			return NextResponse.rewrite(url);
		}

		if (pathname === '/login') {
			url.pathname = '/auth/login';
			return NextResponse.rewrite(url);
		}

		if (pathname === '/register') {
			url.pathname = '/auth/register';
			return NextResponse.rewrite(url);
		}

		return NextResponse.next();
	}

	// =========================================================================
	// 3. PUBLIC MARKETING SITE (trailblazer-academy.com or localhost:3000)
	// =========================================================================
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
	],
};
