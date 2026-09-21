'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Mail } from 'lucide-react';
import { forgotPassword } from '@/core/services/authService';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const res = await forgotPassword({ email: email.trim().toLowerCase() });
			setSuccessMessage(
				res.message || 'If an account exists with that email address, a password reset link has been sent.'
			);
		} catch (err: any) {
			setError(err.message || 'Failed to request password reset. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-[85vh] items-center justify-center p-4">
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
						<h1>Forgot Password</h1>
					</CardTitle>
					<CardDescription className="text-sm text-slate-400 mt-1.5">
						Enter your registered email address and we'll send you a secure link to reset your password.
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-4">
					{error && (
						<Alert variant="destructive" className="mb-4 border-red-900 bg-red-950/60 text-red-300">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{successMessage ? (
						<div className="space-y-4 text-center py-2">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400">
								<CheckCircle2 className="h-6 w-6" />
							</div>
							<div className="space-y-1">
								<h3 className="text-base font-semibold text-white">Check Your Inbox</h3>
								<p className="text-xs text-slate-300 leading-relaxed px-2">
									{successMessage}
								</p>
								<p className="text-[11px] text-slate-500 pt-1">
									Didn't receive the email? Check your spam/junk folder or verify that you entered the correct address.
								</p>
							</div>

							<div className="pt-2">
								<Button
									variant="outline"
									onClick={() => {
										setSuccessMessage(null);
										setEmail('');
									}}
									className="text-xs border-slate-800 text-slate-300 hover:bg-slate-800"
								>
									Try another email
								</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<label htmlFor="forgot-email" className="text-xs font-semibold text-slate-300">
									Email Address
								</label>
								<div className="relative">
									<Input
										id="forgot-email"
										type="email"
										placeholder="student@trailblazer.edu"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 pl-9"
										required
										autoComplete="email"
									/>
									<Mail className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
										<span>Sending Reset Link...</span>
									</>
								) : (
									'Send Reset Link'
								)}
							</Button>
						</form>
					)}
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
		</div>
	);
}
