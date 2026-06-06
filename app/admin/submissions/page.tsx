'use client';

import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ContactSubmissionsView } from '@/features/admin-dashboard/components/ContactSubmissionsView';
import { RegistrationSubmissionsView } from '@/features/admin-dashboard/components/RegistrationSubmissionsView';

function SubmissionsDashboardContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Authentication State
	const [apiKey, setApiKey] = useState('');
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [apiKeyInput, setApiKeyInput] = useState('');

	// Active tab derived from query parameter ?tab (defaults to 'contact')
	const activeTab = searchParams.get('tab') === 'registration' ? 'registration' : 'contact';

	// Load API key from localStorage on mount
	useEffect(() => {
		const savedKey = localStorage.getItem('admin_api_key');
		if (savedKey) {
			setApiKey(savedKey);
			setIsAuthorized(true);
		}
	}, []);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		if (!apiKeyInput.trim()) return;

		setApiKey(apiKeyInput.trim());
		setIsAuthorized(true);
		localStorage.setItem('admin_api_key', apiKeyInput.trim());
	};

	const handleLogout = () => {
		setApiKey('');
		setIsAuthorized(false);
		setApiKeyInput('');
		localStorage.removeItem('admin_api_key');
	};

	const switchTab = (tab: 'contact' | 'registration') => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', tab);
		router.push(`${pathname}?${params.toString()}`);
	};

	if (!isAuthorized) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
				<Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-2xl">
					<CardHeader className="space-y-1 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Lock className="h-6 w-6" />
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Submissions</CardTitle>
						<CardDescription className="text-slate-400">
							Enter the API Key to unlock submissions logs.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-4">
							<Input
								type="password"
								placeholder="Enter API Key"
								value={apiKeyInput}
								onChange={(e) => setApiKeyInput(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
							/>
							<Button type="submit" className="w-full">
								Unlock
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
						<h1 className="text-3xl font-extrabold tracking-tight text-white animate-fade-in">Admin Submissions</h1>
						<p className="text-sm text-slate-400 mt-1">
							Select a tab to view contact inquires or student course registrations.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button className='cursor-pointer' variant="destructive" onClick={handleLogout} size="sm">
							Log Out
						</Button>
					</div>
				</div>

				{/* Tab Controls */}
				<div className="flex border-b border-slate-800 gap-6">
					<button
						onClick={() => switchTab('contact')}
						className={`pb-4 text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer ${activeTab === 'contact'
							? 'border-cyan-500 text-cyan-400'
							: 'border-transparent text-slate-400 hover:text-slate-200'
							}`}
					>
						Contact Inquiries
					</button>
					<button
						onClick={() => switchTab('registration')}
						className={`pb-4 text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer ${activeTab === 'registration'
							? 'border-indigo-500 text-indigo-400'
							: 'border-transparent text-slate-400 hover:text-slate-200'
							}`}
					>
						Student Registrations
					</button>
				</div>

				{/* Feature Render */}
				<div className="mt-6">
					{activeTab === 'contact' ? (
						<ContactSubmissionsView apiKey={apiKey} />
					) : (
						<RegistrationSubmissionsView apiKey={apiKey} />
					)}
				</div>

			</div>
		</div>
	);
}

export default function AdminSubmissionsPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
				Loading submissions dashboard...
			</div>
		}>
			<SubmissionsDashboardContent />
		</Suspense>
	);
}
