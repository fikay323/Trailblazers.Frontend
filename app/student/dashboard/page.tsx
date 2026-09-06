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

					<div className="flex items-center justify-end sm:justify-start gap-3 w-full sm:w-auto">
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

				{/* Tutorial Center Physical Attendance Card */}
				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden relative shadow-lg">
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />
					<CardHeader className="pb-3 pt-5">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
									<MapPin className="h-5 w-5" />
								</div>
								<div>
									<CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
										Tutorial Center Attendance
										{attendanceStats?.hasClockedInToday ? (
											<span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
												attendanceStats.todayRecord?.status === 'Present'
													? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
													: attendanceStats.todayRecord?.status === 'Late'
													? 'bg-amber-950 text-amber-400 border border-amber-800'
													: 'bg-cyan-950 text-cyan-400 border border-cyan-800'
											}`}>
												<CheckCircle2 className="h-3.5 w-3.5" />
												{attendanceStats.todayRecord?.status || 'Clocked In'}
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
												Not Clocked In Today
											</span>
										)}
									</CardTitle>
									<CardDescription className="text-xs text-slate-400 mt-0.5">
										{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • Physical presence verified via campus geofence.
									</CardDescription>
								</div>
							</div>

							{/* Streak and Attendance stats pills */}
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-800/40 text-orange-300 text-xs font-semibold">
									<Flame className="h-3.5 w-3.5 text-orange-400" />
									<span>{attendanceStats?.punctualStreak ?? 0} Day Streak</span>
								</div>
								<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 text-xs">
									<Calendar className="h-3.5 w-3.5 text-slate-400" />
									<span>{attendanceStats?.attendanceRate ?? 100}% Rate</span>
								</div>
							</div>
						</div>
					</CardHeader>

					<CardContent className="space-y-4 pt-1 pb-5">
						{/* Success Message Banner */}
						{clockInSuccess && (
							<div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
								<CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
								<div className="flex-1">{clockInSuccess}</div>
							</div>
						)}

						{/* Error Message Banner */}
						{clockInError && (
							<div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs sm:text-sm flex items-start justify-between gap-2.5">
								<div className="flex items-start gap-2">
									<AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
									<span>{clockInError}</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setClockInError(null)}
									className="h-6 px-2 text-xs text-red-300 hover:text-white hover:bg-red-900/50"
								>
									Dismiss
								</Button>
							</div>
						)}

						{attendanceStats?.hasClockedInToday ? (
							<div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
								<div className="space-y-1">
									<div className="font-semibold text-white flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-emerald-400" />
										Check-in Recorded for Today
									</div>
									<p className="text-slate-400 text-xs">
										Clocked in at{' '}
										<span className="font-mono text-slate-200 font-semibold">
											{attendanceStats.todayRecord?.clockInTime
												? new Date(attendanceStats.todayRecord.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
												: 'Recorded'}
										</span>
										{attendanceStats.todayRecord?.distanceMeters != null && (
											<> • Distance: <span className="text-slate-200 font-mono">{Math.round(attendanceStats.todayRecord.distanceMeters)}m</span> from campus center</>
										)}
										{attendanceStats.todayRecord?.accuracyMeters != null && (
											<> • GPS Accuracy: <span className="text-slate-200 font-mono">±{Math.round(attendanceStats.todayRecord.accuracyMeters)}m</span></>
										)}
										{attendanceStats.todayRecord?.verificationType === 'ManualStaff' && (
											<> • Manually verified by instructor {attendanceStats.todayRecord.markedByUserName ? `(${attendanceStats.todayRecord.markedByUserName})` : ''}</>
										)}
									</p>
								</div>
								<div className="text-right">
									<span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
										Attendance Secured
									</span>
								</div>
							</div>
						) : (
							<div className="rounded-lg bg-slate-950/40 border border-slate-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="space-y-1">
									<div className="font-semibold text-white text-sm flex items-center gap-2">
										<Navigation className="h-4 w-4 text-orange-400 animate-pulse" />
										Are you currently inside the tutorial center?
									</div>
									<p className="text-xs text-slate-400 max-w-xl">
										Clock in using your device&apos;s GPS to mark your daily physical arrival. Your device must be physically within the academy premises to verify your presence.
									</p>
								</div>

								<Button
									onClick={handleClockIn}
									disabled={isClockingIn}
									className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-5 shadow-lg shadow-orange-950/40 cursor-pointer shrink-0"
								>
									{isClockingIn ? (
										<>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Verifying Location...
										</>
									) : (
										<>
											<MapPin className="mr-2 h-4 w-4 fill-current" />
											Clock In to Tutorial Center
										</>
									)}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

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
