'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/core/services/authService';

function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const token = searchParams.get('token') || '';
	const email = searchParams.get('email') || '';

	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!token || !email) {
			setError('Invalid or missing password reset token. Please request a new link.');
			return;
		}

		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters long.');
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match. Please ensure both fields are identical.');
			return;
		}

		setIsLoading(true);

		try {
			await resetPassword({
				email: email.trim().toLowerCase(),
				token,
				newPassword
			});
			setIsSuccess(true);
		} catch (err: any) {
			setError(err.message || 'Failed to reset password. The link may have expired.');
		} finally {
			setIsLoading(false);
		}
	};

	if (!token || !email) {
		return (
			<Card className="w-full max-w-md border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
				<CardHeader className="text-center pb-2">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-950/80 border border-red-800 text-red-400">
						<AlertCircle className="h-8 w-8" />
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight text-white">
						<h1>Invalid Reset Link</h1>
					</CardTitle>
					<CardDescription className="text-sm text-slate-400 mt-1.5">
						This password reset link is invalid, incomplete, or has already expired.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4 text-center">
					<p className="text-xs text-slate-400 mb-4">
						Password reset links are time-limited and single-use for account security. Please request a fresh link.
					</p>
					<Button
						asChild
						className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5"
					>
						<Link href="/auth/forgot-password">
							Request New Reset Link
						</Link>
					</Button>
				</CardContent>
				<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
					<Link
						href="/auth/login"
						className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						<span>Back to Sign In</span>
					</Link>
				</CardFooter>
			</Card>
		);
	}

	if (isSuccess) {
		return (
			<Card className="w-full max-w-md border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
				<CardHeader className="text-center pb-2">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400">
						<CheckCircle2 className="h-8 w-8" />
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight text-white">
						<h1>Password Reset Complete</h1>
					</CardTitle>
					<CardDescription className="text-sm text-slate-400 mt-1.5">
						Your account password has been updated successfully.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4 text-center">
					<p className="text-xs text-slate-300 mb-5 leading-relaxed">
						You can now sign in to the student portal and CBT testing grounds with your new credentials.
					</p>
					<Button
						asChild
						className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5"
					>
						<Link href="/auth/login">
							Sign In Now &rarr;
						</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
			<CardHeader className="text-center pb-2">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/80 border border-slate-700 p-2 shadow-inner">
					<Image
						src="/trailblazer.jpeg"
						alt="Trailblazer LMS"
						width={48}
						height={48}
						className="rounded-full object-cover"
					/>
				</div>
				<CardTitle className="text-2xl font-bold tracking-tight text-white">
					<h1>Set New Password</h1>
				</CardTitle>
				<CardDescription className="text-sm text-slate-400 mt-1.5">
					Choose a strong, secure password for <strong className="text-white">{email}</strong>.
				</CardDescription>
			</CardHeader>

			<CardContent className="pt-4">
				{error && (
					<Alert variant="destructive" className="mb-4 border-red-900 bg-red-950/60 text-red-300">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<label htmlFor="new-password" className="text-xs font-semibold text-slate-300">
							New Password
						</label>
						<div className="relative">
							<Input
								id="new-password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 pr-10"
								required
								minLength={6}
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
								tabIndex={-1}
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						<p className="text-[11px] text-slate-500">Minimum 6 characters.</p>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="confirm-password" className="text-xs font-semibold text-slate-300">
							Confirm New Password
						</label>
						<div className="relative">
							<Input
								id="confirm-password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 pr-10"
								required
								minLength={6}
								autoComplete="new-password"
							/>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-2"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Updating Password...</span>
							</>
						) : (
							'Reset Password'
						)}
					</Button>
				</form>
			</CardContent>

			<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
				<Link
					href="/auth/login"
					className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					<span>Back to Sign In</span>
				</Link>
			</CardFooter>
		</Card>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-[85vh] items-center justify-center p-4">
			<Suspense
				fallback={
					<div className="flex items-center justify-center text-slate-400 text-sm gap-2">
						<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
						<span>Loading password reset...</span>
					</div>
				}
			>
				<ResetPasswordForm />
			</Suspense>
		</div>
	);
}
