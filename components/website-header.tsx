'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn } from 'lucide-react';
import { getStudentLoginUrl, getStudentRegisterUrl } from '@/core/utils/subdomain';

const publicNavLinks = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About Us' },
	{ href: '/summer-coaching', label: 'Summer Lessons', badge: 'NEW' },
	{ href: '/programs', label: 'Programs' },
	{ href: '/gallery', label: 'Gallery' },
	{ href: '/contact', label: 'Contact' },
];

export function WebsiteHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
	const pathname = usePathname();

	// Close mobile menu on route change
	React.useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	// Lock body scroll when mobile menu is open
	React.useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [mobileMenuOpen]);

	return (
		<>
			<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Brand Logo & Name */}
				<Link href="/" className="text-lg font-bold text-foreground flex items-center gap-2.5">
					<Image
						className="dark:invert rounded-full"
						src="/trailblazer.jpeg"
						alt="Trailblazer Academy & Edukonsult"
						width={40}
						height={40}
					/>
					<span className="hidden sm:inline text-base font-extrabold tracking-tight">
						Trailblazer Academy
					</span>
					<span className="sm:hidden text-base font-extrabold">Trailblazer</span>
				</Link>

				{/* Desktop Public Navigation Links */}
				<nav className="hidden items-center gap-5 lg:gap-7 md:flex">
					{publicNavLinks.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`relative text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 py-1 ${
									isActive
										? 'text-primary font-bold border-b-2 border-primary'
										: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
								}`}
							>
								<span>{link.label}</span>
								{link.badge && (
									<span className="rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-2xs">
										{link.badge}
									</span>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Desktop Guest Actions: Sign In & Register */}
				<div className="hidden md:flex items-center gap-2.5">
					<a
						href={getStudentLoginUrl()}
						className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-foreground px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
					>
						<LogIn className="h-3.5 w-3.5 text-orange-500" />
						<span>Sign In</span>
					</a>
					<a
						href={getStudentRegisterUrl()}
						className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors shadow-sm cursor-pointer"
					>
						Register Now
					</a>
				</div>

				{/* Mobile Menu Button with Smooth Icon Transition */}
				<button
					className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-foreground relative cursor-pointer"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle navigation menu"
				>
					<div className="relative h-6 w-6">
						<Menu
							className={`h-6 w-6 transition-all duration-300 absolute inset-0 ${
								mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
							}`}
						/>
						<X
							className={`h-6 w-6 transition-all duration-300 absolute inset-0 ${
								mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
							}`}
						/>
					</div>
				</button>
			</div>
		</header>

		{/* Mobile Backdrop Blur & Darkening Overlay */}
		<div
			className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${
				mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}
			onClick={() => setMobileMenuOpen(false)}
			aria-hidden="true"
		/>

		{/* Mobile Public Navigation Drawer Panel with Smooth Slide/Fade Transition */}
		<div
			className={`fixed inset-x-0 top-16 z-50 md:hidden border-b border-border bg-background/98 p-4 space-y-4 shadow-2xl transition-all duration-300 ease-out origin-top max-h-[calc(100vh-4rem)] overflow-y-auto ${
				mobileMenuOpen
					? 'opacity-100 translate-y-0 pointer-events-auto'
					: 'opacity-0 -translate-y-3 pointer-events-none'
			}`}
		>
			<nav className="flex flex-col gap-2">
				{publicNavLinks.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className={`text-sm font-medium transition-colors hover:text-primary flex items-center justify-between py-2 px-1 ${
							pathname === link.href ? 'text-primary font-bold' : 'text-muted-foreground'
						}`}
						onClick={() => setMobileMenuOpen(false)}
					>
						<span>{link.label}</span>
						{link.badge && (
							<span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-2xs">
								{link.badge}
							</span>
						)}
					</Link>
				))}
			</nav>

			<div className="pt-3 border-t border-border space-y-2">
				<a
					href={getStudentLoginUrl()}
					onClick={() => setMobileMenuOpen(false)}
					className="block w-full text-center text-sm font-semibold py-2 border border-border rounded-md hover:bg-muted transition-colors"
				>
					Sign In
				</a>
				<a
					href={getStudentRegisterUrl()}
					onClick={() => setMobileMenuOpen(false)}
					className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center text-sm font-bold py-2.5 rounded-md transition-colors"
				>
					Register Now
				</a>
			</div>
		</div>
	</>
	);
}
