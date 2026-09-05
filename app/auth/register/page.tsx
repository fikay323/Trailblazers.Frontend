'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
	const router = useRouter();
	const { register } = useAuth();

	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password.length < 6) {
			setError('Password must be at least 6 characters long.');
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setIsLoading(true);

		try {
			await register({
				fullName: fullName.trim(),
				email: email.trim().toLowerCase(),
				phoneNumber: phoneNumber.trim() || undefined,
				password
			});
			router.push('/student/dashboard');
		} catch (err: any) {
			setError(err.message || 'Failed to create student account.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
			<Card className="w-full max-w-md border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-2xl">
				<CardHeader className="space-y-2 text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-600/10 text-orange-500 border border-orange-500/20">
						<GraduationCap className="h-6 w-6" />
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight text-white">
						Create Student Account
					</CardTitle>
					<CardDescription className="text-slate-400">
						Register to access the Trailblazer CBT Mock Exams and personal performance dashboard.
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
							<label htmlFor="reg-fullname" className="text-xs font-semibold text-slate-300">
								Full Name
							</label>
							<Input
								id="reg-fullname"
								type="text"
								placeholder="e.g. John Doe"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="reg-email" className="text-xs font-semibold text-slate-300">
								Email Address
							</label>
							<Input
								id="reg-email"
								type="email"
								placeholder="e.g. john.doe@gmail.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
								autoComplete="email"
							/>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="reg-phone" className="text-xs font-semibold text-slate-300">
								Phone Number (Optional)
							</label>
							<Input
								id="reg-phone"
								type="tel"
								placeholder="e.g. 08012345678"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								autoComplete="tel"
							/>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="reg-password" className="text-xs font-semibold text-slate-300">
								Password (min. 6 characters)
							</label>
							<Input
								id="reg-password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
								autoComplete="new-password"
							/>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="reg-confirm-password" className="text-xs font-semibold text-slate-300">
								Confirm Password
							</label>
							<Input
								id="reg-confirm-password"
								type="password"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="border-slate-800 bg-slate-950 text-white placeholder-slate-500"
								required
								autoComplete="new-password"
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 transition-colors cursor-pointer"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
								</>
							) : (
								'Register Account'
							)}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
					<p className="text-xs text-slate-400">
						Already have an account?{' '}
						<Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2">
							Sign In
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
