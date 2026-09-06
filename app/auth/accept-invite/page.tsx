'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	ShieldCheck,
	CheckCircle2,
	AlertCircle,
	Loader2,
	Eye,
	EyeOff,
	ArrowRight,
	Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/core/contexts/AuthContext';
import { validateInvitation, acceptInvitation, ValidateInvitationResponse } from '@/core/services/staffService';
import { getPortalUrl } from '@/core/utils/subdomain';

function AcceptInviteContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { setSession } = useAuth();

	const token = searchParams.get('token') || '';
	const email = searchParams.get('email') || '';

	const [isValidating, setIsValidating] = useState(true);
	const [inviteInfo, setInviteInfo] = useState<ValidateInvitationResponse | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		if (!token || !email) {
			setIsValidating(false);
			setValidationError('Missing invitation link parameters. Please verify the URL in your email invitation.');
			return;
		}

		let isMounted = true;
		validateInvitation(token, email)
			.then((res) => {
				if (!isMounted) return;
				if (!res.isValid) {
					setValidationError(res.errorMessage || 'This invitation link is invalid or has expired.');
				} else {
					setInviteInfo(res);
				}
			})
			.catch((err) => {
				if (!isMounted) return;
				setValidationError(err.message || 'Failed to validate invitation link.');
			})
			.finally(() => {
				if (isMounted) setIsValidating(false);
			});

		return () => {
			isMounted = false;
		};
	}, [token, email]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (password.length < 8) {
			setSubmitError('Password must be at least 8 characters long.');
			return;
		}

		if (password !== confirmPassword) {
			setSubmitError('Passwords do not match. Please verify.');
			return;
		}

		// Security sanity check
		const hasUpper = /[A-Z]/.test(password);
		const hasLower = /[a-z]/.test(password);
		const hasNumber = /[0-9]/.test(password);
		if (!hasUpper || !hasLower || !hasNumber) {
			setSubmitError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
			return;
		}

		setIsSubmitting(true);

		try {
			const authRes = await acceptInvitation({
				token,
				email,
				password
			});

			setIsSuccess(true);
			setSession(authRes);

			// Redirect into the portal after brief visual confirmation
			setTimeout(() => {
				const destination = getPortalUrl(authRes.user?.role || 'Instructor', '/admin/submissions?tab=students');
				window.location.href = destination;
			}, 1800);
		} catch (err: any) {
			setSubmitError(err.message || 'Failed to activate your account. Please try again or contact your administrator.');
			setIsSubmitting(false);
		}
	};

	// 1. Loading State
	if (isValidating) {
		return (
			<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="relative">
						<Image
							src="/trailblazer.jpeg"
							alt="Trailblazer LMS Logo"
							width={64}
							height={64}
							className="rounded-2xl ring-4 ring-orange-500/20 animate-pulse"
						/>
					</div>
					<div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
						<Loader2 className="h-4 w-4 animate-spin text-orange-500" />
						Verifying invitation credentials...
					</div>
				</div>
			</div>
		);
	}

	// 2. Invalid or Expired Token State
	if (validationError || !inviteInfo) {
		return (
			<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
				<Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
					<CardHeader className="space-y-3 text-center">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
							<AlertCircle className="h-7 w-7" />
						</div>
						<CardTitle className="text-xl font-bold tracking-tight text-white">
							Invitation Link Expired or Invalid
						</CardTitle>
						<CardDescription className="text-slate-400 text-xs sm:text-sm">
							{validationError || 'This staff invitation could not be verified.'}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 leading-relaxed">
							Staff invitation links remain valid for <strong className="text-white">48 hours</strong> from issuance.
							If your link has expired, please ask an administrator to resend your invite from the Staff Directory.
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-2">
						<Button
							variant="outline"
							onClick={() => router.push('/auth/login')}
							className="w-full border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
						>
							Return to Staff Sign In
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 3. Success Splash State
	if (isSuccess) {
		return (
			<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
				<Card className="w-full max-w-md border-emerald-500/30 bg-slate-900/90 backdrop-blur-md shadow-2xl text-center p-6 space-y-6">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
						<CheckCircle2 className="h-9 w-9 animate-bounce" />
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-white tracking-tight">Account Activated!</h2>
						<p className="text-sm text-slate-400">
							Welcome aboard, <span className="text-white font-medium">{inviteInfo.fullName}</span>. You are being redirected to the staff management workspace.
						</p>
					</div>
					<div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 py-2.5 rounded-lg border border-emerald-900/60">
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
						Launching your staff session...
					</div>
				</Card>
			</div>
		);
	}

	// 4. Active Password Setup Form
	return (
		<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
			<Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
				<CardHeader className="space-y-3 text-center">
					<div className="relative mx-auto w-fit">
						<Image
							src="/trailblazer.jpeg"
							alt="Trailblazer LMS Logo"
							width={56}
							height={56}
							className="rounded-2xl ring-2 ring-orange-500/30 shadow-lg mx-auto"
						/>
						<span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white shadow-sm ring-2 ring-slate-950">
							<ShieldCheck className="h-3 w-3" />
						</span>
					</div>

					<div className="space-y-1">
						<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
							<Sparkles className="h-3 w-3" />
							{inviteInfo.role} Invitation
						</div>
						<CardTitle className="text-2xl font-extrabold tracking-tight text-white">
							Set Up Your Staff Account
						</CardTitle>
						<CardDescription className="text-xs sm:text-sm text-slate-400">
							Hello <span className="text-white font-medium">{inviteInfo.fullName}</span>, create your password to activate your faculty account.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{submitError && (
						<Alert variant="destructive" className="border-red-900 bg-red-950/60 text-red-300 text-xs">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Email (Read-only for verification) */}
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-300">
								Email Address
							</label>
							<Input
								type="email"
								value={inviteInfo.email}
								disabled
								className="border-slate-800 bg-slate-950/60 text-slate-400 cursor-not-allowed text-xs font-mono"
							/>
						</div>

						{/* New Password */}
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
								<span>New Password</span>
								<span className="text-[10px] text-slate-500 font-normal">Min 8 chars</span>
							</label>
							<div className="relative">
								<Input
									type={showPassword ? 'text' : 'password'}
									placeholder="••••••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
									className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 pr-10 text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-300">
								Confirm Password
							</label>
							<Input
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								minLength={8}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm"
							/>
						</div>

						{/* Password rules badge */}
						<div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-400 space-y-1">
							<div className="font-semibold text-slate-300">Password requirements:</div>
							<ul className="list-disc list-inside space-y-0.5 text-slate-500">
								<li className={password.length >= 8 ? 'text-emerald-400' : ''}>At least 8 characters</li>
								<li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-400' : ''}>Uppercase & lowercase letters</li>
								<li className={/[0-9]/.test(password) ? 'text-emerald-400' : ''}>At least 1 number</li>
							</ul>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm cursor-pointer shadow-lg shadow-orange-600/20"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Activating Account...
								</>
							) : (
								<>
									Activate Account & Sign In
									<ArrowRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
					<p className="text-[11px] text-slate-500">
						Already have an active account?{' '}
						<Link href="/auth/login" className="text-orange-400 hover:underline">
							Sign In
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default function AcceptInvitePage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
					<Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
					Loading invitation...
				</div>
			}
		>
			<AcceptInviteContent />
		</Suspense>
	);
}
