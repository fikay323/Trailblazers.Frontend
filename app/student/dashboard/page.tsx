'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import {
	getMyExamHistory,
	getMyProfile,
	StudentExamAttemptDto,
	StudentHistoryResponseDto
} from '@/core/services/studentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	AlertTriangle,
	Award,
	BookOpen,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	GraduationCap,
	Lock,
	Play,
	RefreshCw,
	ShieldAlert,
	TrendingUp,
	User
} from 'lucide-react';

export default function StudentDashboardPage() {
	const router = useRouter();
	const { user, token, isLoading: authLoading, logout, refreshUserProfile } = useAuth();

	const [history, setHistory] = useState<StudentHistoryResponseDto | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/auth/login');
			return;
		}

		if (user) {
			loadData();
		}
	}, [user, authLoading]);

	const loadData = async () => {
		if (!user) return;
		setIsLoading(true);
		setError(null);
		try {
			await refreshUserProfile();
			const data = await getMyExamHistory(user.email, token || undefined);
			setHistory(data);
		} catch (err: any) {
			setError(err.message || 'Failed to load dashboard data.');
		} finally {
			setIsLoading(false);
		}
	};

	if (authLoading || (isLoading && !history)) {
		return (
			<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
				<RefreshCw className="h-8 w-8 animate-spin text-orange-500 mb-4" />
				<p>Loading your student dashboard...</p>
			</div>
		);
	}

	const isDeactivated = user?.isActive === false;

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Top Welcome Bar */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
					<div>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-lg border border-orange-500/30">
								{user?.fullName?.charAt(0) || 'S'}
							</div>
							<div>
								<h1 className="text-2xl sm:text-3xl font-extrabold text-white">
									Welcome, {user?.fullName || 'Student'}
								</h1>
								<p className="text-sm text-slate-400">
									Candidate ID: <span className="text-slate-300 font-mono">{user?.email}</span>
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={loadData}
							className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
						>
							<RefreshCw className="h-4 w-4" />
							Refresh
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={logout}
							className="cursor-pointer"
						>
							Log Out
						</Button>
					</div>
				</div>

				{/* Account Suspension Banner */}
				{isDeactivated && (
					<Alert className="border-red-900/60 bg-red-950/40 text-red-200 shadow-xl border-l-4 border-l-red-500">
						<ShieldAlert className="h-5 w-5 text-red-400" />
						<AlertTitle className="text-base font-bold text-red-100 flex items-center gap-2">
							Account Access Restricted by Academy Administration
						</AlertTitle>
						<AlertDescription className="mt-2 text-sm text-red-200/90 leading-relaxed">
							<p className="font-semibold text-white mb-1">
								Reason: {user?.disabledReason || 'Outstanding administrative requirement.'}
							</p>
							<p>
								Your ability to start new CBT mock exams is currently paused. You may still view your personal test history and exam performance reports below. Please consult with the academy administration or proprietor to settle fee obligations and reactivate full exam privileges.
							</p>
						</AlertDescription>
					</Alert>
				)}

				{/* KPI Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
								Account Status
							</CardTitle>
							{isDeactivated ? (
								<Lock className="h-4 w-4 text-red-400" />
							) : (
								<CheckCircle2 className="h-4 w-4 text-emerald-400" />
							)}
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDeactivated
										? 'bg-red-950 text-red-400 border border-red-800'
										: 'bg-emerald-950 text-emerald-400 border border-emerald-800'
										}`}
								>
									{isDeactivated ? 'Suspended / On Hold' : 'Active & Cleared'}
								</span>
							</div>
							<p className="text-xs text-slate-400 mt-2">
								{isDeactivated ? 'Exam taking restricted' : 'Eligible for all mock sessions'}
							</p>
						</CardContent>
					</Card>

					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
								Tests Taken
							</CardTitle>
							<BookOpen className="h-4 w-4 text-orange-400" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-extrabold text-white">
								{history?.totalTestsTaken ?? 0}
							</div>
							<p className="text-xs text-slate-400 mt-1">Total completed CBT sessions</p>
						</CardContent>
					</Card>

					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
								Average Performance
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-cyan-400" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-extrabold text-white">
								{history?.averagePercentage ?? 0}%
							</div>
							<p className="text-xs text-slate-400 mt-1">Across all mock exam attempts</p>
						</CardContent>
					</Card>

					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
								Highest Score
							</CardTitle>
							<Award className="h-4 w-4 text-yellow-400" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-extrabold text-white">
								{history?.highestPercentage ?? 0}%
							</div>
							<p className="text-xs text-slate-400 mt-1">Personal best percentage</p>
						</CardContent>
					</Card>
				</div>

				{/* Action Banner: Take Exam */}
				<div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/30 p-6 sm:p-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-2 max-w-2xl">
							<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-600/20 text-orange-400 border border-orange-500/20">
								<GraduationCap className="h-3.5 w-3.5" />
								JAMB UTME Mock CBT Engine
							</div>
							<h2 className="text-xl sm:text-2xl font-bold text-white">
								Ready to test your knowledge?
							</h2>
							<p className="text-sm text-slate-300">
								Timed simulations with verified JAMB questions, automatic marking, and comprehensive answer explanations.
							</p>
						</div>

						<div>
							{isDeactivated ? (
								<div className="space-y-2 text-right">
									<Button
										disabled
										className="bg-slate-800 text-slate-500 cursor-not-allowed font-semibold px-6 py-6"
									>
										<Lock className="mr-2 h-4 w-4" />
										Exam Taking Suspended
									</Button>
									<p className="text-xs text-red-400">
										Resolve fee balance with academy to resume
									</p>
								</div>
							) : (
								<Link href="/exam">
									<Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-6 cursor-pointer shadow-lg shadow-orange-950/50">
										<Play className="mr-2 h-4 w-4 fill-white" />
										Start New Exam Session
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>

				{/* Past Exam Attempts Table */}
				<Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
					<CardHeader className="border-b border-slate-800/80 pb-4">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg font-bold text-white">
									Past Exam Attempts & Performance
								</CardTitle>
								<CardDescription className="text-slate-400 text-xs mt-1">
									Detailed record of all mock exams completed by your account.
								</CardDescription>
							</div>
							<span className="text-xs text-slate-400">
								{history?.attempts.length ?? 0} Record(s)
							</span>
						</div>
					</CardHeader>

					<CardContent className="p-0">
						{(!history || history.attempts.length === 0) ? (
							<div className="py-12 text-center text-slate-400">
								<GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-600" />
								<p className="text-base font-medium text-slate-300">No mock exam attempts yet.</p>
								<p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
									Once you complete a CBT practice exam, your scores, percentage rankings, and detailed breakdown will appear here.
								</p>
								{!isDeactivated && (
									<Link href="/exam" className="mt-4 inline-block">
										<Button size="sm" className="bg-orange-600 hover:bg-orange-700 cursor-pointer">
											Take Your First Exam
										</Button>
									</Link>
								)}
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="bg-slate-950/60 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
										<tr>
											<th className="py-3.5 px-4 sm:px-6">Exam Year</th>
											<th className="py-3.5 px-4">Score</th>
											<th className="py-3.5 px-4">Percentage</th>
											<th className="py-3.5 px-4">Completion Date</th>
											<th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-800/60">
										{history.attempts.map((attempt) => {
											const isPassing = attempt.percentage >= 50;
											return (
												<tr key={attempt.sessionId} className="hover:bg-slate-800/30 transition-colors">
													<td className="py-4 px-4 sm:px-6 font-semibold text-white flex items-center gap-2">
														<Calendar className="h-4 w-4 text-orange-400" />
														{attempt.targetYear} JAMB UTME
													</td>
													<td className="py-4 px-4 font-mono font-bold text-slate-200">
														{attempt.totalScore} / {attempt.totalQuestions}
													</td>
													<td className="py-4 px-4">
														<span
															className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${isPassing
																? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
																: 'bg-red-950 text-red-400 border border-red-800'
																}`}
														>
															{attempt.percentage}%
														</span>
													</td>
													<td className="py-4 px-4 text-xs text-slate-400">
														<div className="flex items-center gap-1.5">
															<Clock className="h-3.5 w-3.5 text-slate-500" />
															{new Date(attempt.completedAt).toLocaleString()}
														</div>
													</td>
													<td className="py-4 px-4 sm:px-6 text-right">
														<Link href={`/exam/result?sessionId=${attempt.sessionId}`}>
															<Button
																variant="outline"
																size="sm"
																className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs cursor-pointer"
															>
																View Report
																<ChevronRight className="ml-1 h-3.5 w-3.5" />
															</Button>
														</Link>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
