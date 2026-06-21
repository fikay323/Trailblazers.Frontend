'use client';

import * as React from 'react';
import { RegistrationGate } from '@/features/exam/components/RegistrationGate';
import { GraduationCap } from 'lucide-react';

export default function ExamRegistrationPage() {
	return (
		<main className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Ambient background decoration */}
			<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-4xl mx-auto z-10 space-y-8 py-12">
				{/* Welcome Header */}
				<div className="text-center space-y-4">
					<div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
						<GraduationCap className="h-4 w-4" />
						Trailblazer Academy
					</div>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
						UTME Mock Testing Grounds
					</h1>
					<p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
						Sharpen your speed, accuracy, and confidence. Take our comprehensive, full-length CBT simulation tailored to the official JAMB exam standards.
					</p>
				</div>

				{/* Registration Form Card */}
				<RegistrationGate />
			</div>
		</main>
	);
}
