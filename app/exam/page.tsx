'use client';

import * as React from 'react';
import Link from 'next/link';
import { RegistrationGate } from '@/features/exam/components/RegistrationGate';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function ExamRegistrationPage() {
	return (
		<main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
			{/* Ambient background glow decoration */}
			<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-4xl mx-auto z-10 space-y-4 sm:space-y-6 py-4 sm:py-8">
				{/* Back to Dashboard Navigation Link & Badge */}
				<div className="flex flex-wrap items-center justify-between gap-2.5">
					<Link
						href="/student/dashboard"
						className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						<span>Back to Dashboard</span>
					</Link>

					<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-orange-500/20 bg-orange-600/10 text-orange-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
						<GraduationCap className="h-3.5 w-3.5" />
						<span>CBT Mock Exam Arena</span>
					</div>
				</div>

				{/* Header Brief */}
				<div className="text-center space-y-1.5 sm:space-y-2">
					<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
						UTME Mock Testing Grounds
					</h1>
					<p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
						Sharpen your speed, accuracy, and examination confidence with verified JAMB past questions under timed conditions.
					</p>
				</div>

				{/* Authenticated Registration / Exam Setup Card */}
				<RegistrationGate />
			</div>
		</main>
	);
}
