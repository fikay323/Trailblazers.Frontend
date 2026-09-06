'use client';

import React, { useState, useEffect } from 'react';
import {
	getDailyAttendanceRoster,
	overrideAttendanceStatus,
	getAttendanceSettings,
	updateAttendanceSettings,
	getCurrentGpsPosition,
	DailyRosterResponseDto,
	RosterStudentItemDto,
	AttendanceSettingDto,
	AttendanceStatus
} from '@/core/services/attendanceService';
import { useAuth } from '@/core/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataPagination } from '@/components/ui/DataPagination';
import {
	Calendar,
	Clock,
	Search,
	RefreshCw,
	UserCheck,
	UserX,
	CheckCircle2,
	AlertCircle,
	MapPin,
	Sliders,
	Download,
	X,
	ShieldCheck,
	Navigation
} from 'lucide-react';

interface AttendanceManagementViewProps {
	apiKey: string;
}

export function AttendanceManagementView({ apiKey }: AttendanceManagementViewProps) {
	const { user } = useAuth();
	const isAdmin = !user || user.role === 'Admin';

	// Today in YYYY-MM-DD
	const getTodayStr = () => {
		const d = new Date();
		return d.toISOString().split('T')[0];
	};

	const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
	const [roster, setRoster] = useState<DailyRosterResponseDto | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filtering
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent' | 'excused'>('all');

	// Pagination
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Override Modal
	const [overrideStudent, setOverrideStudent] = useState<RosterStudentItemDto | null>(null);
	const [targetStatus, setTargetStatus] = useState<AttendanceStatus>('Present');
	const [overrideRemark, setOverrideRemark] = useState('');
	const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

	// Settings Modal
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [settings, setSettings] = useState<AttendanceSettingDto | null>(null);
	const [isLoadingSettings, setIsLoadingSettings] = useState(false);
	const [isSavingSettings, setIsSavingSettings] = useState(false);
	const [isAcquiringLocation, setIsAcquiringLocation] = useState(false);
	const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

	useEffect(() => {
		loadRoster(selectedDate);
	}, [selectedDate, apiKey]);

	const loadRoster = async (dateStr: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await getDailyAttendanceRoster(dateStr, apiKey);
			setRoster(data);
		} catch (err: any) {
			setError(err.message || 'Failed to load daily attendance roster.');
		} finally {
			setIsLoading(false);
		}
	};

	// Open Settings Modal & Load Config
	const handleOpenSettings = async () => {
		setIsSettingsOpen(true);
		setIsLoadingSettings(true);
		setSettingsFeedback(null);
		try {
			const data = await getAttendanceSettings(apiKey);
			setSettings(data);
		} catch (err: any) {
			setSettingsFeedback(err.message || 'Failed to load settings.');
		} finally {
			setIsLoadingSettings(false);
		}
	};

	// Use Current GPS as Campus Pin
	const handleUseCurrentLocation = async () => {
		setIsAcquiringLocation(true);
		setSettingsFeedback(null);
		try {
			const pos = await getCurrentGpsPosition();
			if (settings) {
				setSettings({
					...settings,
					centerLatitude: Number(pos.latitude.toFixed(6)),
					centerLongitude: Number(pos.longitude.toFixed(6)),
					maxAllowedAccuracyMeters: Math.max(80, Math.round(pos.accuracyMeters * 1.5))
				});
				setSettingsFeedback(`Captured device GPS: ${pos.latitude.toFixed(5)}, ${pos.longitude.toFixed(5)} (Accuracy: ±${Math.round(pos.accuracyMeters)}m)`);
			}
		} catch (err: any) {
			setSettingsFeedback(err.message || 'Unable to acquire GPS coordinates.');
		} finally {
			setIsAcquiringLocation(false);
		}
	};

	// Save Settings
	const handleSaveSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!settings) return;
		setIsSavingSettings(true);
		setSettingsFeedback(null);
		try {
			const updated = await updateAttendanceSettings(settings, apiKey);
			setSettings(updated);
			setSettingsFeedback('Attendance & Geofence settings saved successfully!');
			setTimeout(() => {
				setIsSettingsOpen(false);
				setSettingsFeedback(null);
			}, 1200);
		} catch (err: any) {
			setSettingsFeedback(err.message || 'Failed to save settings.');
		} finally {
			setIsSavingSettings(false);
		}
	};

	// Quick Override: Open modal for remarks
	const handleInitiateOverride = (student: RosterStudentItemDto, status: AttendanceStatus) => {
		setOverrideStudent(student);
		setTargetStatus(status);
		setOverrideRemark(
			status === 'Present'
				? 'Verified by Instructor (phone unavailable)'
				: status === 'Absent'
				? 'Left premises / Revoked by Instructor'
				: 'Excused with approved permission'
		);
	};

	// Confirm Override
	const handleConfirmOverride = async () => {
		if (!overrideStudent) return;
		setIsSubmittingOverride(true);
		try {
			await overrideAttendanceStatus(
				{
					studentId: overrideStudent.studentId,
					date: selectedDate,
					status: targetStatus,
					remarks: overrideRemark.trim() || undefined
				},
				apiKey
			);

			// Refresh roster silently
			await loadRoster(selectedDate);
			setOverrideStudent(null);
		} catch (err: any) {
			alert(err.message || 'Failed to update attendance status.');
		} finally {
			setIsSubmittingOverride(false);
		}
	};

	// Export to CSV
	const handleExportCsv = () => {
		if (!roster || roster.students.length === 0) return;

		const headers = ['Student Name', 'Email', 'Phone', 'Date', 'Status', 'Clock-In Time', 'Distance (m)', 'Verification Source', 'Remarks'];
		const rows = roster.students.map((s) => [
			`"${s.studentName.replace(/"/g, '""')}"`,
			`"${s.studentEmail}"`,
			`"${s.phoneNumber || ''}"`,
			selectedDate,
			s.status,
			s.clockInTime ? new Date(s.clockInTime).toLocaleTimeString() : '',
			s.distanceMeters ?? '',
			s.verificationType === 'Geolocated' ? 'GPS Geolocated' : s.verificationType === 'ManualStaff' ? `Manual (${s.markedByUserName || 'Staff'})` : 'None',
			`"${(s.remarks || '').replace(/"/g, '""')}"`
		]);

		const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `trailblazer-attendance-${selectedDate}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

function normalizeAttendanceStatus(val: any): AttendanceStatus {
	if (val === 1 || val === 'Present') return 'Present';
	if (val === 2 || val === 'Late') return 'Late';
	if (val === 3 || val === 'Absent') return 'Absent';
	if (val === 4 || val === 'Excused') return 'Excused';
	return (val as AttendanceStatus) || 'Absent';
}

	// Filtered students list
	const allStudents = roster?.students || [];
	const filteredStudents = allStudents.filter((s) => {
		const matchSearch =
			s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(s.phoneNumber && s.phoneNumber.includes(searchTerm));

		const sStatus = normalizeAttendanceStatus(s.status);
		if (statusFilter === 'present') return matchSearch && sStatus === 'Present';
		if (statusFilter === 'late') return matchSearch && sStatus === 'Late';
		if (statusFilter === 'absent') return matchSearch && sStatus === 'Absent';
		if (statusFilter === 'excused') return matchSearch && sStatus === 'Excused';
		return matchSearch;
	});

	const totalPages = Math.ceil(filteredStudents.length / pageSize);
	const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

	// Quick Date Setters
	const setDateOffset = (offsetDays: number) => {
		const d = new Date();
		d.setDate(d.getDate() + offsetDays);
		setSelectedDate(d.toISOString().split('T')[0]);
		setPage(1);
	};

	return (
		<div className="space-y-6">
			{/* Top Action Bar */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
				<div>
					<h2 className="text-xl font-bold text-white flex items-center gap-2">
						<Calendar className="h-5 w-5 text-orange-400" />
						Daily Attendance Register
					</h2>
					<p className="text-xs text-slate-400 mt-1">
						Geolocated physical arrival verification, lateness detection, and manual roster overrides.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2.5">
					{/* Date Selector */}
					<div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
						<Calendar className="h-4 w-4 text-slate-400" />
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => {
								setSelectedDate(e.target.value);
								setPage(1);
							}}
							className="bg-transparent text-white focus:outline-none cursor-pointer"
						/>
					</div>

					{/* Quick Dates */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setDateOffset(0)}
						className={`text-xs h-8 px-2.5 cursor-pointer ${
							selectedDate === getTodayStr()
								? 'bg-orange-950/60 text-orange-300 border-orange-800'
								: 'border-slate-800 text-slate-300 hover:bg-slate-800'
						}`}
					>
						Today
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setDateOffset(-1)}
						className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-8 px-2.5 cursor-pointer"
					>
						Yesterday
					</Button>

					{/* Refresh Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => loadRoster(selectedDate)}
						disabled={isLoading}
						className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-8 px-2.5 cursor-pointer flex items-center gap-1"
					>
						<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
						Refresh
					</Button>

					{/* Export CSV */}
					<Button
						variant="outline"
						size="sm"
						onClick={handleExportCsv}
						disabled={!roster || roster.students.length === 0}
						className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-8 px-2.5 cursor-pointer flex items-center gap-1"
					>
						<Download className="h-3.5 w-3.5 text-slate-400" />
						Export CSV
					</Button>

					{/* Admin Geofence Settings */}
					{isAdmin && (
						<Button
							size="sm"
							onClick={handleOpenSettings}
							className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-8 px-3 cursor-pointer flex items-center gap-1.5 border border-slate-700 shadow-xs"
						>
							<Sliders className="h-3.5 w-3.5 text-orange-400" />
							Settings
						</Button>
					)}
				</div>
			</div>

			{/* KPI Summary Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
				<Card className="border-slate-800 bg-slate-900/60">
					<CardHeader className="pb-1 pt-3 px-4">
						<CardTitle className="text-[11px] uppercase font-semibold text-slate-400">
							Enrolled
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-3">
						<div className="text-xl font-bold text-white">{roster?.totalEnrolled ?? '—'}</div>
						<p className="text-[10px] text-slate-500 mt-0.5">Students in directory</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60">
					<CardHeader className="pb-1 pt-3 px-4">
						<CardTitle className="text-[11px] uppercase font-semibold text-emerald-400">
							Present On-Time
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-3">
						<div className="text-xl font-bold text-emerald-400">{roster?.presentCount ?? '—'}</div>
						<p className="text-[10px] text-slate-500 mt-0.5">Verified on premises</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60">
					<CardHeader className="pb-1 pt-3 px-4">
						<CardTitle className="text-[11px] uppercase font-semibold text-amber-400">
							Late Arrivals
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-3">
						<div className="text-xl font-bold text-amber-400">{roster?.lateCount ?? '—'}</div>
						<p className="text-[10px] text-slate-500 mt-0.5">Past cutoff time</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60">
					<CardHeader className="pb-1 pt-3 px-4">
						<CardTitle className="text-[11px] uppercase font-semibold text-red-400">
							Absent Today
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-3">
						<div className="text-xl font-bold text-red-400">{roster?.absentCount ?? '—'}</div>
						<p className="text-[10px] text-slate-500 mt-0.5">Unclocked students</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 col-span-2 lg:col-span-1">
					<CardHeader className="pb-1 pt-3 px-4">
						<CardTitle className="text-[11px] uppercase font-semibold text-cyan-400">
							Attendance Rate
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-3">
						<div className="text-xl font-bold text-cyan-400">
							{roster && roster.totalEnrolled > 0
								? `${Math.round(((roster.presentCount + roster.lateCount) / roster.totalEnrolled) * 100)}%`
								: '—'}
						</div>
						<p className="text-[10px] text-slate-500 mt-0.5">Cohort participation</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
					<Input
						placeholder="Search student name, email, or phone..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1);
						}}
						className="pl-9 border-slate-800 bg-slate-900/60 text-white placeholder-slate-500 text-xs h-9"
					/>
				</div>

				{/* Status Filters */}
				<div className="flex flex-wrap rounded-md border border-slate-800 p-1 bg-slate-900/60 text-xs">
					<button
						onClick={() => {
							setStatusFilter('all');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
						}`}
					>
						All ({roster?.totalEnrolled ?? 0})
					</button>
					<button
						onClick={() => {
							setStatusFilter('present');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							statusFilter === 'present' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'text-slate-400 hover:text-white'
						}`}
					>
						Present ({roster?.presentCount ?? 0})
					</button>
					<button
						onClick={() => {
							setStatusFilter('late');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							statusFilter === 'late' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' : 'text-slate-400 hover:text-white'
						}`}
					>
						Late ({roster?.lateCount ?? 0})
					</button>
					<button
						onClick={() => {
							setStatusFilter('absent');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							statusFilter === 'absent' ? 'bg-red-950 text-red-300 border border-red-800/50' : 'text-slate-400 hover:text-white'
						}`}
					>
						Absent ({roster?.absentCount ?? 0})
					</button>
					<button
						onClick={() => {
							setStatusFilter('excused');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							statusFilter === 'excused' ? 'bg-blue-950 text-blue-300 border border-blue-800/50' : 'text-slate-400 hover:text-white'
						}`}
					>
						Excused ({roster?.excusedCount ?? 0})
					</button>
				</div>
			</div>

			{/* Error Banner */}
			{error && (
				<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Roster Table */}
			<Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
				<CardContent className="p-0">
					{isLoading ? (
						<div className="py-16 text-center text-slate-400">
							<RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
							<p className="text-sm">Loading attendance register for {selectedDate}...</p>
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="py-16 text-center text-slate-400">
							<p className="text-base font-semibold text-slate-300">No students match this filter.</p>
							<p className="text-xs text-slate-500 mt-1">Try adjusting your date or search keywords.</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
										<tr>
											<th className="py-3.5 px-4 sm:px-6">Student</th>
											<th className="py-3.5 px-4">Status</th>
											<th className="py-3.5 px-4">Arrival Time</th>
											<th className="py-3.5 px-4">Verification & Distance</th>
											<th className="py-3.5 px-4">Remarks / Audit Note</th>
											<th className="py-3.5 px-4 sm:px-6 text-right">Instructor Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-800/60">
										{paginatedStudents.map((s) => {
											const status = normalizeAttendanceStatus(s.status);
											const isPresent = status === 'Present';
											const isLate = status === 'Late';
											const isAbsent = status === 'Absent';
											const isExcused = status === 'Excused';

											return (
												<tr key={s.studentId} className="hover:bg-slate-800/30 transition-colors">
													<td className="py-3.5 px-4 sm:px-6">
														<div className="font-semibold text-white">{s.studentName}</div>
														<div className="text-xs text-slate-400 font-mono">{s.studentEmail}</div>
														{s.phoneNumber && (
															<div className="text-[11px] text-slate-500">{s.phoneNumber}</div>
														)}
													</td>

													{/* Status Badge */}
													<td className="py-3.5 px-4">
														<span
															className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
																isPresent
																	? 'bg-emerald-950 text-emerald-300 border-emerald-800'
																	: isLate
																	? 'bg-amber-950 text-amber-300 border-amber-800'
																	: isExcused
																	? 'bg-blue-950 text-blue-300 border-blue-800'
																	: 'bg-red-950 text-red-300 border-red-800'
															}`}
														>
															{status}
														</span>
													</td>

													{/* Arrival Time */}
													<td className="py-3.5 px-4 font-mono text-xs text-slate-200">
														{s.clockInTime ? (
															<span className="flex items-center gap-1 text-white">
																<Clock className="h-3.5 w-3.5 text-orange-400" />
																{new Date(s.clockInTime).toLocaleTimeString([], {
																	hour: '2-digit',
																	minute: '2-digit'
																})}
															</span>
														) : (
															<span className="text-slate-600">—</span>
														)}
													</td>

													{/* Verification & Distance */}
													<td className="py-3.5 px-4 text-xs text-slate-300">
														{s.verificationType === 'Geolocated' ? (
															<div className="space-y-0.5">
																<div className="flex items-center gap-1 text-emerald-400 font-medium">
																	<MapPin className="h-3 w-3" />
																	<span>GPS Verified</span>
																	{s.distanceMeters !== null && s.distanceMeters !== undefined && (
																		<span className="text-[10px] text-slate-400">
																			({Math.round(s.distanceMeters)}m away)
																		</span>
																	)}
																</div>
																{s.accuracyMeters && (
																	<div className="text-[10px] text-slate-500">
																		Accuracy: ±{Math.round(s.accuracyMeters)}m
																	</div>
																)}
															</div>
														) : s.verificationType === 'ManualStaff' ? (
															<div className="text-cyan-400 flex items-center gap-1 font-medium">
																<ShieldCheck className="h-3.5 w-3.5" />
																<span>Manual ({s.markedByUserName || 'Staff'})</span>
															</div>
														) : (
															<span className="text-slate-600">—</span>
														)}
													</td>

													{/* Remarks */}
													<td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate" title={s.remarks || ''}>
														{s.remarks || '—'}
													</td>

													{/* Actions */}
													<td className="py-3.5 px-4 sm:px-6 text-right">
														<div className="flex items-center justify-end gap-1.5">
															{isAbsent ? (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleInitiateOverride(s, 'Present')}
																	className="text-xs h-7 px-2.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 cursor-pointer flex items-center gap-1"
																>
																	<UserCheck className="h-3 w-3" />
																	Mark Present
																</Button>
															) : (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleInitiateOverride(s, 'Absent')}
																	className="text-xs h-7 px-2.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 cursor-pointer flex items-center gap-1"
																>
																	<UserX className="h-3 w-3" />
																	Unmark (Absent)
																</Button>
															)}

															<Button
																variant="outline"
																size="sm"
																onClick={() => handleInitiateOverride(s, 'Excused')}
																className="text-xs h-7 px-2 text-slate-400 hover:text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800 cursor-pointer"
																title="Mark Excused"
															>
																Excused
															</Button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							{filteredStudents.length > 0 && (
								<div className="p-4 pt-0">
									<DataPagination
										currentPage={page}
										totalPages={totalPages}
										totalCount={filteredStudents.length}
										pageSize={pageSize}
										pageSizeOptions={[10, 20, 50, 100]}
										itemName="students"
										onPageChange={setPage}
										onPageSizeChange={(newSize) => {
											setPageSize(newSize);
											setPage(1);
										}}
										disabled={isLoading}
									/>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* MODAL: Override Attendance Status */}
			{overrideStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<Card className="w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
						<CardHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-base font-bold text-white">
									Update Attendance Record
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Candidate: <span className="text-white font-semibold">{overrideStudent.studentName}</span>
								</CardDescription>
							</div>
							<button
								onClick={() => setOverrideStudent(null)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<div className="p-4 space-y-4 text-xs">
							<div>
								<label className="block text-slate-300 font-semibold mb-1">Target Status:</label>
								<div className="grid grid-cols-4 gap-2">
									{(['Present', 'Late', 'Absent', 'Excused'] as AttendanceStatus[]).map((st) => (
										<button
											key={st}
											type="button"
											onClick={() => setTargetStatus(st)}
											className={`py-1.5 px-2 rounded font-semibold border text-center cursor-pointer transition-colors ${
												targetStatus === st
													? st === 'Present'
														? 'bg-emerald-950 text-emerald-300 border-emerald-800'
														: st === 'Late'
														? 'bg-amber-950 text-amber-300 border-amber-800'
														: st === 'Excused'
														? 'bg-blue-950 text-blue-300 border-blue-800'
														: 'bg-red-950 text-red-300 border-red-800'
													: 'border-slate-800 text-slate-400 bg-slate-950 hover:text-white'
											}`}
										>
											{st}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="block text-slate-300 font-semibold mb-1">Remarks / Reason:</label>
								<Input
									value={overrideRemark}
									onChange={(e) => setOverrideRemark(e.target.value)}
									placeholder="e.g. Phone battery died, verified physically by Tutor"
									className="border-slate-800 bg-slate-950 text-white text-xs h-9"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setOverrideStudent(null)}
									className="border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleConfirmOverride}
									disabled={isSubmittingOverride}
									className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
								>
									{isSubmittingOverride ? 'Saving...' : 'Apply Update'}
								</Button>
							</div>
						</div>
					</Card>
				</div>
			)}

			{/* MODAL: Admin Geofence & Lateness Settings */}
			{isSettingsOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
						<CardHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-base font-bold text-white flex items-center gap-2">
									<Sliders className="h-4 w-4 text-orange-400" />
									Tutorial Geofence & Schedule Settings
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Configure campus GPS center coordinates, boundary radius, and lateness cutoff.
								</CardDescription>
							</div>
							<button
								onClick={() => setIsSettingsOpen(false)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<form onSubmit={handleSaveSettings} className="p-4 space-y-4 text-xs">
							{settingsFeedback && (
								<div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
									{settingsFeedback}
								</div>
							)}

							{isLoadingSettings ? (
								<div className="py-8 text-center text-slate-400">Loading settings...</div>
							) : settings ? (
								<>
									{/* Coordinates */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<label className="text-slate-300 font-semibold">Center GPS Coordinates:</label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={handleUseCurrentLocation}
												disabled={isAcquiringLocation}
												className="border-orange-800/80 bg-orange-950/40 text-orange-300 hover:bg-orange-950 text-[11px] h-7 px-2 cursor-pointer flex items-center gap-1"
											>
												<Navigation className={`h-3 w-3 ${isAcquiringLocation ? 'animate-spin' : ''}`} />
												{isAcquiringLocation ? 'Detecting GPS...' : 'Use My Current Location as Pin'}
											</Button>
										</div>

										<div className="grid grid-cols-2 gap-2">
											<div>
												<span className="text-[10px] text-slate-500">Latitude:</span>
												<Input
													type="number"
													step="0.000001"
													value={settings.centerLatitude}
													onChange={(e) => setSettings({ ...settings, centerLatitude: parseFloat(e.target.value) || 0 })}
													className="border-slate-800 bg-slate-950 text-white font-mono text-xs h-8"
													required
												/>
											</div>
											<div>
												<span className="text-[10px] text-slate-500">Longitude:</span>
												<Input
													type="number"
													step="0.000001"
													value={settings.centerLongitude}
													onChange={(e) => setSettings({ ...settings, centerLongitude: parseFloat(e.target.value) || 0 })}
													className="border-slate-800 bg-slate-950 text-white font-mono text-xs h-8"
													required
												/>
											</div>
										</div>
									</div>

									{/* Radius & Accuracy Threshold */}
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-slate-300 font-semibold mb-1">Allowed Radius:</label>
											<select
												value={settings.allowedRadiusMeters}
												onChange={(e) => setSettings({ ...settings, allowedRadiusMeters: parseInt(e.target.value) || 100 })}
												className="w-full h-8 rounded border border-slate-800 bg-slate-950 px-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
											>
												<option value={50}>50 meters (Compact building)</option>
												<option value={100}>100 meters (Standard campus)</option>
												<option value={150}>150 meters (Medium grounds)</option>
												<option value={200}>200 meters (Large compound)</option>
												<option value={300}>300 meters (Expansive)</option>
											</select>
										</div>

										<div>
											<label className="block text-slate-300 font-semibold mb-1">Max GPS Accuracy Radius:</label>
											<Input
												type="number"
												value={settings.maxAllowedAccuracyMeters}
												onChange={(e) => setSettings({ ...settings, maxAllowedAccuracyMeters: parseInt(e.target.value) || 80 })}
												className="border-slate-800 bg-slate-950 text-white text-xs h-8 font-mono"
												required
											/>
											<span className="text-[10px] text-slate-500">Authenticity threshold (default: 80m)</span>
										</div>
									</div>

									{/* Schedule Times */}
									<div className="border-t border-slate-800 pt-3 space-y-2">
										<h4 className="text-slate-300 font-semibold">Attendance Time Windows:</h4>
										<div className="grid grid-cols-3 gap-2">
											<div>
												<span className="text-[10px] text-slate-500">Opens At:</span>
												<Input
													type="time"
													value={settings.earliestClockInTime}
													onChange={(e) => setSettings({ ...settings, earliestClockInTime: e.target.value })}
													className="border-slate-800 bg-slate-950 text-white text-xs h-8 font-mono"
													required
												/>
											</div>

											<div>
												<span className="text-[10px] text-amber-400 font-semibold">Late After:</span>
												<Input
													type="time"
													value={settings.lateCutoffTime}
													onChange={(e) => setSettings({ ...settings, lateCutoffTime: e.target.value })}
													className="border-amber-800/80 bg-slate-950 text-amber-300 text-xs h-8 font-mono font-bold"
													required
												/>
											</div>

											<div>
												<span className="text-[10px] text-slate-500">Closes At:</span>
												<Input
													type="time"
													value={settings.latestClockInTime}
													onChange={(e) => setSettings({ ...settings, latestClockInTime: e.target.value })}
													className="border-slate-800 bg-slate-950 text-white text-xs h-8 font-mono"
													required
												/>
											</div>
										</div>
										<p className="text-[10px] text-slate-500">
											Students clocking in after the <strong className="text-amber-400">Late After</strong> time will be automatically tagged as <span className="text-amber-400 font-semibold">Late</span>.
										</p>
									</div>

									<div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setIsSettingsOpen(false)}
											className="border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
										>
											Cancel
										</Button>
										<Button
											type="submit"
											size="sm"
											disabled={isSavingSettings}
											className="bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
										>
											{isSavingSettings ? 'Saving...' : 'Save Configuration'}
										</Button>
									</div>
								</>
							) : null}
						</form>
					</Card>
				</div>
			)}
		</div>
	);
}
