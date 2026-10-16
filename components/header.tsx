'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import { getMainSiteUrl } from '@/core/utils/subdomain';
import { AppHeader } from './app-header';
import { WebsiteHeader } from './website-header';

function MinimalPortalHeader({ title, badge, badgeColor }: { title: string; badge: string; badgeColor: string }) {
	const homeUrl = getMainSiteUrl('/');

	return (
		<header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md text-slate-100 shadow-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<a
					href={homeUrl}
					className="flex items-center gap-3 cursor-pointer group focus:outline-none"
					title="Return to Trailblazer Academy Home"
				>
					<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-500/30 group-hover:ring-orange-500/60 transition-all aspect-square bg-slate-900">
						<Image
							className="rounded-full object-cover"
							src="/trailblazer.jpeg"
							alt="Trailblazer Academy"
							fill
							sizes="40px"
						/>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-extrabold text-base tracking-tight text-white group-hover:text-orange-400 transition-colors cursor-pointer">
								Trailblazer Academy
							</span>
							<span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
								{badge}
							</span>
						</div>
						<p className="text-[10px] text-slate-400 font-medium tracking-wide">
							{title}
						</p>
					</div>
				</a>
			</div>
		</header>
	);
}

/**
 * Top-level Header switcher:
 * - On Apex Marketing Website (trailblazer-academy.com or root): NEVER renders AppHeader. Always renders WebsiteHeader.
 * - On Staff Portal (staff.trailblazer-academy.com or /admin): Renders Staff AppHeader (if authenticated) or MinimalPortalHeader.
 * - On Student Portal (learn.trailblazer-academy.com or /student, /exam): Renders Student AppHeader (if authenticated) or MinimalPortalHeader.
 * - On Auth Pages (/auth/login, etc.): Renders MinimalPortalHeader with clickable logo/brand linking back to main site.
 */
export function Header() {
	const { user, isLoading } = useAuth();
	const pathname = usePathname();
	const [host, setHost] = React.useState('');

	React.useEffect(() => {
		if (typeof window !== 'undefined') {
			setHost(window.location.hostname.toLowerCase());
		}
	}, []);

	if (isLoading) {
		return <div className="h-16 w-full border-b border-slate-800/80 bg-slate-950" />;
	}

	const isStaff = host.startsWith('staff.') || pathname.startsWith('/admin');
	const isLearn = host.startsWith('learn.') || pathname.startsWith('/student') || pathname.startsWith('/exam');
	const isAuthPage = pathname.startsWith('/auth');
	const isPortal = isStaff || isLearn || isAuthPage;

	// On apex website (trailblazer-academy.com, www.trailblazer-academy.com, or root):
	// The LMS AppHeader must NEVER show. The marketing website must always show WebsiteHeader.
	if (!isPortal) {
		return <WebsiteHeader />;
	}

	// On portal subdomains or portal routes:
	// If authenticated and NOT on an auth page, show full LMS AppHeader
	if (user && !isAuthPage && (isStaff || isLearn)) {
		return <AppHeader />;
	}

	// If unauthenticated or on an auth page, show MinimalPortalHeader with link back to main site
	if (isStaff) {
		return (
			<MinimalPortalHeader
				title="Staff Management Portal"
				badge="Staff"
				badgeColor="bg-cyan-950 text-cyan-300 border border-cyan-800"
			/>
		);
	}

	return (
		<MinimalPortalHeader
			title="Student Learning Management System"
			badge="Student"
			badgeColor="bg-orange-950 text-orange-300 border border-orange-800"
		/>
	);
}
