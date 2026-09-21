'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
	GraduationCap,
	Calendar,
	Clock,
	BookOpen,
	Bell,
	Mail,
	Phone,
	User,
	CheckCircle,
	AlertCircle,
	Loader2,
	LogOut,
	Send,
	ShieldCheck,
	TrendingUp,
	BarChart3,
	MessageSquare,
	ArrowRight,
	CalendarCheck
} from 'lucide-react';
import {
	verifyGuardianAccess,
	getWardOverview,
	submitGuardianInquiry,
	saveGuardianSession,
	getGuardianSession,
	clearGuardianSession,
	GuardianWardOverview
} from '@/core/services/guardianPortalService';

function GuardianPortalContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	// Session / Auth state
	const [token, setToken] = useState<string | null>(null);
	const [overview, setOverview] = useState<GuardianWardOverview | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	// Login Form state
	const [studentEmail, setStudentEmail] = useState('');
	const [guardianContact, setGuardianContact] = useState('');
	const [isVerifying, setIsVerifying] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);

	// Tab state
	const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'notices' | 'inquiry'>('overview');

	// Inquiry Form state
	const [inquirySubject, setInquirySubject] = useState('Academic Performance');
	const [inquiryMessage, setInquiryMessage] = useState('');
	const [inquiryGuardianEmail, setInquiryGuardianEmail] = useState('');
	const [inquiryGuardianPhone, setInquiryGuardianPhone] = useState('');
	const [isSendingInquiry, setIsSendingInquiry] = useState(false);
	const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
	const [inquiryError, setInquiryError] = useState<string | null>(null);

	// 1. Initial token check (from URL query param or saved localStorage)
	useEffect(() => {
		async function initSession() {
			setIsInitializing(true);
			const urlToken = searchParams.get('token');
			const session = getGuardianSession();
			const activeToken = urlToken || session.token;

			if (activeToken) {
				try {
					const data = await getWardOverview(activeToken);
					setToken(activeToken);
					setOverview(data);
					saveGuardianSession(activeToken, data.studentEmail);
					setInquiryGuardianEmail(data.guardianEmail || '');
					setInquiryGuardianPhone(data.guardianPhone || '');
				} catch {
					clearGuardianSession();
					setToken(null);
					setOverview(null);
				}
			}
			setIsInitializing(false);
		}

		initSession();
	}, [searchParams]);

	// 2. Handle Login / Verification
	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoginError(null);

		if (!studentEmail.trim() || !guardianContact.trim()) {
			setLoginError('Please enter both the student email and your registered phone number or email.');
			return;
		}

		try {
			setIsVerifying(true);
			const res = await verifyGuardianAccess({
				studentEmail: studentEmail.trim(),
				guardianContact: guardianContact.trim()
			});

			if (res.success && res.accessToken && res.wardOverview) {
				setToken(res.accessToken);
				setOverview(res.wardOverview);
				saveGuardianSession(res.accessToken, res.wardOverview.studentEmail);
				setInquiryGuardianEmail(res.wardOverview.guardianEmail || '');
				setInquiryGuardianPhone(res.wardOverview.guardianPhone || '');
			} else {
				setLoginError(res.message || 'Unable to verify guardian access.');
			}
		} catch (err: any) {
			setLoginError(err.message || 'Verification failed. Please check your credentials.');
		} finally {
			setIsVerifying(false);
		}
	};

	// 3. Handle Logout / Switch Ward
	const handleSignOut = () => {
		clearGuardianSession();
		setToken(null);
		setOverview(null);
		setStudentEmail('');
		setGuardianContact('');
		setLoginError(null);
		router.replace('/guardian/portal');
	};

	// 4. Handle Submit Inquiry
	const handleInquirySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setInquiryError(null);
		setInquirySuccess(null);

		if (!overview?.studentEmail || !inquiryMessage.trim()) {
			setInquiryError('Please enter a message for the academy.');
			return;
		}

		try {
			setIsSendingInquiry(true);
			const res = await submitGuardianInquiry({
				studentEmail: overview.studentEmail,
				guardianName: overview.guardianName,
				guardianEmail: inquiryGuardianEmail || overview.guardianEmail,
				guardianPhone: inquiryGuardianPhone || overview.guardianPhone,
				subject: inquirySubject,
				message: inquiryMessage.trim()
			});

			if (res.success) {
				setInquirySuccess(res.message);
				setInquiryMessage('');
			} else {
				setInquiryError(res.message || 'Failed to submit inquiry.');
			}
		} catch (err: any) {
			setInquiryError(err.message || 'An error occurred while sending your inquiry.');
		} finally {
			setIsSendingInquiry(false);
		}
	};

	// Loading Skeleton
	if (isInitializing) {
		return (
			<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
				<div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
					<div className="flex items-center space-x-3">
						<div className="w-12 h-12 rounded-xl bg-slate-800 animate-pulse" />
						<div className="space-y-2 flex-1">
							<div className="h-5 bg-slate-800 rounded animate-pulse w-3/4" />
							<div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
						</div>
					</div>
					<div className="space-y-3">
						<div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
						<div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
						<div className="h-11 bg-orange-950/30 rounded-lg animate-pulse" />
					</div>
				</div>
			</div>
		);
	}

	// Unauthenticated: Guardian Login / Verification View
	if (!token || !overview) {
		return (
			<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
				{/* Background Glow */}
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

				<div className="w-full max-w-lg bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-4">
							<ShieldCheck className="w-8 h-8" />
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
							Guardian & Parent Portal
						</h1>
						<p className="mt-2 text-sm text-slate-400">
							Trailblazers Academy & Edukonsult
						</p>
						<p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
							Access your ward&apos;s real-time CBT mock exam performance, attendance logs, and academy updates.
						</p>
					</div>

					{/* Error alert */}
					{loginError && (
						<div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in">
							<AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
							<div>
								<p className="font-semibold">Verification Failed</p>
								<p className="text-rose-300/90 text-xs mt-0.5">{loginError}</p>
							</div>
						</div>
					)}

					{/* Verification Form */}
					<form onSubmit={handleVerify} className="space-y-5">
						<div>
							<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
								Student&apos;s Registered Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
								<input
									type="email"
									required
									placeholder="e.g. student@gmail.com"
									value={studentEmail}
									onChange={(e) => setStudentEmail(e.target.value)}
									className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
								Parent / Guardian Phone or Email
							</label>
							<div className="relative">
								<Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
								<input
									type="text"
									required
									placeholder="e.g. 08123456789 or parent@gmail.com"
									value={guardianContact}
									onChange={(e) => setGuardianContact(e.target.value)}
									className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
								/>
							</div>
							<p className="mt-1.5 text-xs text-slate-500">
								Must match the parent contact provided during registration.
							</p>
						</div>

						<button
							type="submit"
							disabled={isVerifying}
							className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
						>
							{isVerifying ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Verifying Credentials...</span>
								</>
							) : (
								<>
									<span>Access Ward Portal</span>
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</button>
					</form>

					{/* Help Notice */}
					<div className="mt-8 pt-6 border-t border-slate-800 text-center">
						<p className="text-xs text-slate-500">
							Need assistance? Contact Academy Support at{' '}
							<span className="text-orange-400 font-semibold">+234 816 599 9425</span> or{' '}
							<span className="text-orange-400 font-semibold">info@trailblazer-academy.com</span>
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Authenticated: Guardian Ward Dashboard View
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			{/* Top Navbar */}
			<header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-3.5">
				<div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					{/* Academy Identity */}
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
							<ShieldCheck className="w-5 h-5" />
						</div>
						<div>
							<h2 className="text-base font-bold text-white leading-tight">
								Trailblazers Guardian Portal
							</h2>
							<p className="text-xs text-slate-400">
								Ward: <strong className="text-slate-200">{overview.studentName}</strong> ({overview.targetExam})
							</p>
						</div>
					</div>

					{/* Guardian Profile info & Sign out */}
					<div className="flex items-center space-x-4 self-end sm:self-auto">
						<div className="text-right hidden sm:block">
							<p className="text-xs font-semibold text-slate-200">
								{overview.guardianName || 'Parent / Guardian'}
							</p>
							<p className="text-[11px] text-slate-400 capitalize">
								{overview.guardianRelationship || 'Guardian'}
							</p>
						</div>
						<button
							onClick={handleSignOut}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-rose-950/40 hover:border-rose-700/60 hover:text-rose-300 text-xs font-medium text-slate-300 transition"
							title="Sign out or view another ward"
						>
							<LogOut className="w-3.5 h-3.5" />
							<span>Sign Out</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
				{/* Ward Banner Card */}
				<div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
					<div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
									{overview.targetExam}
								</span>
								<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
									<CheckCircle className="w-3 h-3" />
									{overview.status}
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-white">
								{overview.studentName}
							</h1>
							<div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
								{overview.guardianName && (
									<span className="flex items-center gap-1.5">
										<User className="w-3.5 h-3.5 text-slate-500" />
										Guardian: <strong className="text-slate-300">{overview.guardianName}</strong> ({overview.guardianRelationship})
									</span>
								)}
								<span className="flex items-center gap-1.5">
									<Mail className="w-3.5 h-3.5 text-slate-500" />
									{overview.studentEmail}
								</span>
								{overview.studentPhone && (
									<span className="flex items-center gap-1.5">
										<Phone className="w-3.5 h-3.5 text-slate-500" />
										{overview.studentPhone}
									</span>
								)}
								{overview.enrolledAt && (
									<span className="flex items-center gap-1.5">
										<Calendar className="w-3.5 h-3.5 text-slate-500" />
										Enrolled: {new Date(overview.enrolledAt).toLocaleDateString()}
									</span>
								)}
							</div>
						</div>

						{/* Quick KPI Overview */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							<div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
								<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CBT Tests</p>
								<p className="text-xl font-extrabold text-white mt-0.5">{overview.totalExamsTaken}</p>
							</div>
							<div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
								<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Score</p>
								<p className="text-xl font-extrabold text-sky-400 mt-0.5">{overview.averageScorePercentage}%</p>
							</div>
							<div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
								<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pass Rate</p>
								<p className="text-xl font-extrabold text-amber-400 mt-0.5">{overview.passRatePercentage}%</p>
							</div>
							<div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
								<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attendance</p>
								<p className="text-xl font-extrabold text-emerald-400 mt-0.5">{overview.attendanceRatePercentage}%</p>
							</div>
						</div>
					</div>
				</div>

				{/* Tab Navigation */}
				<div className="flex border-b border-slate-800 space-x-2 sm:space-x-4 overflow-x-auto pb-px">
					<button
						onClick={() => setActiveTab('overview')}
						className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
							activeTab === 'overview'
								? 'border-orange-500 text-orange-400'
								: 'border-transparent text-slate-400 hover:text-slate-200'
						}`}
					>
						<TrendingUp className="w-4 h-4" />
						<span>Overview</span>
					</button>

					<button
						onClick={() => setActiveTab('academics')}
						className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
							activeTab === 'academics'
								? 'border-orange-500 text-orange-400'
								: 'border-transparent text-slate-400 hover:text-slate-200'
						}`}
					>
						<BarChart3 className="w-4 h-4" />
						<span>Mock Exams ({overview.recentExams.length})</span>
					</button>

					<button
						onClick={() => setActiveTab('attendance')}
						className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
							activeTab === 'attendance'
								? 'border-orange-500 text-orange-400'
								: 'border-transparent text-slate-400 hover:text-slate-200'
						}`}
					>
						<CalendarCheck className="w-4 h-4" />
						<span>Attendance ({overview.recentAttendance.length})</span>
					</button>

					<button
						onClick={() => setActiveTab('notices')}
						className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
							activeTab === 'notices'
								? 'border-orange-500 text-orange-400'
								: 'border-transparent text-slate-400 hover:text-slate-200'
						}`}
					>
						<Bell className="w-4 h-4" />
						<span>Notices ({overview.announcements.length})</span>
					</button>

					<button
						onClick={() => setActiveTab('inquiry')}
						className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
							activeTab === 'inquiry'
								? 'border-orange-500 text-orange-400'
								: 'border-transparent text-slate-400 hover:text-slate-200'
						}`}
					>
						<MessageSquare className="w-4 h-4" />
						<span>Contact Academy</span>
					</button>
				</div>

				{/* TAB 1: OVERVIEW */}
				{activeTab === 'overview' && (
					<div className="space-y-6">
						{/* Performance Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* CBT Exam Highlights */}
							<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-bold text-white flex items-center gap-2">
										<BarChart3 className="w-5 h-5 text-sky-400" />
										<span>Recent Mock Exam Scores</span>
									</h3>
									<button
										onClick={() => setActiveTab('academics')}
										className="text-xs font-semibold text-orange-400 hover:text-orange-300"
									>
										View all &rarr;
									</button>
								</div>

								{overview.recentExams.length === 0 ? (
									<div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
										<BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
										<p className="text-sm font-medium text-slate-400">No mock exam attempts yet.</p>
										<p className="text-xs text-slate-500 mt-1">Upcoming CBT tests will appear here once submitted.</p>
									</div>
								) : (
									<div className="space-y-3">
										{overview.recentExams.slice(0, 4).map((exam) => (
											<div
												key={exam.sessionId}
												className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
											>
												<div>
													<p className="text-sm font-bold text-white">
														JAMB Mock Test ({exam.targetYear})
													</p>
													<p className="text-xs text-slate-400 mt-0.5">
														{new Date(exam.completedAt).toLocaleDateString()} &bull; {exam.totalScore} / {exam.totalQuestions} questions
													</p>
												</div>
												<div className="text-right">
													<span
														className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold ${
															exam.passed
																? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
																: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
														}`}
													>
														{exam.percentage}%
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Attendance Highlights */}
							<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-bold text-white flex items-center gap-2">
										<CalendarCheck className="w-5 h-5 text-emerald-400" />
										<span>Physical Attendance Highlights</span>
									</h3>
									<button
										onClick={() => setActiveTab('attendance')}
										className="text-xs font-semibold text-orange-400 hover:text-orange-300"
									>
										View all &rarr;
									</button>
								</div>

								{overview.recentAttendance.length === 0 ? (
									<div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
										<Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
										<p className="text-sm font-medium text-slate-400">No attendance records found yet.</p>
										<p className="text-xs text-slate-500 mt-1">Daily clock-in and clock-out logs will appear here.</p>
									</div>
								) : (
									<div className="space-y-3">
										{overview.recentAttendance.slice(0, 4).map((record) => (
											<div
												key={record.id}
												className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
											>
												<div>
													<p className="text-sm font-bold text-white">
														{new Date(record.date).toLocaleDateString(undefined, {
															weekday: 'short',
															month: 'short',
															day: 'numeric'
														})}
													</p>
													<p className="text-xs text-slate-400 mt-0.5">
														In: {new Date(record.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
														{record.clockOutTime && (
															<> &bull; Out: {new Date(record.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
														)}
													</p>
												</div>
												<span
													className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
														record.status === 'Present'
															? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
															: record.status === 'Late'
															? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
															: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
													}`}
												>
													{record.status}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Latest Announcement Preview */}
						{overview.announcements.length > 0 && (
							<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-base font-bold text-white flex items-center gap-2">
										<Bell className="w-5 h-5 text-orange-400" />
										<span>Latest Academy Notice</span>
									</h3>
									<button
										onClick={() => setActiveTab('notices')}
										className="text-xs font-semibold text-orange-400 hover:text-orange-300"
									>
										View all notices &rarr;
									</button>
								</div>
								<div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
									<div className="flex items-center gap-2 mb-2">
										<span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
											{overview.announcements[0].priority}
										</span>
										<span className="text-xs text-slate-400">
											{new Date(overview.announcements[0].createdAt).toLocaleDateString()}
										</span>
									</div>
									<h4 className="text-base font-bold text-white mb-1">
										{overview.announcements[0].title}
									</h4>
									<p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
										{overview.announcements[0].content}
									</p>
								</div>
							</div>
						)}
					</div>
				)}

				{/* TAB 2: MOCK EXAMS & ACADEMIC PERFORMANCE */}
				{activeTab === 'academics' && (
					<div className="space-y-6">
						{/* KPI Cards */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Total Tests Taken</p>
								<p className="text-2xl font-black text-white mt-1">{overview.totalExamsTaken}</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Average Score</p>
								<p className="text-2xl font-black text-sky-400 mt-1">{overview.averageScorePercentage}%</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Highest Score</p>
								<p className="text-2xl font-black text-emerald-400 mt-1">{overview.highestScorePercentage}%</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Pass Rate (&ge;50%)</p>
								<p className="text-2xl font-black text-amber-400 mt-1">{overview.passRatePercentage}%</p>
							</div>
						</div>

						{/* Mock Exams Table */}
						<div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
							<div className="p-5 border-b border-slate-800">
								<h3 className="text-base font-bold text-white">Full Mock Examination History</h3>
								<p className="text-xs text-slate-400 mt-0.5">
									Comprehensive breakdown of all computer-based tests completed by your ward.
								</p>
							</div>

							{overview.recentExams.length === 0 ? (
								<div className="p-12 text-center">
									<BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
									<p className="text-base font-semibold text-slate-300">No examination attempts on record.</p>
									<p className="text-xs text-slate-500 mt-1">
										When your ward participates in online or computer-based mock tests, scores will automatically sync here.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left border-collapse text-xs sm:text-sm">
										<thead>
											<tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
												<th className="py-3.5 px-4 font-semibold">Test / Cohort</th>
												<th className="py-3.5 px-4 font-semibold">Date Completed</th>
												<th className="py-3.5 px-4 font-semibold">Score</th>
												<th className="py-3.5 px-4 font-semibold">Percentage</th>
												<th className="py-3.5 px-4 font-semibold text-right">Status</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-800/60">
											{overview.recentExams.map((exam) => (
												<tr key={exam.sessionId} className="hover:bg-slate-850/40 transition">
													<td className="py-3.5 px-4 font-bold text-white">
														JAMB Mock Test ({exam.targetYear})
													</td>
													<td className="py-3.5 px-4 text-slate-300">
														{new Date(exam.completedAt).toLocaleString(undefined, {
															year: 'numeric',
															month: 'short',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</td>
													<td className="py-3.5 px-4 text-slate-200">
														<strong className="text-white">{exam.totalScore}</strong> / {exam.totalQuestions}
													</td>
													<td className="py-3.5 px-4">
														<div className="flex items-center gap-3">
															<span className="font-extrabold text-white w-12">{exam.percentage}%</span>
															<div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
																<div
																	className={`h-full rounded-full ${
																		exam.percentage >= 70
																			? 'bg-emerald-500'
																			: exam.percentage >= 50
																			? 'bg-sky-500'
																			: 'bg-amber-500'
																	}`}
																	style={{ width: `${Math.min(100, exam.percentage)}%` }}
																/>
															</div>
														</div>
													</td>
													<td className="py-3.5 px-4 text-right">
														<span
															className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
																exam.passed
																	? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
																	: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
															}`}
														>
															{exam.passed ? 'PASSED' : 'NEEDS ATTENTION'}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				)}

				{/* TAB 3: ATTENDANCE RECORDS */}
				{activeTab === 'attendance' && (
					<div className="space-y-6">
						{/* KPI Cards */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Attendance Rate</p>
								<p className="text-2xl font-black text-emerald-400 mt-1">{overview.attendanceRatePercentage}%</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Days Present</p>
								<p className="text-2xl font-black text-white mt-1">{overview.presentDays}</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Days Late</p>
								<p className="text-2xl font-black text-amber-400 mt-1">{overview.lateDays}</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
								<p className="text-xs font-semibold text-slate-400 uppercase">Total Days Logged</p>
								<p className="text-2xl font-black text-slate-300 mt-1">{overview.totalAttendanceRecorded}</p>
							</div>
						</div>

						{/* Attendance History Table */}
						<div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
							<div className="p-5 border-b border-slate-800">
								<h3 className="text-base font-bold text-white">Daily Physical Attendance Logs</h3>
								<p className="text-xs text-slate-400 mt-0.5">
									Verified biometric and geofenced attendance logs recorded on the academy premises.
								</p>
							</div>

							{overview.recentAttendance.length === 0 ? (
								<div className="p-12 text-center">
									<Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
									<p className="text-base font-semibold text-slate-300">No attendance logs available.</p>
									<p className="text-xs text-slate-500 mt-1">
										Daily clock-in entries made when arriving at the academy will be recorded here.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left border-collapse text-xs sm:text-sm">
										<thead>
											<tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
												<th className="py-3.5 px-4 font-semibold">Date</th>
												<th className="py-3.5 px-4 font-semibold">Clock In Time</th>
												<th className="py-3.5 px-4 font-semibold">Clock Out Time</th>
												<th className="py-3.5 px-4 font-semibold">Status</th>
												<th className="py-3.5 px-4 font-semibold text-right">Remarks</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-800/60">
											{overview.recentAttendance.map((rec) => (
												<tr key={rec.id} className="hover:bg-slate-850/40 transition">
													<td className="py-3.5 px-4 font-bold text-white">
														{new Date(rec.date).toLocaleDateString(undefined, {
															weekday: 'short',
															year: 'numeric',
															month: 'short',
															day: 'numeric'
														})}
													</td>
													<td className="py-3.5 px-4 text-slate-300">
														{new Date(rec.clockInTime).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit'
														})}
													</td>
													<td className="py-3.5 px-4 text-slate-300">
														{rec.clockOutTime ? (
															new Date(rec.clockOutTime).toLocaleTimeString([], {
																hour: '2-digit',
																minute: '2-digit'
															})
														) : (
															<span className="text-slate-500 italic">Not clocked out</span>
														)}
													</td>
													<td className="py-3.5 px-4">
														<span
															className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
																rec.status === 'Present'
																	? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
																	: rec.status === 'Late'
																	? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
																	: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
															}`}
														>
															{rec.status}
														</span>
													</td>
													<td className="py-3.5 px-4 text-right text-slate-400 text-xs">
														{rec.remarks || '—'}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				)}

				{/* TAB 4: ACADEMY NOTICES */}
				{activeTab === 'notices' && (
					<div className="space-y-6">
						<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg">
							<h3 className="text-base font-bold text-white mb-1">Academy Announcements & Noticeboard</h3>
							<p className="text-xs text-slate-400 mb-6">
								Official updates, academic calendars, fee notices, and holiday schedules from academy administration.
							</p>

							{overview.announcements.length === 0 ? (
								<div className="p-12 text-center bg-slate-950/40 rounded-xl border border-slate-800">
									<Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
									<p className="text-base font-semibold text-slate-300">No active announcements at this time.</p>
									<p className="text-xs text-slate-500 mt-1">Check back later for academy notices.</p>
								</div>
							) : (
								<div className="space-y-4">
									{overview.announcements.map((notice) => (
										<div
											key={notice.id}
											className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
										>
											<div className="flex flex-wrap items-center justify-between gap-2">
												<div className="flex items-center gap-2">
													<span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
														{notice.priority}
													</span>
													<span className="text-xs text-slate-400">
														Audience: <strong className="text-slate-300">{notice.targetAudience}</strong>
													</span>
												</div>
												<span className="text-xs text-slate-500">
													{new Date(notice.createdAt).toLocaleDateString(undefined, {
														year: 'numeric',
														month: 'short',
														day: 'numeric'
													})}
												</span>
											</div>

											<h4 className="text-lg font-bold text-white">{notice.title}</h4>
											<p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
												{notice.content}
											</p>

											<div className="pt-2 border-t border-slate-800/80 text-xs text-slate-500">
												Published by <span className="text-slate-400 font-medium">{notice.authorName}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{/* TAB 5: CONTACT ACADEMY / INQUIRY */}
				{activeTab === 'inquiry' && (
					<div className="max-w-2xl mx-auto space-y-6">
						<div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
							<div>
								<h3 className="text-xl font-bold text-white flex items-center gap-2">
									<MessageSquare className="w-5 h-5 text-orange-400" />
									<span>Contact Academy Administration</span>
								</h3>
								<p className="text-xs sm:text-sm text-slate-400 mt-1">
									Send a message directly to instructors and school leadership regarding your ward,{' '}
									<strong className="text-slate-200">{overview.studentName}</strong>.
								</p>
							</div>

							{inquirySuccess && (
								<div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
									<CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
									<div>
										<p className="font-semibold">Message Delivered Successfully</p>
										<p className="text-xs text-emerald-300/90 mt-0.5">{inquirySuccess}</p>
									</div>
								</div>
							)}

							{inquiryError && (
								<div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
									<AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
									<div>
										<p className="font-semibold">Message Delivery Failed</p>
										<p className="text-xs text-rose-300/90 mt-0.5">{inquiryError}</p>
									</div>
								</div>
							)}

							<form onSubmit={handleInquirySubmit} className="space-y-4">
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
										Inquiry Topic / Subject
									</label>
									<select
										value={inquirySubject}
										onChange={(e) => setInquirySubject(e.target.value)}
										className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
									>
										<option value="Academic Performance">Academic Performance & Scores</option>
										<option value="Attendance & Punctuality">Attendance & Punctuality</option>
										<option value="Fees & Billing">Fees & Billing</option>
										<option value="General Inquiry">General Inquiry / Feedback</option>
									</select>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
											Your Email (for response)
										</label>
										<input
											type="email"
											placeholder="your.email@example.com"
											value={inquiryGuardianEmail}
											onChange={(e) => setInquiryGuardianEmail(e.target.value)}
											className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
										/>
									</div>
									<div>
										<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
											Your Phone Number
										</label>
										<input
											type="tel"
											placeholder="08123456789"
											value={inquiryGuardianPhone}
											onChange={(e) => setInquiryGuardianPhone(e.target.value)}
											className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
										Message / Inquiry Details
									</label>
									<textarea
										rows={5}
										required
										placeholder="Describe your inquiry, question, or request regarding your child..."
										value={inquiryMessage}
										onChange={(e) => setInquiryMessage(e.target.value)}
										className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
									/>
								</div>

								<button
									type="submit"
									disabled={isSendingInquiry}
									className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
								>
									{isSendingInquiry ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Sending Message...</span>
										</>
									) : (
										<>
											<Send className="w-4 h-4" />
											<span>Send Inquiry to Academy</span>
										</>
									)}
								</button>
							</form>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default function GuardianPortalPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
					<div className="flex items-center gap-3">
						<Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
						<span className="text-sm font-semibold text-slate-400">Loading Guardian Portal...</span>
					</div>
				</div>
			}
		>
			<GuardianPortalContent />
		</Suspense>
	);
}
