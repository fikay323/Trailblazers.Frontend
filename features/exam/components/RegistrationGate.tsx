'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowRight,
	AlertCircle,
	Loader2,
	Lock,
	CheckCircle2,
	UserCheck,
	Clock,
	FileText,
	ShieldAlert,
	ChevronRight,
	LogIn,
	UserPlus,
	GraduationCap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/core/contexts/AuthContext';
import { getExamMetadata, startExam } from '@/core/services/examService';

export function RegistrationGate() {
	const router = useRouter();
	const { user, isLoading: authLoading } = useAuth();

	const [metadata, setMetadata] = useState<{ subjects: string[]; years: number[] } | null>(null);
	const [isLoadingMeta, setIsLoadingMeta] = useState(true);
	const [metaError, setMetaError] = useState<string | null>(null);

	const [selectedYear, setSelectedYear] = useState<string>('');
	const [selectedElectives, setSelectedElectives] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch exam metadata on mount
	useEffect(() => {
		async function fetchMetadata() {
			try {
				const data = await getExamMetadata();
				setMetadata(data);
				if (data.years && data.years.length > 0) {
					setSelectedYear(String(data.years[0]));
				}
			} catch (err: any) {
				setMetaError(err.message || 'Could not load exam configuration.');
			} finally {
				setIsLoadingMeta(false);
			}
		}
		fetchMetadata();
	}, []);

	const electiveSubjects = React.useMemo(() => {
		if (!metadata) return [];
		return metadata.subjects.filter(
			(subj) => subj.toLowerCase() !== 'use of english' && subj.toLowerCase() !== 'english'
		);
	}, [metadata]);

	const handleElectiveToggle = (subject: string) => {
		setSelectedElectives((prev) => {
			if (prev.includes(subject)) {
				return prev.filter((s) => s !== subject);
			} else {
				if (prev.length >= 3) return prev; // Limit to 3 electives
				return [...prev, subject];
			}
		});
	};

	const handleLaunchExam = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;
		setError(null);

		if (selectedElectives.length !== 3) {
			setError('Please select exactly 3 elective subjects (Use of English is automatically included).');
			return;
		}

		setIsLoading(true);

		try {
			const payload = {
				name: user.fullName || 'Candidate',
				email: user.email,
				phone: user.phoneNumber || '08000000000',
				year: parseInt(selectedYear, 10),
				subjects: ['English', ...selectedElectives]
			};

			const data = await startExam(payload);

			// Cache session details for active exam recovery
			localStorage.setItem('exam_session_id', data.sessionId);
			localStorage.setItem('exam_end_time', data.endTime);
			localStorage.setItem('exam_questions', JSON.stringify(data.questions));

			// Launch active exam workspace
			router.push(`/exam/active?session=${data.sessionId}`);
		} catch (err: any) {
			setError(err.message || 'Failed to initialize exam session. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	// --- 1. Loading Authentication or Metadata ---
	if (authLoading || isLoadingMeta) {
		return (
			<Card className="w-full max-w-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl mx-auto text-slate-100 p-8">
				<div className="flex flex-col items-center justify-center space-y-4 py-12">
					<Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
					<p className="text-slate-400 text-sm font-medium">Preparing CBT testing grounds...</p>
				</div>
			</Card>
		);
	}

	// --- 2. Guest State: Authentication Required Barrier ---
	if (!user) {
		return (
			<Card className="w-full max-w-lg border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl mx-auto text-slate-100">
				<CardHeader className="text-center space-y-2 pb-4">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-600/10 text-orange-500 border border-orange-500/20">
						<Lock className="h-7 w-7" />
					</div>
					<CardTitle className="text-2xl font-extrabold tracking-tight text-white">
						Student Sign-In Required
					</CardTitle>
					<CardDescription className="text-slate-400 text-sm leading-relaxed">
						The Trailblazer CBT Mock Exam Arena is reserved for registered students. Please sign in to your student dashboard to configure and begin your mock test session.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-3 pt-2">
					<Link href="/auth/login?redirect=/exam" className="block w-full">
						<Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-950/50">
							<LogIn className="h-4 w-4" />
							Sign In with Student Account
						</Button>
					</Link>

					<Link href="/auth/register" className="block w-full">
						<Button
							variant="outline"
							className="w-full border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-200 font-semibold py-6 text-sm flex items-center justify-center gap-2 cursor-pointer"
						>
							<UserPlus className="h-4 w-4 text-orange-400" />
							Create New Student Account
						</Button>
					</Link>
				</CardContent>

				<CardFooter className="flex justify-center border-t border-slate-800/80 pt-4">
					<Link href="/" className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2">
						← Return to Academy Homepage
					</Link>
				</CardFooter>
			</Card>
		);
	}

	// --- 3. Suspended Student Account Barrier ---
	if (user.isActive === false) {
		return (
			<Card className="w-full max-w-xl border-red-900/60 bg-red-950/30 backdrop-blur-md shadow-2xl mx-auto text-slate-100 border-l-4 border-l-red-500">
				<CardHeader className="space-y-2">
					<div className="flex items-center gap-3">
						<ShieldAlert className="h-8 w-8 text-red-400 shrink-0" />
						<div>
							<CardTitle className="text-xl font-bold text-red-100">
								Exam Taking Suspended
							</CardTitle>
							<CardDescription className="text-red-300 text-xs mt-0.5">
								Candidate: <strong className="text-white">{user.fullName}</strong> ({user.email})
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="p-4 rounded-lg bg-red-950/60 border border-red-800/80 text-sm text-red-200 space-y-1.5">
						<span className="text-xs font-bold uppercase tracking-wider text-red-400 block">
							Reason from Academy Administration:
						</span>
						<p className="font-semibold text-white">
							{user.disabledReason || 'Administrative clearance required.'}
						</p>
					</div>

					<p className="text-xs text-slate-300 leading-relaxed">
						Your account is currently restricted from initializing new exam sessions due to the reason specified above. You may still review your past results and personal test history on your student dashboard.
					</p>
				</CardContent>

				<CardFooter className="flex items-center justify-between border-t border-slate-800/80 pt-4">
					<Link href="/student/dashboard">
						<Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 cursor-pointer">
							← Back to Dashboard
						</Button>
					</Link>

					<Link href="/contact">
						<Button size="sm" className="bg-red-700 hover:bg-red-800 text-white font-semibold cursor-pointer">
							Contact Administration
						</Button>
					</Link>
				</CardFooter>
			</Card>
		);
	}

	// --- 4. Server Metadata Error Barrier ---
	if (metaError || !metadata) {
		return (
			<Card className="w-full max-w-xl border-red-800 bg-red-950/40 shadow-xl mx-auto text-slate-100 p-6">
				<div className="flex items-center gap-3">
					<AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
					<div>
						<h3 className="font-bold text-white">Configuration Error</h3>
						<p className="text-xs text-red-300">{metaError || 'Unable to connect to the backend server.'}</p>
					</div>
				</div>
			</Card>
		);
	}

	// --- 5. Active Authenticated Student Exam Configuration Launchpad ---
	return (
		<Card className="w-full max-w-3xl border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-2xl mx-auto text-slate-100">
			{/* Candidate Identity Strip */}
			<div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-xl">
				<div className="flex items-center gap-3">
					<div className="h-9 w-9 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-sm border border-orange-500/30">
						{user.fullName?.charAt(0).toUpperCase() || 'S'}
					</div>
					<div>
						<div className="text-sm font-bold text-white flex items-center gap-2">
							{user.fullName}
							<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
								<CheckCircle2 className="h-3 w-3 mr-1" />
								Active Candidate
							</span>
						</div>
						<div className="text-xs text-slate-400 font-mono">{user.email}</div>
					</div>
				</div>

				<Link href="/student/dashboard" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
					Dashboard History
					<ChevronRight className="h-3.5 w-3.5" />
				</Link>
			</div>

			<CardContent className="p-6 sm:p-8 space-y-6">
				{error && (
					<div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
						<AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleLaunchExam} className="space-y-6">
					{/* Target UTME Year Selector */}
					<div className="space-y-2">
						<label htmlFor="exam-year" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
							Step 1: Select Target Exam Year
						</label>
						<select
							id="exam-year"
							value={selectedYear}
							onChange={(e) => setSelectedYear(e.target.value)}
							className="w-full h-11 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer font-semibold"
						>
							{metadata.years.map((y) => (
								<option key={y} value={y}>
									{y} JAMB UTME Official Past Questions
								</option>
							))}
						</select>
					</div>

					{/* Subject Selection */}
					<div className="space-y-3 pt-2 border-t border-slate-800/80">
						<div className="flex items-center justify-between">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
								Step 2: Choose 3 Elective Subjects
							</label>
							<span
								className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedElectives.length === 3
									? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
									: 'bg-slate-800 text-slate-400'
									}`}
							>
								Selected: {selectedElectives.length} / 3
							</span>
						</div>

						{/* Compulsory Subject Pill */}
						<div className="p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 flex items-center justify-between text-xs">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-emerald-400" />
								<span className="font-bold text-white">Use of English</span>
								<span className="text-[11px] text-emerald-300 font-semibold">(Compulsory for all candidates)</span>
							</div>
							<span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
								Included
							</span>
						</div>

						{/* Elective Grid */}
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
							{electiveSubjects.map((subject) => {
								const isSelected = selectedElectives.includes(subject);
								const isDisabled = !isSelected && selectedElectives.length >= 3;

								return (
									<button
										key={subject}
										type="button"
										disabled={isDisabled}
										onClick={() => handleElectiveToggle(subject)}
										className={`p-3 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${isSelected
											? 'border-orange-500 bg-orange-950/30 text-white font-bold ring-1 ring-orange-500'
											: isDisabled
												? 'border-slate-800/50 bg-slate-950/30 text-slate-600 cursor-not-allowed'
												: 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
											}`}
									>
										<span>{subject}</span>
										{isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />}
									</button>
								);
							})}
						</div>
					</div>

					{/* Pre-Exam Briefing Box */}
					<div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
						<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
							<Clock className="h-3.5 w-3.5 text-orange-400" />
							Examination Instructions & Parameters
						</span>
						<ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
							<li>Duration: <strong>120 minutes (2 Hours)</strong> countdown timer.</li>
							<li>Total Questions: <strong>50 questions</strong> across your selected combination.</li>
							<li>Answers are securely registered in real-time. Automatic submission occurs if the timer reaches zero.</li>
						</ul>
					</div>

					{/* Submit Launch CTA */}
					<div className="pt-2">
						<Button
							type="submit"
							disabled={isLoading || selectedElectives.length !== 3}
							className="w-full h-12 text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Initializing Exam Session...
								</>
							) : (
								<>
									Launch CBT Exam Simulator
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
