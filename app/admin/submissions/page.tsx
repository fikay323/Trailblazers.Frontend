'use client';

import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Lock, RefreshCw, Users, BookOpen, UserPlus, Mail, ShieldCheck, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StudentManagementView } from '@/features/admin-dashboard/components/StudentManagementView';
import { QuestionBankView } from '@/features/admin-dashboard/components/QuestionBankView';
import { ContactSubmissionsView } from '@/features/admin-dashboard/components/ContactSubmissionsView';
import { RegistrationSubmissionsView } from '@/features/admin-dashboard/components/RegistrationSubmissionsView';
import { AttendanceManagementView } from '@/features/admin-dashboard/components/AttendanceManagementView';

type AdminTab = 'students' | 'questions' | 'registration' | 'contact' | 'attendance';

function SubmissionsDashboardContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { user, token, logout: authLogout } = useAuth();

	// Authentication State
	const [apiKey, setApiKey] = useState('');
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [apiKeyInput, setApiKeyInput] = useState('');

	// Active tab derived from query parameter ?tab (defaults to 'students')
	const tabParam = searchParams.get('tab') as AdminTab | null;
	const activeTab: AdminTab =
		tabParam && ['students', 'questions', 'registration', 'contact', 'attendance'].includes(tabParam)
			? tabParam
			: 'students';

	// Auto-authorize if user is logged in as Admin or Instructor
	useEffect(() => {
		if (user && (user.role === 'Admin' || user.role === 'Instructor')) {
			setApiKey(token || 'trailblazers-secret-key');
			setIsAuthorized(true);
			return;
		}

		const savedKey = localStorage.getItem('admin_api_key');
		if (savedKey) {
			setApiKey(savedKey);
			setIsAuthorized(true);
		}
	}, [user, token]);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		if (!apiKeyInput.trim()) return;

		const key = apiKeyInput.trim();
		setApiKey(key);
		setIsAuthorized(true);
		localStorage.setItem('admin_api_key', key);
	};

	const handleLogout = () => {
		setApiKey('');
		setIsAuthorized(false);
		setApiKeyInput('');
		localStorage.removeItem('admin_api_key');
		if (user) {
			authLogout();
		} else if (typeof window !== 'undefined') {
			window.location.href = '/auth/login';
		}
	};

	const switchTab = (tab: AdminTab) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', tab);
		router.push(`${pathname}?${params.toString()}`);
	};

	if (!isAuthorized) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
				<Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-2xl">
					<CardHeader className="space-y-1 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-600/10 text-orange-500 border border-orange-500/20">
							<ShieldCheck className="h-6 w-6" />
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-white">Academy Admin & Tutor Portal</CardTitle>
						<CardDescription className="text-slate-400">
							Enter your Admin API Key or sign in with an instructor account.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form onSubmit={handleLogin} className="space-y-4">
							<Input
								type="password"
								placeholder="Enter API Key (e.g. trailblazers-secret-key)"
								value={apiKeyInput}
								onChange={(e) => setApiKeyInput(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
							/>
							<Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
								Unlock Portal
							</Button>
						</form>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-slate-800" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							onClick={() => router.push('/auth/login')}
							className="w-full border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
						>
							Sign in with Staff Account
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Streamlined Dynamic Section Header */}
				{(() => {
					const sectionMeta: Record<AdminTab, { title: string; subtitle: string; icon: any; color: string }> = {
						students: {
							title: 'Students Directory & Status',
							subtitle: 'Manage student accounts, verify physical fee payments, and inspect past exam attempts.',
							icon: Users,
							color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
						},
						questions: {
							title: 'Question Bank & Quizzes',
							subtitle: 'Oversee question repository, configure subject question banks, and create custom exam questions.',
							icon: BookOpen,
							color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
						},
						registration: {
							title: 'Course Registrations',
							subtitle: 'Review student program enrollment submissions and contact details.',
							icon: UserPlus,
							color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
						},
						contact: {
							title: 'Contact Inquiries',
							subtitle: 'Manage and respond to public inquiries and parent messages.',
							icon: Mail,
							color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
						},
						attendance: {
							title: 'Daily Attendance Register',
							subtitle: 'Verify student physical arrival, lateness, and staff overrides.',
							icon: CalendarCheck,
							color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
						}
					};

					const currentMeta = sectionMeta[activeTab];
					const SectionIcon = currentMeta.icon;

					return (
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
							<div className="flex items-center gap-3.5">
								<div className={`h-11 w-11 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${currentMeta.color}`}>
									<SectionIcon className="h-5 w-5" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
											{currentMeta.title}
										</h1>
										<span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
											{user?.role || 'Staff'}
										</span>
									</div>
									<p className="text-xs sm:text-sm text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
										{currentMeta.subtitle}
									</p>
								</div>
							</div>
						</div>
					);
				})()}

				{/* Feature View Render */}
				<div className="mt-6">
					{activeTab === 'students' && <StudentManagementView apiKey={apiKey} />}
					{activeTab === 'questions' && <QuestionBankView apiKey={apiKey} />}
					{activeTab === 'registration' && <RegistrationSubmissionsView apiKey={apiKey} />}
					{activeTab === 'contact' && <ContactSubmissionsView apiKey={apiKey} />}
					{activeTab === 'attendance' && <AttendanceManagementView apiKey={apiKey} />}
				</div>
			</div>
		</div>
	);
}

export default function AdminSubmissionsPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
					Loading portal...
				</div>
			}
		>
			<SubmissionsDashboardContent />
		</Suspense>
	);
}
