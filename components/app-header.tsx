'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
	LayoutDashboard,
	GraduationCap,
	Users,
	BookOpen,
	FileText,
	Mail,
	LogOut,
	Menu,
	X,
	ShieldCheck,
	CheckCircle2,
	AlertCircle
} from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';

export function AppHeader() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentTab = searchParams.get('tab') || 'students';
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

	if (!user) return null;

	const isAdminOrTutor =
		user.role === 'Admin' ||
		user.role === 'Instructor' ||
		user.role === 'Staff' ||
		pathname.startsWith('/admin');

	const studentNavLinks = [
		{
			href: '/student/dashboard',
			label: 'Dashboard',
			icon: LayoutDashboard,
			isActive: pathname === '/student/dashboard'
		},
		{
			href: '/exam',
			label: 'Take CBT Exam',
			icon: GraduationCap,
			isActive: pathname === '/exam' || pathname.startsWith('/exam/')
		}
	];

	const staffNavLinks = [
		{
			href: '/admin/submissions?tab=students',
			label: 'Students Directory',
			icon: Users,
			isActive: pathname.startsWith('/admin') && currentTab === 'students'
		},
		{
			href: '/admin/submissions?tab=questions',
			label: 'Question Bank',
			icon: BookOpen,
			isActive: pathname.startsWith('/admin') && currentTab === 'questions'
		},
		{
			href: '/admin/submissions?tab=registration',
			label: 'Registrations',
			icon: FileText,
			isActive: pathname.startsWith('/admin') && currentTab === 'registration'
		},
		{
			href: '/admin/submissions?tab=contact',
			label: 'Inquiries',
			icon: Mail,
			isActive: pathname.startsWith('/admin') && currentTab === 'contact'
		}
	];

	const currentLinks = isAdminOrTutor ? staffNavLinks : studentNavLinks;

	return (
		<header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md text-slate-100 shadow-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* LMS Brand */}
				<div className="flex items-center gap-8">
					<Link
						href={isAdminOrTutor ? '/admin/submissions' : '/student/dashboard'}
						className="flex items-center gap-3 group focus:outline-none"
					>
						<div className="relative">
							<Image
								className="rounded-full ring-2 ring-orange-500/30 group-hover:ring-orange-500/60 transition-all"
								src="/trailblazer.jpeg"
								alt="Trailblazer LMS"
								width={36}
								height={36}
							/>
							<span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${
								user.isActive ? 'bg-emerald-500' : 'bg-red-500'
							}`} />
						</div>

						<div>
							<div className="flex items-center gap-1.5">
								<span className="font-extrabold tracking-tight text-white text-base">Trailblazer</span>
								<span className="font-black text-orange-500 text-xs tracking-wider bg-orange-950/60 px-1.5 py-0.2 rounded border border-orange-800/60">
									LMS
								</span>
							</div>
							<p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
								{isAdminOrTutor ? 'Staff Management' : 'Student Portal'}
							</p>
						</div>
					</Link>

					{/* Desktop App Navigation Links (No Website Links) */}
					<nav className="hidden md:flex items-center gap-2">
						{currentLinks.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.label}
									href={item.href}
									className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
										item.isActive
											? 'bg-slate-800 text-white shadow-sm border border-slate-700'
											: 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
									}`}
								>
									<Icon className={`h-4 w-4 ${item.isActive ? 'text-orange-400' : 'text-slate-500'}`} />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* User Profile Info & Sign Out Button */}
				<div className="hidden md:flex items-center gap-3">
					{/* Profile Chip */}
					<div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800/80 shadow-inner">
						<div
							className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
								isAdminOrTutor ? 'bg-cyan-600' : 'bg-orange-600'
							}`}
						>
							{(user.fullName || user.email)?.charAt(0).toUpperCase() || 'U'}
						</div>

						<div className="flex flex-col text-left">
							<span className="font-bold text-xs text-white max-w-[140px] truncate leading-tight">
								{user.fullName || user.email}
							</span>
							<div className="flex items-center gap-1.5 mt-0.5">
								<span
									className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded border leading-none ${
										isAdminOrTutor
											? 'bg-cyan-950 text-cyan-300 border-cyan-800'
											: 'bg-orange-950 text-orange-300 border-orange-800'
									}`}
								>
									{user.role}
								</span>
								<span className="text-[10px] text-slate-500">•</span>
								<span
									className={`text-[10px] font-medium ${
										user.isActive ? 'text-emerald-400' : 'text-red-400'
									}`}
								>
									{user.isActive ? 'Active' : 'Suspended'}
								</span>
							</div>
						</div>
					</div>

					{/* Sign Out CTA */}
					<button
						onClick={logout}
						className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition-all cursor-pointer"
						title="Sign Out of Session"
					>
						<LogOut className="h-4 w-4" />
						<span>Sign Out</span>
					</button>
				</div>

				{/* Mobile Hamburger Button */}
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
					aria-label="Toggle App Menu"
				>
					{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</div>

			{/* Mobile App Drawer (Zero Website Links) */}
			{mobileMenuOpen && (
				<div className="border-t border-slate-800 md:hidden bg-slate-950/98 p-4 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
					{/* User Card */}
					<div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
						<div
							className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white shrink-0 ${
								isAdminOrTutor ? 'bg-cyan-600' : 'bg-orange-600'
							}`}
						>
							{(user.fullName || user.email)?.charAt(0).toUpperCase() || 'U'}
						</div>
						<div className="overflow-hidden">
							<div className="text-sm font-bold text-white truncate">{user.fullName || user.email}</div>
							<div className="text-xs text-slate-400 font-mono truncate">{user.email}</div>
							<div className="flex items-center gap-2 mt-1">
								<span
									className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded border ${
										isAdminOrTutor
											? 'bg-cyan-950 text-cyan-300 border-cyan-800'
											: 'bg-orange-950 text-orange-300 border-orange-800'
									}`}
								>
									{user.role}
								</span>
								<span
									className={`text-[10px] font-semibold ${
										user.isActive ? 'text-emerald-400' : 'text-red-400'
									}`}
								>
									{user.isActive ? 'Account Active' : 'Account Suspended'}
								</span>
							</div>
						</div>
					</div>

					{/* Navigation Links */}
					<nav className="flex flex-col gap-1.5 pt-1">
						{currentLinks.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.label}
									href={item.href}
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
										item.isActive
											? 'bg-slate-800 text-white border border-slate-700'
											: 'text-slate-300 hover:bg-slate-900 hover:text-white'
									}`}
								>
									<Icon className={`h-4 w-4 ${item.isActive ? 'text-orange-400' : 'text-slate-400'}`} />
									<span>{item.label}</span>
								</Link>
							);
						})}
					</nav>

					{/* Mobile Sign Out Button */}
					<div className="pt-2 border-t border-slate-800/80">
						<button
							onClick={() => {
								logout();
								setMobileMenuOpen(false);
							}}
							className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 py-3 rounded-lg bg-red-950/30 border border-red-900/60 transition-colors cursor-pointer"
						>
							<LogOut className="h-4 w-4" />
							<span>Sign Out</span>
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
