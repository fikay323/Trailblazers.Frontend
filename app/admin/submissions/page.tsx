'use client';

import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Lock, RefreshCw, Users, BookOpen, UserPlus, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StudentManagementView } from '@/features/admin-dashboard/components/StudentManagementView';
import { QuestionBankView } from '@/features/admin-dashboard/components/QuestionBankView';
import { ContactSubmissionsView } from '@/features/admin-dashboard/components/ContactSubmissionsView';
import { RegistrationSubmissionsView } from '@/features/admin-dashboard/components/RegistrationSubmissionsView';

type AdminTab = 'students' | 'questions' | 'registration' | 'contact';

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
		tabParam && ['students', 'questions', 'registration', 'contact'].includes(tabParam)
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
					<CardContent>
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
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
					<div>
						<div className="flex items-center gap-2">
							<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-orange-600/20 text-orange-400 border border-orange-500/30">
								{user?.role || 'Admin'}
							</span>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
								Academy Management Portal
							</h1>
						</div>
						<p className="text-sm text-slate-400 mt-1">
							Manage student accounts & status, oversee question bank, review test histories, and view submissions.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button className="cursor-pointer" variant="destructive" onClick={handleLogout} size="sm">
							Log Out
						</Button>
					</div>
				</div>

				{/* Navigation Tabs */}
				<div className="flex border-b border-slate-800 gap-2 sm:gap-6 overflow-x-auto">
					<button
						onClick={() => switchTab('students')}
						className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'students'
							? 'border-orange-500 text-orange-400'
							: 'border-transparent text-slate-400 hover:text-slate-200'
							}`}
					>
						<Users className="h-4 w-4" />
						Students Directory & Status
					</button>

					<button
						onClick={() => switchTab('questions')}
						className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'questions'
							? 'border-emerald-500 text-emerald-400'
							: 'border-transparent text-slate-400 hover:text-slate-200'
							}`}
					>
						<BookOpen className="h-4 w-4" />
						Question Bank
					</button>

					<button
						onClick={() => switchTab('registration')}
						className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'registration'
							? 'border-indigo-500 text-indigo-400'
							: 'border-transparent text-slate-400 hover:text-slate-200'
							}`}
					>
						<UserPlus className="h-4 w-4" />
						Course Registrations
					</button>

					<button
						onClick={() => switchTab('contact')}
						className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'contact'
							? 'border-cyan-500 text-cyan-400'
							: 'border-transparent text-slate-400 hover:text-slate-200'
							}`}
					>
						<Mail className="h-4 w-4" />
						Contact Inquiries
					</button>
				</div>

				{/* Feature View Render */}
				<div className="mt-6">
					{activeTab === 'students' && <StudentManagementView apiKey={apiKey} />}
					{activeTab === 'questions' && <QuestionBankView apiKey={apiKey} />}
					{activeTab === 'registration' && <RegistrationSubmissionsView apiKey={apiKey} />}
					{activeTab === 'contact' && <ContactSubmissionsView apiKey={apiKey} />}
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
