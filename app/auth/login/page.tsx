'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isStaffSubdomain, setIsStaffSubdomain] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const host = window.location.hostname.toLowerCase();
			setIsStaffSubdomain(host.startsWith('staff.'));
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const user = await login({ email: email.trim(), password });

			// Domain-level Role Guardrails
			if (isStaffSubdomain) {
				if (user.role === 'Student') {
					setError('Access Denied: Student accounts cannot access the Staff Management Portal. Please log in on the student portal (learn.trailblazer-academy.com).');
					setIsLoading(false);
					return;
				}
				router.push('/admin/submissions');
			} else {
				// On Student or Marketing domain
				if (user.role === 'Admin' || user.role === 'Instructor') {
					router.push('/admin/submissions');
				} else {
					router.push('/student/dashboard');
				}
			}
		} catch (err: any) {
			setError(err.message || 'Invalid email or password.');
		} finally {
			setIsLoading(false);
		}
	};

	const quickFill = (demoEmail: string, demoPw: string) => {
		setEmail(demoEmail);
		setPassword(demoPw);
		setError(null);
	};

	return (
		<div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
			<Card className="w-full max-w-md border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-2xl">
				<CardHeader className="space-y-2 text-center">
					<div
						className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border ${
							isStaffSubdomain
								? 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20'
								: 'bg-orange-600/10 text-orange-500 border border-orange-500/20'
						}`}
					>
						{isStaffSubdomain ? <ShieldCheck className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight text-white">
						{isStaffSubdomain ? 'Staff Portal Sign In' : 'Welcome Back'}
					</CardTitle>
					<CardDescription className="text-slate-400">
						{isStaffSubdomain
							? 'Authorized access for academy tutors, instructors, and administrators.'
							: 'Sign in to access your student dashboard and CBT mock exam testing grounds.'}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{error && (
						<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<label htmlFor="login-email" className="text-xs font-semibold text-slate-300">
								Email Address
							</label>
							<Input
								id="login-email"
								type="email"
								placeholder={isStaffSubdomain ? 'staff@trailblazer.edu' : 'student@trailblazer.edu'}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
								autoComplete="email"
							/>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="login-password" className="text-xs font-semibold text-slate-300">
								Password
							</label>
							<Input
								id="login-password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
								autoComplete="current-password"
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className={`w-full text-white font-semibold py-2.5 transition-colors cursor-pointer ${
								isStaffSubdomain
									? 'bg-cyan-600 hover:bg-cyan-700'
									: 'bg-orange-600 hover:bg-orange-700'
							}`}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing In...
								</>
							) : (
								'Sign In'
							)}
						</Button>
					</form>

					{/* Demo Accounts Quick-Fill */}
					<div className="pt-4 border-t border-slate-800">
						<p className="text-xs font-medium text-slate-400 text-center mb-2.5">
							Demo Testing Accounts (1-Click Fill):
						</p>
						<div className="grid grid-cols-3 gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => quickFill('student@trailblazer.edu', 'Student123!')}
								className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-[11px] h-8 px-2 cursor-pointer flex items-center justify-center gap-1"
							>
								<UserCheck className="h-3 w-3 text-orange-400" />
								Student
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => quickFill('admin@trailblazer.edu', 'AdminPassword123!')}
								className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-[11px] h-8 px-2 cursor-pointer flex items-center justify-center gap-1"
							>
								<ShieldCheck className="h-3 w-3 text-cyan-400" />
								Admin
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => quickFill('instructor@trailblazer.edu', 'Instructor123!')}
								className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-[11px] h-8 px-2 cursor-pointer flex items-center justify-center gap-1"
							>
								<GraduationCap className="h-3 w-3 text-emerald-400" />
								Tutor
							</Button>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
					{!isStaffSubdomain ? (
						<p className="text-xs text-slate-400">
							Don't have an account yet?{' '}
							<Link href="/auth/register" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2">
								Create Student Account
							</Link>
						</p>
					) : (
						<p className="text-xs text-slate-400">
							Need staff credentials? Contact the academy proprietor.
						</p>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
