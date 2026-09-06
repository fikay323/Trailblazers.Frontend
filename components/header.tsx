'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import { AppHeader } from './app-header';
import { WebsiteHeader } from './website-header';

function MinimalPortalHeader({ title, badge, badgeColor }: { title: string; badge: string; badgeColor: string }) {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md text-slate-100 shadow-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-3">
					<div className="relative">
						<Image
							className="rounded-full ring-2 ring-orange-500/30"
							src="/trailblazer.jpeg"
							alt="Trailblazer LMS"
							width={36}
							height={36}
						/>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-extrabold text-base tracking-tight text-white">Trailblazer</span>
							<span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
								{badge}
							</span>
						</div>
						<p className="text-[10px] text-slate-400 font-medium tracking-wide">
							{title}
						</p>
					</div>
				</div>
			</div>
		</header>
	);
}

/**
 * Top-level Header switcher:
 * - If a user is logged in: Renders dedicated AppHeader (LMS portal topbar with role-specific options).
 * - On Staff Portal: Renders Staff AppHeader or Minimal Staff Header (NEVER WebsiteHeader).
 * - On Student Portal: Renders Student AppHeader or Minimal Student Header (NEVER WebsiteHeader).
 * - On Apex Marketing Website: Renders promotional WebsiteHeader only.
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

	if (user) {
		return <AppHeader />;
	}

	const isStaff = host.startsWith('staff.') || pathname.startsWith('/admin');
	if (isStaff) {
		return (
			<MinimalPortalHeader
				title="Staff Management Portal"
				badge="Staff"
				badgeColor="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
			/>
		);
	}

	const isLearn = host.startsWith('learn.') || pathname.startsWith('/student') || pathname.startsWith('/exam');
	if (isLearn) {
		return (
			<MinimalPortalHeader
				title="Student Portal"
				badge="LMS"
				badgeColor="bg-orange-500/20 text-orange-400 border border-orange-500/30"
			/>
		);
	}

	return <WebsiteHeader />;
}
