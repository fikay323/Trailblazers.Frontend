'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import {
	getMyExamHistory,
	getMyProfile,
	uploadProfilePicture,
	deleteProfilePicture,
	getMyNotifications,
	markNotificationAsRead,
	StudentNotificationDto,
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
	Camera,
	CheckCircle2,
	ChevronRight,
	Clock,
	Flame,
	GraduationCap,
	Lock,
	LogOut,
	Loader2,
	MapPin,
	Navigation,
	Play,
	RefreshCw,
	ShieldAlert,
	Trash2,
	TrendingUp,
	User,
	Megaphone,
	Bell
} from 'lucide-react';
import {
	clockInToAttendance,
	clockOutFromAttendance,
	getStudentTodayStatus,
	getCurrentGpsPosition,
	StudentAttendanceStatsDto
} from '@/core/services/attendanceService';
import {
	getActiveAnnouncements,
	AnnouncementDto
} from '@/core/services/announcementService';
import { ProfilePictureCropModal } from '@/features/student/components/ProfilePictureCropModal';
import { DeleteProfilePictureModal } from '@/features/student/components/DeleteProfilePictureModal';

export default function StudentDashboardPage() {
	const router = useRouter();
	const { user, token, isLoading: authLoading, logout, refreshUserProfile, updateUserProfilePicture } = useAuth();

	const [history, setHistory] = useState<StudentHistoryResponseDto | null>(null);
	const [attendanceStats, setAttendanceStats] = useState<StudentAttendanceStatsDto | null>(null);
	const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
	const [notifications, setNotifications] = useState<StudentNotificationDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isClockingIn, setIsClockingIn] = useState(false);
	const [clockInError, setClockInError] = useState<string | null>(null);
	const [clockInSuccess, setClockInSuccess] = useState<string | null>(null);
	const [isClockingOut, setIsClockingOut] = useState(false);
	const [clockOutError, setClockOutError] = useState<string | null>(null);
	const [clockOutSuccess, setClockOutSuccess] = useState<string | null>(null);

	// Profile Picture state
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
	const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [profilePicFeedback, setProfilePicFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const hasLoadedUserIdRef = React.useRef<string | null>(null);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/auth/login');
			return;
		}

		if (user && hasLoadedUserIdRef.current !== user.id) {
			hasLoadedUserIdRef.current = user.id;
			loadData();
		}
	}, [user?.id, authLoading]);

	const loadData = async () => {
		if (!user) return;
		setIsLoading(true);
		setError(null);
		try {
			const [examData, attData, annData, notifData] = await Promise.allSettled([
				getMyExamHistory(user.email, token || undefined),
				getStudentTodayStatus(token || undefined),
				getActiveAnnouncements('All', token || undefined),
				getMyNotifications(user.email, token || undefined)
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

			if (annData.status === 'fulfilled') {
				setAnnouncements(annData.value);
			} else {
				console.error('Failed to load announcements:', annData.reason);
			}

			if (notifData.status === 'fulfilled' && Array.isArray(notifData.value)) {
				setNotifications(notifData.value);
			} else {
				setNotifications([]);
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAcknowledgeNotification = async (notificationId: string) => {
		try {
			await markNotificationAsRead(notificationId, token || undefined);
			setNotifications(prev =>
				prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
			);
		} catch (err) {
			console.error('Failed to mark notification as read:', err);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setProfilePicFeedback(null);
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				setSelectedImageSrc(reader.result);
				setIsCropModalOpen(true);
			}
		};
		reader.readAsDataURL(file);
		e.target.value = '';
	};

	const handleConfirmUpload = async (blob: Blob) => {
		try {
			const res = await uploadProfilePicture(blob, token || undefined, user?.email);
			updateUserProfilePicture(res.profilePictureUrl);
			setProfilePicFeedback({ type: 'success', message: 'Profile picture updated successfully.' });
			setTimeout(() => setProfilePicFeedback(null), 5000);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to upload profile picture.';
			setProfilePicFeedback({ type: 'error', message: msg });
			throw err;
		}
	};

	const handleConfirmDelete = async () => {
		try {
			await deleteProfilePicture(token || undefined, user?.email);
			updateUserProfilePicture(null);
			setProfilePicFeedback({ type: 'success', message: 'Profile picture removed successfully.' });
			setTimeout(() => setProfilePicFeedback(null), 5000);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to delete profile picture.';
			setProfilePicFeedback({ type: 'error', message: msg });
			throw err;
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
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to verify attendance. Please ensure you are inside the tutorial center.';
			setClockInError(message);
		} finally {
			setIsClockingIn(false);
		}
	};

	const handleClockOut = async () => {
		setIsClockingOut(true);
		setClockOutError(null);
		setClockOutSuccess(null);

		try {
			const position = await getCurrentGpsPosition();
			const record = await clockOutFromAttendance(
				{
					latitude: position.latitude,
					longitude: position.longitude,
					accuracyMeters: position.accuracyMeters,
					clientTimestamp: position.clientTimestamp
				},
				token || undefined
			);

			setClockOutSuccess(
				`Successfully clocked out at ${record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'} (${Math.round(record.clockOutDistanceMeters ?? 0)}m from campus). Have a safe trip home!`
			);

			// Refresh attendance stats
			const freshStats = await getStudentTodayStatus(token || undefined);
			setAttendanceStats(freshStats);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to clock out. Please ensure you are inside the tutorial center and try again.';
			setClockOutError(message);
		} finally {
			setIsClockingOut(false);
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
	const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.isRead) : [];

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
				{/* Top Welcome Bar */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
					<div className="flex items-center gap-3.5 min-w-0">
						{/* Interactive Profile Avatar */}
						<div className="relative group shrink-0">
							<div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 border-orange-500/40 bg-orange-600/15 flex items-center justify-center font-bold text-lg sm:text-xl text-orange-400 shadow-md">
								{user?.profilePictureUrl ? (
									<img
										src={user.profilePictureUrl}
										alt={user.fullName || 'Student'}
										className="h-full w-full object-cover"
									/>
								) : (
									<span>{user?.fullName?.charAt(0) || 'S'}</span>
								)}
							</div>

							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
								title="Change photo"
								aria-label="Change profile picture"
							>
								<Camera className="w-4 h-4" />
								<span className="text-[8px] font-bold tracking-wider uppercase mt-0.5">Edit</span>
							</button>
						</div>

						<div className="min-w-0">
							<h1 className="text-lg sm:text-2xl font-bold text-white truncate">
								Welcome, {user?.fullName || 'Student'}
							</h1>
							<p className="text-xs text-slate-400 font-mono truncate">
								{user?.email}
							</p>

							{/* Photo action buttons */}
							<div className="flex items-center gap-2 mt-1">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 hover:text-orange-300 hover:underline cursor-pointer"
								>
									<Camera className="w-3 h-3" />
									{user?.profilePictureUrl ? 'Change photo' : 'Upload photo'}
								</button>
								{user?.profilePictureUrl && (
									<>
										<span className="text-slate-600 text-xs">•</span>
										<button
											type="button"
											onClick={() => setIsDeleteModalOpen(true)}
											className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300 hover:underline cursor-pointer"
										>
											<Trash2 className="w-3 h-3" />
											Remove
										</button>
									</>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
						<Button
							variant="outline"
							size="sm"
							onClick={async () => {
								await refreshUserProfile();
								loadData();
							}}
							className="border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer h-8 px-3 text-xs flex items-center gap-1.5"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
							<span>Refresh</span>
						</Button>
					</div>
				</div>

				{/* Feedback banner for photo actions */}
				{profilePicFeedback && (
					<div
						className={`p-3 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
							profilePicFeedback.type === 'success'
								? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
								: 'bg-red-950/60 border-red-800 text-red-300'
						}`}
					>
						<span>{profilePicFeedback.message}</span>
						<button
							type="button"
							onClick={() => setProfilePicFeedback(null)}
							className="text-slate-400 hover:text-white ml-2 cursor-pointer font-bold"
						>
							✕
						</button>
					</div>
				)}

				{/* Student Administrative Notifications (e.g. Photo Removal with Reason) */}
				{unreadNotifications.length > 0 && (
					<div className="space-y-3">
						{unreadNotifications.map((notif) => (
							<Alert
								key={notif.id}
								className={`border shadow-lg ${
									notif.type === 'ProfilePictureRemoved'
										? 'border-red-900/60 bg-red-950/40 text-red-200 border-l-4 border-l-red-500'
										: 'border-amber-900/60 bg-amber-950/40 text-amber-200 border-l-4 border-l-amber-500'
								}`}
							>
								{notif.type === 'ProfilePictureRemoved' ? (
									<Camera className="h-5 w-5 text-red-400" />
								) : (
									<Bell className="h-5 w-5 text-amber-400" />
								)}
								<AlertTitle className="text-sm font-bold text-white flex flex-wrap items-center justify-between gap-2">
									<span className="flex items-center gap-2">
										{notif.title}
										<span className="text-[10px] font-normal text-slate-400">
											{new Date(notif.createdAt).toLocaleDateString()}
										</span>
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleAcknowledgeNotification(notif.id)}
										className="border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white text-xs h-7 px-2.5 shrink-0 cursor-pointer"
									>
										Acknowledge
									</Button>
								</AlertTitle>
								<AlertDescription className="text-xs text-slate-300 leading-relaxed mt-1">
									{notif.message}
								</AlertDescription>
							</Alert>
						))}
					</div>
				)}

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
								attendanceStats?.hasClockedOutToday
									? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
									: attendanceStats?.hasClockedInToday
									? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
									: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
							}`}>
								{attendanceStats?.hasClockedOutToday ? (
									<CheckCircle2 className="h-4 w-4" />
								) : attendanceStats?.hasClockedInToday ? (
									<CheckCircle2 className="h-4 w-4" />
								) : (
									<MapPin className="h-4 w-4" />
								)}
							</div>
							<div className="space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<h2 className="text-sm sm:text-base font-semibold text-white">Daily Attendance</h2>
									{attendanceStats?.hasClockedOutToday ? (
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
											<CheckCircle2 className="h-3 w-3" />
											Day Completed
										</span>
									) : attendanceStats?.hasClockedInToday ? (
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
									{attendanceStats?.hasClockedOutToday ? (
										<>
											Clocked in at{' '}
											<span className="text-slate-200 font-medium">
												{attendanceStats.todayRecord?.clockInTime
													? new Date(attendanceStats.todayRecord.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
													: 'Recorded'}
											</span>
											{' '}• Clocked out at{' '}
											<span className="text-blue-300 font-medium">
												{attendanceStats.todayRecord?.clockOutTime
													? new Date(attendanceStats.todayRecord.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
													: 'Recorded'}
											</span>
										</>
									) : attendanceStats?.hasClockedInToday ? (
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

						{/* Clock-In / Clock-Out Actions */}
						<div>
							{attendanceStats?.hasClockedOutToday ? (
								<span className="inline-flex text-xs text-blue-400 font-medium px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 items-center gap-1.5">
									<CheckCircle2 className="h-3.5 w-3.5" />
									Presence Completed
								</span>
							) : attendanceStats?.hasClockedInToday ? (
								<Button
									onClick={handleClockOut}
									disabled={isClockingOut}
									size="sm"
									className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm px-4 py-2 cursor-pointer shrink-0 transition-colors shadow-none flex items-center justify-center gap-1.5"
								>
									{isClockingOut ? (
										<>
											<Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400" />
											<span>Clocking Out...</span>
										</>
									) : (
										<>
											<LogOut className="h-3.5 w-3.5 text-orange-400" />
											<span>Clock Out</span>
										</>
									)}
								</Button>
							) : (
								<Button
									onClick={handleClockIn}
									disabled={isClockingIn}
									size="sm"
									className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs sm:text-sm px-4 py-2 cursor-pointer shrink-0 transition-colors shadow-none flex items-center justify-center gap-1.5"
								>
									{isClockingIn ? (
										<>
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
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
					{clockOutSuccess && (
						<div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
							<span>{clockOutSuccess}</span>
						</div>
					)}
					{clockOutError && (
						<div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
								<span className="truncate">{clockOutError}</span>
							</div>
							<button
								onClick={() => setClockOutError(null)}
								className="text-[11px] text-red-400 hover:text-red-200 underline shrink-0 ml-2"
							>
								Dismiss
							</button>
						</div>
					)}
				</div>

				{/* Academy Noticeboard Widget */}
				<div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 sm:p-5 space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
								<Megaphone className="h-4 w-4" />
							</div>
							<div>
								<h2 className="text-sm sm:text-base font-semibold text-white">Academy Noticeboard</h2>
								<p className="text-[11px] text-slate-400">Official announcements, holiday updates, and exam alerts</p>
							</div>
						</div>
						{announcements.length > 0 && (
							<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-950 text-orange-400 border border-orange-800">
								{announcements.length} {announcements.length === 1 ? 'Notice' : 'Notices'}
							</span>
						)}
					</div>

					{isLoading ? (
						<div className="space-y-2 pt-1">
							<div className="h-16 rounded-lg bg-slate-800/40 animate-pulse" />
							<div className="h-16 rounded-lg bg-slate-800/40 animate-pulse" />
						</div>
					) : announcements.length === 0 ? (
						<div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/60">
							No active announcements at this time. Check back later for academy updates.
						</div>
					) : (
						<div className="space-y-2.5 pt-1">
							{announcements.map((notice) => {
								const priorityBadgeColor =
									notice.priority === 'Urgent'
										? 'bg-red-500/15 text-red-400 border-red-500/30'
										: notice.priority === 'FeeReminder'
										? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
										: notice.priority === 'Holiday'
										? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
										: notice.priority === 'MockExamSchedule'
										? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
										: 'bg-orange-500/15 text-orange-400 border-orange-500/30';

								return (
									<div
										key={notice.id}
										className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/60 space-y-1.5"
									>
										<div className="flex flex-wrap items-center justify-between gap-1.5">
											<div className="flex items-center gap-2">
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityBadgeColor}`}
												>
													{notice.priorityName}
												</span>
												<h3 className="text-xs sm:text-sm font-bold text-white">{notice.title}</h3>
											</div>
											<span className="text-[10px] text-slate-500 flex items-center gap-1">
												<Calendar className="h-2.5 w-2.5" />
												{new Date(notice.createdAt).toLocaleDateString()}
											</span>
										</div>

										<p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-0.5">
											{notice.content}
										</p>

										<div className="text-[10px] text-slate-500 pl-0.5">
											Posted by <span className="text-slate-400 font-medium">{notice.authorName}</span>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* KPI Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3.5 sm:p-6">
							<CardTitle className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
								Account Status
							</CardTitle>
							{isDeactivated ? (
								<Lock className="h-4 w-4 text-red-400 shrink-0" />
							) : (
								<CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
							)}
						</CardHeader>
						<CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${isDeactivated
										? 'bg-red-950 text-red-400 border border-red-800'
										: 'bg-emerald-950 text-emerald-400 border border-emerald-800'
										}`}
								>
									{isDeactivated ? 'Suspended' : 'Active & Cleared'}
								</span>
							</div>
							<p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 line-clamp-1 sm:line-clamp-none">
								{isDeactivated ? 'Exam taking restricted' : 'Eligible for all mock sessions'}
							</p>
						</CardContent>
					</Card>

					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3.5 sm:p-6">
							<CardTitle className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
								Tests Taken
							</CardTitle>
							<BookOpen className="h-4 w-4 text-orange-400 shrink-0" />
						</CardHeader>
						<CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
							<div className="text-2xl sm:text-3xl font-extrabold text-white">
								{history?.totalTestsTaken ?? 0}
							</div>
							<p className="text-[10px] sm:text-xs text-slate-400 mt-1">Completed CBT sessions</p>
						</CardContent>
					</Card>

					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3.5 sm:p-6">
							<CardTitle className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
								Avg Performance
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-cyan-400 shrink-0" />
						</CardHeader>
						<CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
							<div className="text-2xl sm:text-3xl font-extrabold text-white">
								{history?.averagePercentage ?? 0}%
							</div>
							<p className="text-[10px] sm:text-xs text-slate-400 mt-1">Mock exam average</p>
						</CardContent>
					</Card>

					<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3.5 sm:p-6">
							<CardTitle className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
								Highest Score
							</CardTitle>
							<Award className="h-4 w-4 text-yellow-400 shrink-0" />
						</CardHeader>
						<CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
							<div className="text-2xl sm:text-3xl font-extrabold text-white">
								{history?.highestPercentage ?? 0}%
							</div>
							<p className="text-[10px] sm:text-xs text-slate-400 mt-1">Personal best percentage</p>
						</CardContent>
					</Card>
				</div>

				{/* Action Banner: Take Exam */}
				<div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/30 p-4 sm:p-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
						<div className="space-y-1.5 sm:space-y-2 max-w-2xl">
							<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-600/20 text-orange-400 border border-orange-500/20">
								<GraduationCap className="h-3.5 w-3.5" />
								JAMB UTME Mock CBT Engine
							</div>
							<h2 className="text-lg sm:text-2xl font-bold text-white">
								Ready to test your knowledge?
							</h2>
							<p className="text-xs sm:text-sm text-slate-300">
								Timed simulations with verified JAMB questions, automatic marking, and comprehensive answer explanations.
							</p>
						</div>

						<div className="w-full md:w-auto">
							{isDeactivated ? (
								<div className="space-y-2 text-left md:text-right">
									<Button
										disabled
										className="w-full sm:w-auto bg-slate-800 text-slate-500 cursor-not-allowed font-semibold px-6 py-5 sm:py-6"
									>
										<Lock className="mr-2 h-4 w-4" />
										Exam Taking Suspended
									</Button>
									<p className="text-xs text-red-400">
										Resolve fee balance with academy to resume
									</p>
								</div>
							) : (
								<Link href="/exam" className="block w-full sm:w-auto">
									<Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-5 sm:py-6 cursor-pointer shadow-lg shadow-orange-950/50 flex items-center justify-center">
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
					<CardHeader className="border-b border-slate-800/80 p-4 sm:p-6 pb-3 sm:pb-4">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base sm:text-lg font-bold text-white">
									Past Exam Attempts & Performance
								</CardTitle>
								<CardDescription className="text-slate-400 text-xs mt-0.5 sm:mt-1">
									Detailed record of all mock exams completed by your account.
								</CardDescription>
							</div>
							<span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
								{history?.attempts.length ?? 0} Record(s)
							</span>
						</div>
					</CardHeader>

					<CardContent className="p-0">
						{(!history || history.attempts.length === 0) ? (
							<div className="py-12 px-4 text-center text-slate-400">
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
							<>
								{/* Mobile Stacked Card View (sm:hidden) */}
								<div className="sm:hidden divide-y divide-slate-800/60">
									{history.attempts.map((attempt) => {
										const isPassing = attempt.percentage >= 50;
										return (
											<div key={attempt.sessionId} className="p-3.5 space-y-2.5">
												<div className="flex items-center justify-between gap-2">
													<div className="flex items-center gap-1.5 font-bold text-white text-xs">
														<Calendar className="h-3.5 w-3.5 text-orange-400 shrink-0" />
														<span>{attempt.targetYear} JAMB UTME</span>
													</div>
													<span
														className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${isPassing
															? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
															: 'bg-red-950 text-red-400 border border-red-800'
															}`}
													>
														{attempt.percentage}%
													</span>
												</div>

												<div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/50">
													<div className="space-y-0.5">
														<div className="text-[10px] uppercase tracking-wider text-slate-500">Score</div>
														<div className="font-mono font-bold text-slate-200 text-sm">
															{attempt.totalScore} <span className="text-xs text-slate-500 font-normal">/ {attempt.totalQuestions}</span>
														</div>
													</div>
													<div className="text-right space-y-0.5">
														<div className="text-[10px] uppercase tracking-wider text-slate-500">Completed</div>
														<div className="flex items-center justify-end gap-1 text-[11px] text-slate-300">
															<Clock className="h-3 w-3 text-slate-500" />
															{new Date(attempt.completedAt).toLocaleDateString(undefined, {
																month: 'short',
																day: 'numeric',
																year: 'numeric'
															})}
														</div>
													</div>
												</div>

												<Link href={`/exam/result/${attempt.sessionId}`} className="block w-full">
													<Button
														variant="outline"
														size="sm"
														className="w-full border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white text-xs cursor-pointer h-8 flex items-center justify-center gap-1.5"
													>
														<span>View Full Report</span>
														<ChevronRight className="h-3.5 w-3.5" />
													</Button>
												</Link>
											</div>
										);
									})}
								</div>

								{/* Desktop Table View (hidden sm:block) */}
								<div className="hidden sm:block overflow-x-auto">
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
															<Link href={`/exam/result/${attempt.sessionId}`}>
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
							</>
						)}
					</CardContent>
				</Card>

				{/* Hidden file input for avatar upload */}
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileSelect}
					accept="image/jpeg,image/png,image/webp"
					className="hidden"
				/>

				{/* Cropping Modal */}
				<ProfilePictureCropModal
					isOpen={isCropModalOpen}
					imageSrc={selectedImageSrc}
					onClose={() => {
						setIsCropModalOpen(false);
						setSelectedImageSrc(null);
					}}
					onConfirmUpload={handleConfirmUpload}
				/>

				{/* Delete Confirmation Modal */}
				<DeleteProfilePictureModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirmDelete={handleConfirmDelete}
				/>
			</div>
		</div>
	);
}
