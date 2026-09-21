'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ArrowRight, LogIn, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function RegisterClosedPage() {
	return (
		<div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
			<Card className="w-full max-w-lg border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
				<CardHeader className="space-y-4 text-center pb-4">
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

					<div className="space-y-1.5">
						<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
							Official Enrollment Policy
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-white">
							<h1 className="text-2xl font-bold tracking-tight text-white">Student Account Provisioning</h1>
						</CardTitle>
						<CardDescription className="text-slate-400 text-sm">
							Student accounts are provisioned exclusively by academy administrators upon official enrollment.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
					<div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3.5 text-xs sm:text-sm text-slate-300">
						<h4 className="font-semibold text-white flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-orange-500" />
							How Student Enrollment Works:
						</h4>
						<ol className="list-decimal list-inside space-y-2 text-slate-400 leading-relaxed pl-1">
							<li>
								<strong className="text-slate-200">Submit Application:</strong> Complete the official admission registration form with your details and parent/guardian contact.
							</li>
							<li>
								<strong className="text-slate-200">Admissions Review:</strong> Academy administrators review your application and contact you or your guardian for onboarding.
							</li>
							<li>
								<strong className="text-slate-200">Account Activation:</strong> An official account activation link is sent to your email to set your password and access the CBT portal.
							</li>
						</ol>
					</div>

					<div className="flex flex-col gap-3">
						<Button
							asChild
							className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 cursor-pointer shadow-lg shadow-orange-600/20"
						>
							<Link href="/register">
								Complete Student Registration
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>

						<div className="grid grid-cols-2 gap-3">
							<Button
								asChild
								variant="outline"
								className="w-full border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
							>
								<Link href="/auth/login">
									<LogIn className="mr-2 h-4 w-4" />
									Sign In
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="w-full border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
							>
								<Link href="/contact">
									<PhoneCall className="mr-2 h-4 w-4" />
									Contact Desk
								</Link>
							</Button>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
					<p className="text-[11px] text-slate-500 text-center">
						Trailblazers Academy &bull; Academic Excellence & Mentorship &bull; Port Harcourt, Nigeria
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
