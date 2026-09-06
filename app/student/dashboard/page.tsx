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
	AlertCircle,
	AlertTriangle,
	Award,
	BookOpen,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Flame,
	GraduationCap,
	Lock,
	MapPin,
	Navigation,
	Play,
	RefreshCw,
	ShieldAlert,
	TrendingUp,
	User
} from 'lucide-react';
import {
	clockInToAttendance,
	getStudentTodayStatus,
	getCurrentGpsPosition,
	StudentAttendanceStatsDto
} from '@/core/services/attendanceService';

export default function StudentDashboardPage() {
	const router = useRouter();
	const { user, token, isLoading: authLoading, logout, refreshUserProfile } = useAuth();

	const [history, setHistory] = useState<StudentHistoryResponseDto | null>(null);
	const [attendanceStats, setAttendanceStats] = useState<StudentAttendanceStatsDto | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isClockingIn, setIsClockingIn] = useState(false);
	const [clockInError, setClockInError] = useState<string | null>(null);
	const [clockInSuccess, setClockInSuccess] = useState<string | null>(null);

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
			const [examData, attData] = await Promise.allSettled([
				getMyExamHistory(user.email, token || undefined),
				getStudentTodayStatus(token || undefined)
			]);

			if (examData.status === 'fulfilled') {
				setHistory(examData.value);
			} else {
				console.error('Failed to load exam history:', examData.reason);
			}

			if (attData.status === 'fulfilled') {
				setAttendanceStats(attData.value);
			} else {
				console.error('Failed to load attendance status:', attData.reason);
			}
		} catch (err: any) {
			setError(err.message || 'Failed to load dashboard data.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleClockIn = async () => {
		setIsClockingIn(true);
		setClockInError(null);
		setClockInSuccess(null);

		try {
			const position = await getCurrentGpsPosition();
			const record = await clockInToAttendance(
				{
					latitude: position.latitude,
					longitude: position.longitude,
					accuracyMeters: position.accuracyMeters,
					clientTimestamp: position.clientTimestamp
				},
				token || undefined
			);

			setClockInSuccess(
				`Successfully checked in as ${record.status}! Arrived at ${new Date(record.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${Math.round(record.distanceMeters ?? 0)}m from campus).`
			);

			// Refresh attendance stats
			const freshStats = await getStudentTodayStatus(token || undefined);
			setAttendanceStats(freshStats);
		} catch (err: any) {
			setClockInError(err.message || 'Failed to verify attendance. Please ensure you are inside the tutorial center.');
		} finally {
			setIsClockingIn(false);
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
				<div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
					<div className="flex items-center gap-3 min-w-0">
						<div className="h-10 w-10 rounded-full bg-orange-600/15 text-orange-400 flex items-center justify-center font-bold text-base border border-orange-500/30 shrink-0">
							{user?.fullName?.charAt(0) || 'S'}
						</div>
						<div className="min-w-0">
							<h1 className="text-lg sm:text-2xl font-bold text-white truncate">
								Welcome, {user?.fullName || 'Student'}
							</h1>
							<p className="text-xs text-slate-400 font-mono truncate">
								{user?.email}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						<Button
							variant="outline"
							size="sm"
							onClick={loadData}
							className="border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer h-8 px-3 text-xs flex items-center gap-1.5"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
							<span>Refresh</span>
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

				{/* Daily Attendance Card */}
				<div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 sm:p-5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start gap-3.5">
							<div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
								attendanceStats?.hasClockedInToday
									? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
									: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
							}`}>
								{attendanceStats?.hasClockedInToday ? (
									<CheckCircle2 className="h-4 w-4" />
								) : (
									<MapPin className="h-4 w-4" />
								)}
							</div>
							<div className="space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<h2 className="text-sm sm:text-base font-semibold text-white">Daily Check-In</h2>
									{attendanceStats?.hasClockedInToday ? (
										<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
											attendanceStats.todayRecord?.status === 'Late'
												? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
												: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
										}`}>
											<CheckCircle2 className="h-3 w-3" />
											{attendanceStats.todayRecord?.status === 'Late' ? 'Late Arrival' : 'Present'}
										</span>
									) : (
										<span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
											Not Checked In Today
										</span>
									)}
									{Boolean(attendanceStats?.punctualStreak && attendanceStats.punctualStreak > 0) && (
										<span className="text-[11px] text-orange-400 font-medium flex items-center gap-1">
											<Flame className="h-3 w-3" />
											{attendanceStats?.punctualStreak}d streak
										</span>
									)}
								</div>

								<p className="text-xs text-slate-400">
									{attendanceStats?.hasClockedInToday ? (
										<>
											Clocked in at{' '}
											<span className="text-slate-200 font-medium">
												{attendanceStats.todayRecord?.clockInTime
													? new Date(attendanceStats.todayRecord.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
													: 'Recorded'}
											</span>
											{attendanceStats.todayRecord?.distanceMeters != null && (
												<span className="text-slate-500"> • {Math.round(attendanceStats.todayRecord.distanceMeters)}m from campus center</span>
											)}
										</>
									) : (
										'Verify your physical presence upon arriving at the tutorial center.'
									)}
								</p>
							</div>
						</div>

						{/* Clock-In Action / Confirmed Tag */}
						<div>
							{attendanceStats?.hasClockedInToday ? (
								<span className="hidden sm:inline-flex text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 items-center gap-1.5">
									<CheckCircle2 className="h-3.5 w-3.5" />
									Presence Confirmed
								</span>
							) : (
								<Button
									onClick={handleClockIn}
									disabled={isClockingIn}
									size="sm"
									className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs sm:text-sm px-4 py-2 cursor-pointer shrink-0 transition-colors shadow-none flex items-center justify-center gap-1.5"
								>
									{isClockingIn ? (
										<>
											<RefreshCw className="h-3.5 w-3.5 animate-spin" />
											<span>Locating...</span>
										</>
									) : (
										<>
											<MapPin className="h-3.5 w-3.5" />
											<span>Check In Now</span>
										</>
									)}
								</Button>
							)}
						</div>
					</div>

					{/* Inline Feedback Alerts */}
					{clockInSuccess && (
						<div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
							<span>{clockInSuccess}</span>
						</div>
					)}
					{clockInError && (
						<div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
								<span className="truncate">{clockInError}</span>
							</div>
							<button
								onClick={() => setClockInError(null)}
								className="text-[11px] text-red-400 hover:text-red-200 underline shrink-0 ml-2"
							>
								Dismiss
							</button>
						</div>
					)}
				</div>

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
