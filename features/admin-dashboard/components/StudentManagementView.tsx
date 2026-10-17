'use client';

import React, { useState, useEffect } from 'react';
import {
	getAllStudents,
	toggleStudentStatus,
	getStudentHistory,
	deleteStudentProfilePictureByAdmin,
	AdminStudentListItem,
	StudentHistoryResult
} from '@/core/services/adminService';
import { useAuth } from '@/core/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Search,
	RefreshCw,
	UserCheck,
	UserX,
	Lock,
	Unlock,
	GraduationCap,
	Eye,
	AlertCircle,
	CheckCircle,
	Calendar,
	Clock,
	X,
	FileText,
	ShieldAlert,
	Phone,
	Send,
	Mail,
	MessageSquare,
	Loader2,
	Camera
} from 'lucide-react';
import { DataPagination } from '@/components/ui/DataPagination';
import {
	getGuardianReportPreview,
	sendGuardianReport,
	GuardianReportPreviewDto
} from '@/core/services/guardianReportService';

function getInitials(fullName: string): string {
	if (!fullName) return 'S';
	const parts = fullName.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return 'S';
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PRESET_PHOTO_REMOVAL_REASONS = [
	{
		id: 'inappropriate',
		label: 'Inappropriate or non-compliant image',
		defaultText: 'Your profile picture was removed as it does not comply with our student code of conduct. Please upload an appropriate academic portrait.'
	},
	{
		id: 'blurry',
		label: 'Blurry, pixelated or low-resolution image',
		defaultText: 'Your profile picture was removed due to poor image clarity or low resolution. Please upload a clear, focused passport-style photograph.'
	},
	{
		id: 'not_student',
		label: 'Not a clear or recognizable portrait of the student',
		defaultText: 'Your profile picture was removed because it does not show a clear, identifiable view of your face. Please upload a genuine portrait.'
	},
	{
		id: 'offensive',
		label: 'Offensive or trademarked material',
		defaultText: 'Your profile picture was removed because it contains unauthorized, promotional, or inappropriate graphics.'
	},
	{
		id: 'custom',
		label: 'Custom reason (specify below)',
		defaultText: ''
	}
];

interface StudentManagementViewProps {
	apiKey: string;
}

const PRESET_DEACTIVATION_REASONS = [
	{
		id: 'tuition',
		label: 'Outstanding Tuition Fee (Current Term)',
		defaultText: 'Outstanding Tuition Fee. Please clear your current term tuition balance with the bursary.'
	},
	{
		id: 'cbt_fee',
		label: 'Unpaid CBT / Mock Exam Assessment Fee',
		defaultText: 'Unpaid CBT Mock Exam Assessment Fee. Mock exam registration fee must be settled before taking tests.'
	},
	{
		id: 'summer_fee',
		label: 'Unpaid Summer Coaching / Extension Lesson Fee',
		defaultText: 'Unpaid Summer Coaching / Extension Lesson Fee. Please verify payment at the front desk.'
	},
	{
		id: 'documents',
		label: 'Incomplete Registration / Document Verification Pending',
		defaultText: 'Incomplete Registration. Please submit your required identification and academic credentials.'
	},
	{
		id: 'disciplinary',
		label: 'Disciplinary Suspension / Academic Conduct Review',
		defaultText: 'Academic account suspended pending disciplinary review.'
	},
	{
		id: 'custom',
		label: 'Custom Specific Reason (Specify below)',
		defaultText: ''
	}
];

export function StudentManagementView({ apiKey }: StudentManagementViewProps) {
	const { user } = useAuth();
	const isAdmin = !user || user.role === 'Admin';

	const [students, setStudents] = useState<AdminStudentListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

	// Pagination State
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Status Toggle Modal State
	const [selectedStudent, setSelectedStudent] = useState<AdminStudentListItem | null>(null);
	const [selectedReasonId, setSelectedReasonId] = useState<string>('tuition');
	const [customReasonNote, setCustomReasonNote] = useState<string>('');
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [statusModalError, setStatusModalError] = useState<string | null>(null);

	// History Modal State
	const [historyStudent, setHistoryStudent] = useState<AdminStudentListItem | null>(null);
	const [studentHistory, setStudentHistory] = useState<StudentHistoryResult | null>(null);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

	// Guardian Report Modal State
	const [guardianModalStudent, setGuardianModalStudent] = useState<AdminStudentListItem | null>(null);
	const [guardianStartDate, setGuardianStartDate] = useState<string>(() => {
		const d = new Date();
		d.setDate(d.getDate() - 30);
		return d.toISOString().split('T')[0];
	});
	const [guardianEndDate, setGuardianEndDate] = useState<string>(() => {
		return new Date().toISOString().split('T')[0];
	});
	const [guardianName, setGuardianName] = useState<string>('');
	const [guardianEmail, setGuardianEmail] = useState<string>('');
	const [guardianPhone, setGuardianPhone] = useState<string>('');
	const [reportChannel, setReportChannel] = useState<'Email' | 'Sms' | 'Both'>('Email');
	const [customRemarks, setCustomRemarks] = useState<string>('');
	const [reportPreview, setReportPreview] = useState<GuardianReportPreviewDto | null>(null);
	const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
	const [isSendingReport, setIsSendingReport] = useState<boolean>(false);
	const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);
	const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(null);

	// Photo Deletion Modal State
	const [photoDeleteStudent, setPhotoDeleteStudent] = useState<AdminStudentListItem | null>(null);
	const [selectedPhotoReasonId, setSelectedPhotoReasonId] = useState<string>('inappropriate');
	const [customPhotoReasonNote, setCustomPhotoReasonNote] = useState<string>('');
	const [isDeletingPhoto, setIsDeletingPhoto] = useState<boolean>(false);
	const [photoDeleteModalError, setPhotoDeleteModalError] = useState<string | null>(null);
	const [photoDeleteSuccessMessage, setPhotoDeleteSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		loadStudents();
	}, [apiKey]);

	const loadStudents = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const list = await getAllStudents(apiKey);
			setStudents(list);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to load students.';
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenDeletePhotoModal = (student: AdminStudentListItem) => {
		setPhotoDeleteStudent(student);
		setSelectedPhotoReasonId('inappropriate');
		setCustomPhotoReasonNote('');
		setPhotoDeleteModalError(null);
	};

	const handleConfirmDeleteStudentPhoto = async () => {
		if (!photoDeleteStudent) return;
		setIsDeletingPhoto(true);
		setPhotoDeleteModalError(null);

		let finalReason = '';
		if (selectedPhotoReasonId === 'custom') {
			finalReason = customPhotoReasonNote.trim() || 'Profile photo was removed by academy administration.';
		} else {
			const preset = PRESET_PHOTO_REMOVAL_REASONS.find(p => p.id === selectedPhotoReasonId);
			const base = preset?.defaultText || 'Profile photo was removed by academy administration.';
			finalReason = customPhotoReasonNote.trim() ? `${base} Note: ${customPhotoReasonNote.trim()}` : base;
		}

		try {
			await deleteStudentProfilePictureByAdmin(photoDeleteStudent.id, finalReason, apiKey);
			setStudents(prev =>
				prev.map(s => (s.id === photoDeleteStudent.id ? { ...s, profilePictureUrl: null } : s))
			);
			setPhotoDeleteSuccessMessage(`Profile picture for ${photoDeleteStudent.fullName} removed and notice sent.`);
			setPhotoDeleteStudent(null);
			setTimeout(() => setPhotoDeleteSuccessMessage(null), 6000);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to remove student photo.';
			setPhotoDeleteModalError(msg);
		} finally {
			setIsDeletingPhoto(false);
		}
	};

	const handleOpenStatusModal = (student: AdminStudentListItem) => {
		setSelectedStudent(student);
		setSelectedReasonId('tuition');
		setCustomReasonNote('');
		setStatusModalError(null);
	};

	const handleConfirmStatusToggle = async () => {
		if (!selectedStudent) return;
		setIsUpdatingStatus(true);
		setStatusModalError(null);

		const willActivate = !selectedStudent.isActive;

		let finalReason: string | undefined = undefined;
		if (!willActivate) {
			const preset = PRESET_DEACTIVATION_REASONS.find(r => r.id === selectedReasonId);
			const base = preset?.id === 'custom' ? '' : (preset?.defaultText || '');
			const note = customReasonNote.trim();

			if (base && note) {
				finalReason = `${base} - Note: ${note}`;
			} else if (note) {
				finalReason = note;
			} else if (base) {
				finalReason = base;
			} else {
				setStatusModalError('Please enter a custom reason or select a preset reason.');
				setIsUpdatingStatus(false);
				return;
			}
		}

		try {
			await toggleStudentStatus(selectedStudent.id, willActivate, finalReason, apiKey);
			await loadStudents();
			setSelectedStudent(null);
		} catch (err: any) {
			setStatusModalError(err.message || 'Failed to update student account status.');
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const handleOpenHistoryModal = async (student: AdminStudentListItem) => {
		setHistoryStudent(student);
		setStudentHistory(null);
		setIsLoadingHistory(true);
		try {
			const data = await getStudentHistory(student.email, apiKey);
			setStudentHistory(data);
		} catch (err) {
			console.error('Failed to load student history:', err);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	const handleOpenGuardianReportModal = async (student: AdminStudentListItem) => {
		setGuardianModalStudent(student);
		const defaultStart = (() => {
			const d = new Date();
			d.setDate(d.getDate() - 30);
			return d.toISOString().split('T')[0];
		})();
		const defaultEnd = new Date().toISOString().split('T')[0];
		setGuardianStartDate(defaultStart);
		setGuardianEndDate(defaultEnd);
		setReportSuccessMessage(null);
		setReportErrorMessage(null);
		setCustomRemarks('');
		setReportPreview(null);
		setIsLoadingPreview(true);

		try {
			const preview = await getGuardianReportPreview(student.email, defaultStart, defaultEnd, apiKey);
			setReportPreview(preview);
			setGuardianName(preview.guardianName || '');
			setGuardianEmail(preview.guardianEmail || '');
			setGuardianPhone(preview.guardianPhone || '');
			if (!preview.guardianEmail && preview.guardianPhone) {
				setReportChannel('Sms');
			} else {
				setReportChannel('Email');
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to fetch report preview.';
			setReportErrorMessage(msg);
		} finally {
			setIsLoadingPreview(false);
		}
	};

	const handleRefreshPreview = async () => {
		if (!guardianModalStudent) return;
		setIsLoadingPreview(true);
		setReportErrorMessage(null);
		try {
			const preview = await getGuardianReportPreview(
				guardianModalStudent.email,
				guardianStartDate,
				guardianEndDate,
				apiKey
			);
			setReportPreview(preview);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to refresh preview.';
			setReportErrorMessage(msg);
		} finally {
			setIsLoadingPreview(false);
		}
	};

	const handleSendGuardianReport = async () => {
		if (!guardianModalStudent) return;
		setIsSendingReport(true);
		setReportErrorMessage(null);
		setReportSuccessMessage(null);

		try {
			const res = await sendGuardianReport(
				{
					studentEmail: guardianModalStudent.email,
					guardianName: guardianName.trim() || undefined,
					guardianEmail: guardianEmail.trim() || undefined,
					guardianPhone: guardianPhone.trim() || undefined,
					startDate: new Date(guardianStartDate).toISOString(),
					endDate: new Date(guardianEndDate + 'T23:59:59Z').toISOString(),
					channel: reportChannel,
					customRemarks: customRemarks.trim() || undefined
				},
				apiKey
			);

			setReportSuccessMessage(res.message || 'Guardian performance report sent successfully.');
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to send guardian report.';
			setReportErrorMessage(msg);
		} finally {
			setIsSendingReport(false);
		}
	};

	// Filters
	const filteredStudents = students.filter(s => {
		const matchSearch =
			s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(s.phoneNumber && s.phoneNumber.includes(searchTerm));

		if (statusFilter === 'active') return matchSearch && s.isActive;
		if (statusFilter === 'suspended') return matchSearch && !s.isActive;
		return matchSearch;
	});

	// Pagination Calculations
	const totalPages = Math.ceil(filteredStudents.length / pageSize);
	const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

	// Metrics
	const totalStudents = students.length;
	const activeCount = students.filter(s => s.isActive).length;
	const suspendedCount = students.filter(s => !s.isActive).length;
	const overallAvg =
		students.length > 0
			? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
			: 0;

	return (
		<div className="space-y-6">
			{/* KPI Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Total Registered
						</CardTitle>
						<GraduationCap className="h-4 w-4 text-orange-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-white">{totalStudents}</div>
						<p className="text-xs text-slate-400 mt-1">Students registered in system</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Active Students
						</CardTitle>
						<UserCheck className="h-4 w-4 text-emerald-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
						<p className="text-xs text-slate-400 mt-1">Full CBT exam access</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Suspended / Inactive
						</CardTitle>
						<UserX className="h-4 w-4 text-red-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-400">{suspendedCount}</div>
						<p className="text-xs text-slate-400 mt-1">Access paused (fee/admin hold)</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Cohort Avg Score
						</CardTitle>
						<FileText className="h-4 w-4 text-cyan-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-white">{overallAvg}%</div>
						<p className="text-xs text-slate-400 mt-1">Across all student tests</p>
					</CardContent>
				</Card>
			</div>

			{/* Filter Controls */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
					<Input
						placeholder="Search by student name, email, or phone..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1);
						}}
						className="pl-9 border-slate-800 bg-slate-900/60 text-white placeholder-slate-500"
					/>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex rounded-md border border-slate-800 p-1 bg-slate-900/60">
						<button
							onClick={() => {
								setStatusFilter('all');
								setPage(1);
							}}
							className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${statusFilter === 'all'
								? 'bg-slate-800 text-white'
								: 'text-slate-400 hover:text-white'
								}`}
						>
							All ({totalStudents})
						</button>
						<button
							onClick={() => {
								setStatusFilter('active');
								setPage(1);
							}}
							className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${statusFilter === 'active'
								? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
								: 'text-slate-400 hover:text-white'
								}`}
						>
							Active ({activeCount})
						</button>
						<button
							onClick={() => {
								setStatusFilter('suspended');
								setPage(1);
							}}
							className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${statusFilter === 'suspended'
								? 'bg-red-950 text-red-300 border border-red-800/50'
								: 'text-slate-400 hover:text-white'
								}`}
						>
							Suspended ({suspendedCount})
						</button>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={loadStudents}
						className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
					>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Alerts */}
			{photoDeleteSuccessMessage && (
				<Alert className="border-emerald-800 bg-emerald-950/50 text-emerald-300">
					<CheckCircle className="h-4 w-4 text-emerald-400" />
					<AlertDescription>{photoDeleteSuccessMessage}</AlertDescription>
				</Alert>
			)}

			{error && (
				<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Students Table */}
			<Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
				<CardContent className="p-0">
					{isLoading ? (
						<div className="py-16 text-center text-slate-400">
							<RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
							<p>Loading student directory...</p>
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="py-16 text-center text-slate-400">
							<p className="text-base font-semibold text-slate-300">No students found.</p>
							<p className="text-xs text-slate-500 mt-1">
								{searchTerm || statusFilter !== 'all'
									? 'Try adjusting your search criteria or filter.'
									: 'Students who register for CBT exams will be listed here.'}
							</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
									<tr>
										<th className="py-3.5 px-4 sm:px-6">Student</th>
										<th className="py-3.5 px-4">Status</th>
										<th className="py-3.5 px-4">Reason (If Suspended)</th>
										<th className="py-3.5 px-4 text-center">Tests Taken</th>
										<th className="py-3.5 px-4 text-center">Avg Score</th>
										<th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-800/60">
									{paginatedStudents.map((s) => (
										<tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
											<td className="py-4 px-4 sm:px-6">
												<div className="flex items-center gap-3">
													<div className="relative shrink-0">
														{s.profilePictureUrl ? (
															<img
																src={s.profilePictureUrl}
																alt={s.fullName}
																className="h-10 w-10 rounded-full object-cover border border-slate-700 bg-slate-800"
															/>
														) : (
															<div className="h-10 w-10 rounded-full bg-slate-800 text-orange-400 font-bold text-xs flex items-center justify-center border border-slate-700/60 uppercase">
																{getInitials(s.fullName)}
															</div>
														)}
													</div>
													<div className="min-w-0">
														<div className="font-semibold text-white truncate">{s.fullName}</div>
														<div className="text-xs text-slate-400 font-mono truncate">{s.email}</div>
														{s.phoneNumber && (
															<div className="text-[11px] text-slate-500 truncate">{s.phoneNumber}</div>
														)}
													</div>
												</div>
											</td>
											<td className="py-4 px-4">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.isActive
														? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
														: 'bg-red-950 text-red-400 border border-red-800'
														}`}
												>
													{s.isActive ? 'Active' : 'Suspended'}
												</span>
											</td>
											<td className="py-4 px-4 max-w-xs text-xs text-slate-300">
												{s.disabledReason ? (
													<span className="text-red-300/90 line-clamp-2" title={s.disabledReason}>
														{s.disabledReason}
													</span>
												) : (
													<span className="text-slate-600">—</span>
												)}
											</td>
											<td className="py-4 px-4 text-center font-mono font-bold text-white">
												{s.totalTestsTaken}
											</td>
											<td className="py-4 px-4 text-center font-mono font-bold text-white">
												{s.totalTestsTaken > 0 ? `${s.averageScore}%` : '—'}
											</td>
											<td className="py-4 px-4 sm:px-6 text-right">
												<div className="flex items-center justify-end gap-2">
													{/* View Test History Button */}
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleOpenHistoryModal(s)}
														className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-8 cursor-pointer flex items-center gap-1"
														title="View student test history"
													>
														<Eye className="h-3.5 w-3.5" />
														History
													</Button>

													{/* Guardian Academic Performance Report Button */}
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleOpenGuardianReportModal(s)}
														className="border-orange-800/60 bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 hover:text-white text-xs h-8 cursor-pointer flex items-center gap-1"
														title="Send Guardian Performance Report"
													>
														<Send className="h-3.5 w-3.5" />
														Report
													</Button>

													{/* Remove Photo Button (Visible if student has a photo) */}
													{s.profilePictureUrl && (
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleOpenDeletePhotoModal(s)}
															className="border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-200 text-xs h-8 cursor-pointer flex items-center gap-1"
															title="Remove student profile picture"
														>
															<Camera className="h-3.5 w-3.5" />
															Photo
														</Button>
													)}

													{/* Deactivate / Activate Button (Only visible to Admin) */}
													{isAdmin && (
														s.isActive ? (
															<Button
																variant="destructive"
																size="sm"
																onClick={() => handleOpenStatusModal(s)}
																className="text-xs h-8 cursor-pointer flex items-center gap-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800"
															>
																<Lock className="h-3.5 w-3.5" />
																Disable
															</Button>
														) : (
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleOpenStatusModal(s)}
																className="text-xs h-8 cursor-pointer flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
															>
																<Unlock className="h-3.5 w-3.5" />
																Enable
															</Button>
														)
													)}
												</div>
											</td>
										</tr>
									))}
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

			{/* MODAL: Toggle Student Status (Deactivate / Activate with Pre-selected Reasons) */}
			{selectedStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col overflow-hidden">
						<CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between shrink-0">
							<div>
								<CardTitle className="text-lg font-bold text-white flex items-center gap-2">
									{selectedStudent.isActive ? (
										<>
											<Lock className="h-5 w-5 text-red-400" />
											Suspend Student Account
										</>
									) : (
										<>
											<Unlock className="h-5 w-5 text-emerald-400" />
											Re-enable Student Account
										</>
									)}
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Candidate: <span className="text-white font-semibold">{selectedStudent.fullName}</span> ({selectedStudent.email})
								</CardDescription>
							</div>
							<button
								onClick={() => setSelectedStudent(null)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close modal"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<CardContent className="space-y-4 pt-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
							{statusModalError && (
								<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{statusModalError}</AlertDescription>
								</Alert>
							)}

							{selectedStudent.isActive ? (
								<div className="space-y-4">
									<div>
										<label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
											Select Reason for Suspension (Pre-selected Options):
										</label>
										<div className="space-y-2">
											{PRESET_DEACTIVATION_REASONS.map((preset) => (
												<label
													key={preset.id}
													className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedReasonId === preset.id
														? 'border-orange-500 bg-orange-950/20 text-white'
														: 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40'
														}`}
												>
													<input
														type="radio"
														name="deactivationReason"
														value={preset.id}
														checked={selectedReasonId === preset.id}
														onChange={() => setSelectedReasonId(preset.id)}
														className="mt-0.5 text-orange-600 focus:ring-orange-500"
													/>
													<div className="text-xs">
														<span className="font-semibold block">{preset.label}</span>
														{preset.defaultText && (
															<span className="text-slate-400 block mt-0.5">{preset.defaultText}</span>
														)}
													</div>
												</label>
											))}
										</div>
									</div>

									<div>
										<label htmlFor="custom-admin-note" className="text-xs font-semibold text-slate-300 block mb-1">
											Custom Message / Additional Note to Student:
										</label>
										<textarea
											id="custom-admin-note"
											rows={3}
											placeholder="e.g. Outstanding balance of ₦35,000 for term 2 tuition. Please remit to Zenith Bank Acct: 1012345678 and report to front desk."
											value={customReasonNote}
											onChange={(e) => setCustomReasonNote(e.target.value)}
											className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
										/>
										<p className="text-[11px] text-slate-500 mt-1">
											This reason will be visibly displayed to the student upon login and when attempting to take exams.
										</p>
									</div>
								</div>
							) : (
								<div className="py-2 text-slate-300 space-y-2">
									<p className="text-sm">
										Are you sure you want to re-enable <strong className="text-white">{selectedStudent.fullName}</strong>'s account?
									</p>
									<p className="text-xs text-slate-400">
										Re-enabling this account will restore full access to all JAMB UTME mock CBT exam sessions and clear previous suspension notices.
									</p>
								</div>
							)}
						</CardContent>

						<div className="border-t border-slate-800 px-6 py-4 flex items-center justify-end gap-3 bg-slate-950/40 shrink-0">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedStudent(null)}
								className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
							>
								Cancel
							</Button>
							<Button
								variant={selectedStudent.isActive ? 'destructive' : 'default'}
								size="sm"
								disabled={isUpdatingStatus}
								onClick={handleConfirmStatusToggle}
								className={`cursor-pointer ${!selectedStudent.isActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
							>
								{isUpdatingStatus ? (
									<>
										<RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
										Updating...
									</>
								) : selectedStudent.isActive ? (
									'Confirm Suspension'
								) : (
									'Reactivate Account'
								)}
							</Button>
						</div>
					</Card>
				</div>
			)}

			{/* MODAL: Student History Inspection */}
			{historyStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<Card className="w-full max-w-2xl border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col overflow-hidden">
						<CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between shrink-0">
							<div>
								<CardTitle className="text-lg font-bold text-white flex items-center gap-2">
									<GraduationCap className="h-5 w-5 text-orange-400" />
									Student Exam Performance History
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Candidate: <strong className="text-white">{historyStudent.fullName}</strong> ({historyStudent.email})
								</CardDescription>
							</div>
							<button
								onClick={() => setHistoryStudent(null)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close modal"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<CardContent className="space-y-4 pt-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
							{isLoadingHistory ? (
								<div className="py-12 text-center text-slate-400">
									<RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
									<p>Loading candidate history...</p>
								</div>
							) : !studentHistory || studentHistory.attempts.length === 0 ? (
								<div className="py-12 text-center text-slate-400">
									<FileText className="h-10 w-10 mx-auto mb-2 text-slate-600" />
									<p className="text-sm font-semibold text-slate-300">No mock tests completed yet.</p>
									<p className="text-xs text-slate-500 mt-1">This student has not submitted any exam sessions.</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* Summary metrics for this student */}
									<div className="grid grid-cols-3 gap-3">
										<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
											<span className="text-[11px] uppercase tracking-wider text-slate-400 block">Tests Taken</span>
											<span className="text-xl font-bold text-white">{studentHistory.totalTestsTaken}</span>
										</div>
										<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
											<span className="text-[11px] uppercase tracking-wider text-slate-400 block">Avg Score</span>
											<span className="text-xl font-bold text-cyan-400">{studentHistory.averagePercentage}%</span>
										</div>
										<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
											<span className="text-[11px] uppercase tracking-wider text-slate-400 block">Highest Score</span>
											<span className="text-xl font-bold text-emerald-400">{studentHistory.highestPercentage}%</span>
										</div>
									</div>

									{/* List of attempts */}
									<div className="space-y-2">
										<h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
											Completed Exam Sessions
										</h4>
										<div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800">
											{studentHistory.attempts.map((att, idx) => (
												<div key={att.sessionId} className="p-3 bg-slate-950/40 flex items-center justify-between text-xs">
													<div>
														<span className="font-semibold text-white block">
															#{idx + 1}. {att.targetYear} JAMB UTME Simulation
														</span>
														<span className="text-slate-400 text-[11px]">
															Completed on {new Date(att.completedAt).toLocaleString()}
														</span>
													</div>
													<div className="text-right">
														<span className="font-mono font-bold text-white block">
															{att.totalScore} / {att.totalQuestions} ({att.percentage}%)
														</span>
														<span
															className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${att.percentage >= 50
																? 'bg-emerald-950 text-emerald-300'
																: 'bg-red-950 text-red-300'
																}`}
														>
															{att.percentage >= 50 ? 'PASS' : 'FAIL'}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</CardContent>

						<div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 bg-slate-950/40">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const student = historyStudent;
									setHistoryStudent(null);
									handleOpenGuardianReportModal(student);
								}}
								className="border-orange-800/60 bg-orange-950/30 text-orange-300 hover:bg-orange-900/50 hover:text-white text-xs h-8 cursor-pointer flex items-center gap-1.5"
							>
								<Send className="h-3.5 w-3.5" />
								Send Guardian Report
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setHistoryStudent(null)}
								className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
							>
								Close
							</Button>
						</div>
					</Card>
				</div>
			)}

			{/* MODAL: Send Guardian Academic & Attendance Report */}
			{guardianModalStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
					<Card className="w-full max-w-2xl border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col overflow-hidden">
						<CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between shrink-0">
							<div>
								<CardTitle className="text-lg font-bold text-white flex items-center gap-2">
									<Mail className="h-5 w-5 text-orange-400" />
									Guardian Academic Report Dispatch
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Student: <strong className="text-white">{guardianModalStudent.fullName}</strong> ({guardianModalStudent.email})
								</CardDescription>
							</div>
							<button
								onClick={() => setGuardianModalStudent(null)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close modal"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<CardContent className="space-y-4 pt-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
							{reportErrorMessage && (
								<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{reportErrorMessage}</AlertDescription>
								</Alert>
							)}

							{reportSuccessMessage ? (
								<div className="py-8 text-center space-y-3">
									<div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
										<CheckCircle className="h-6 w-6" />
									</div>
									<h3 className="text-base font-bold text-white">Report Dispatched Successfully</h3>
									<p className="text-xs text-slate-300 max-w-md mx-auto">{reportSuccessMessage}</p>
									<p className="text-[11px] text-slate-500">
										The student&apos;s guardian has been notified with the official Trailblazers academic report card.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* Timeframe Selection */}
									<div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
										<label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
											<Calendar className="h-3.5 w-3.5 text-orange-400" />
											Report Timeframe
										</label>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											<div>
												<span className="text-[11px] text-slate-400 block mb-1">Start Date</span>
												<Input
													type="date"
													value={guardianStartDate}
													onChange={(e) => setGuardianStartDate(e.target.value)}
													className="border-slate-800 bg-slate-900 text-white text-xs h-8"
												/>
											</div>
											<div>
												<span className="text-[11px] text-slate-400 block mb-1">End Date</span>
												<Input
													type="date"
													value={guardianEndDate}
													onChange={(e) => setGuardianEndDate(e.target.value)}
													className="border-slate-800 bg-slate-900 text-white text-xs h-8"
												/>
											</div>
										</div>
										<div className="flex justify-end pt-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={handleRefreshPreview}
												disabled={isLoadingPreview}
												className="text-xs h-7 text-orange-400 hover:text-orange-300 hover:bg-orange-950/30 cursor-pointer flex items-center gap-1"
											>
												{isLoadingPreview ? (
													<Loader2 className="h-3 w-3 animate-spin" />
												) : (
													<RefreshCw className="h-3 w-3" />
												)}
												Update Metrics Preview
											</Button>
										</div>
									</div>

									{/* Live Performance Preview */}
									<div className="space-y-2">
										<label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
											Timeframe Performance Summary
										</label>
										{isLoadingPreview ? (
											<div className="py-6 text-center text-slate-400 bg-slate-950/40 rounded-lg border border-slate-800">
												<Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-orange-500" />
												<p className="text-xs">Aggregating test results and attendance records...</p>
											</div>
										) : reportPreview ? (
											<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
												<div className="bg-slate-950 p-2.5 rounded border border-slate-800">
													<span className="text-[10px] uppercase text-slate-400 block">Tests</span>
													<span className="text-lg font-bold text-white">{reportPreview.totalTestsTaken}</span>
												</div>
												<div className="bg-slate-950 p-2.5 rounded border border-slate-800">
													<span className="text-[10px] uppercase text-slate-400 block">Avg Score</span>
													<span className="text-lg font-bold text-cyan-400">{reportPreview.averagePercentage}%</span>
												</div>
												<div className="bg-slate-950 p-2.5 rounded border border-slate-800">
													<span className="text-[10px] uppercase text-slate-400 block">Peak Score</span>
													<span className="text-lg font-bold text-emerald-400">{reportPreview.highestPercentage}%</span>
												</div>
												<div className="bg-slate-950 p-2.5 rounded border border-slate-800">
													<span className="text-[10px] uppercase text-slate-400 block">Pass Rate</span>
													<span className="text-lg font-bold text-purple-400">{reportPreview.passRatePercentage}%</span>
												</div>
												<div className="bg-slate-950 p-2.5 rounded border border-slate-800 col-span-2 sm:col-span-1">
													<span className="text-[10px] uppercase text-slate-400 block">Attendance</span>
													<span className="text-xs font-bold text-amber-300 block mt-1">
														{reportPreview.attendancePresentDays}d present / {reportPreview.attendanceLateDays}d late
													</span>
												</div>
											</div>
										) : (
											<div className="p-3 text-center text-xs text-slate-500 bg-slate-950/30 rounded border border-slate-800">
												No preview available yet.
											</div>
										)}
									</div>

									{/* Guardian Contact Information */}
									<div className="space-y-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
										<label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
											Guardian Recipient Details
										</label>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<div>
												<span className="text-[11px] text-slate-400 block mb-1">Guardian Name</span>
												<Input
													placeholder="e.g. Mr. John Doe"
													value={guardianName}
													onChange={(e) => setGuardianName(e.target.value)}
													className="border-slate-800 bg-slate-900 text-white text-xs h-8"
												/>
											</div>
											<div>
												<span className="text-[11px] text-slate-400 block mb-1">Guardian Email</span>
												<Input
													type="email"
													placeholder="guardian@example.com"
													value={guardianEmail}
													onChange={(e) => setGuardianEmail(e.target.value)}
													className="border-slate-800 bg-slate-900 text-white text-xs h-8"
												/>
											</div>
											<div>
												<span className="text-[11px] text-slate-400 block mb-1">Guardian Phone (SMS)</span>
												<Input
													type="tel"
													placeholder="08012345678"
													value={guardianPhone}
													onChange={(e) => setGuardianPhone(e.target.value)}
													className="border-slate-800 bg-slate-900 text-white text-xs h-8"
												/>
											</div>
										</div>

										{/* Delivery Channel Selector */}
										<div>
											<span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">Delivery Channel</span>
											<div className="flex flex-wrap gap-2">
												<button
													type="button"
													onClick={() => setReportChannel('Email')}
													className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors flex items-center gap-1.5 ${
														reportChannel === 'Email'
															? 'border-orange-500 bg-orange-950/40 text-orange-300'
															: 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
													}`}
												>
													<Mail className="h-3.5 w-3.5" />
													Email Only (Branded HTML)
												</button>
												<button
													type="button"
													onClick={() => setReportChannel('Sms')}
													className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors flex items-center gap-1.5 ${
														reportChannel === 'Sms'
															? 'border-orange-500 bg-orange-950/40 text-orange-300'
															: 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
													}`}
												>
													<MessageSquare className="h-3.5 w-3.5" />
													SMS Only (Summary Text)
												</button>
												<button
													type="button"
													onClick={() => setReportChannel('Both')}
													className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors flex items-center gap-1.5 ${
														reportChannel === 'Both'
															? 'border-orange-500 bg-orange-950/40 text-orange-300'
															: 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
													}`}
												>
													<Send className="h-3.5 w-3.5" />
													Both (Email &amp; SMS)
												</button>
											</div>
										</div>
									</div>

									{/* Instructor Custom Remarks */}
									<div>
										<label htmlFor="instructor-remarks" className="text-xs font-semibold text-slate-300 block mb-1">
											Instructor Commendations &amp; Remarks (Optional):
										</label>
										<textarea
											id="instructor-remarks"
											rows={2}
											placeholder="e.g. Excellent focus and steady improvement in mathematics this month. Needs to dedicate more review time to English comprehension."
											value={customRemarks}
											onChange={(e) => setCustomRemarks(e.target.value)}
											className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
										/>
									</div>
								</div>
							)}
						</CardContent>

						<div className="border-t border-slate-800 px-6 py-3 flex items-center justify-end gap-3 shrink-0 bg-slate-950/40">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setGuardianModalStudent(null)}
								className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer text-xs"
							>
								{reportSuccessMessage ? 'Done' : 'Cancel'}
							</Button>
							{!reportSuccessMessage && (
								<Button
									size="sm"
									disabled={
										isSendingReport ||
										isLoadingPreview ||
										(!guardianEmail.trim() && !guardianPhone.trim())
									}
									onClick={handleSendGuardianReport}
									className="bg-orange-600 hover:bg-orange-700 text-white text-xs cursor-pointer flex items-center gap-1.5"
								>
									{isSendingReport ? (
										<>
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
											Dispatching...
										</>
									) : (
										<>
											<Send className="h-3.5 w-3.5" />
											Send Report to Guardian
										</>
									)}
								</Button>
							)}
						</div>
					</Card>
				</div>
			)}

			{/* MODAL: Remove Student Profile Picture with Reason */}
			{photoDeleteStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
					<Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col overflow-hidden">
						<CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between shrink-0">
							<div>
								<CardTitle className="text-lg font-bold text-white flex items-center gap-2">
									<Camera className="h-5 w-5 text-red-400" />
									Remove Student Profile Picture
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Candidate: <span className="text-white font-semibold">{photoDeleteStudent.fullName}</span> ({photoDeleteStudent.email})
								</CardDescription>
							</div>
							<button
								onClick={() => setPhotoDeleteStudent(null)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close modal"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<CardContent className="space-y-4 pt-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
							{photoDeleteModalError && (
								<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{photoDeleteModalError}</AlertDescription>
								</Alert>
							)}

							<div className="flex items-center gap-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
								{photoDeleteStudent.profilePictureUrl && (
									<img
										src={photoDeleteStudent.profilePictureUrl}
										alt={photoDeleteStudent.fullName}
										className="h-16 w-16 rounded-full object-cover border border-slate-700 shrink-0"
									/>
								)}
								<div className="text-xs text-slate-300 space-y-1">
									<p className="font-medium text-white">This administrative action will:</p>
									<ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
										<li>Permanently delete the photo from cloud storage.</li>
										<li>Reset the student&apos;s avatar to their initials.</li>
										<li>Send a notification and email explaining the reason.</li>
									</ul>
								</div>
							</div>

							<div>
								<label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
									Select Reason for Removal:
								</label>
								<div className="space-y-2">
									{PRESET_PHOTO_REMOVAL_REASONS.map((preset) => (
										<label
											key={preset.id}
											className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPhotoReasonId === preset.id
												? 'border-red-500 bg-red-950/20 text-white'
												: 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40'
												}`}
										>
											<input
												type="radio"
												name="photoRemovalReason"
												value={preset.id}
												checked={selectedPhotoReasonId === preset.id}
												onChange={() => setSelectedPhotoReasonId(preset.id)}
												className="mt-0.5 text-red-600 focus:ring-red-500"
											/>
											<div className="text-xs">
												<span className="font-semibold block">{preset.label}</span>
												{preset.defaultText && (
													<span className="text-slate-400 block mt-0.5">{preset.defaultText}</span>
												)}
											</div>
										</label>
									))}
								</div>
							</div>

							<div>
								<label htmlFor="custom-photo-admin-note" className="text-xs font-semibold text-slate-300 block mb-1">
									Additional Note or Custom Explanation:
								</label>
								<textarea
									id="custom-photo-admin-note"
									rows={3}
									placeholder="e.g. Please provide a clear passport photograph facing the camera on a plain background."
									value={customPhotoReasonNote}
									onChange={(e) => setCustomPhotoReasonNote(e.target.value)}
									className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
								/>
							</div>
						</CardContent>

						<div className="border-t border-slate-800 px-6 py-4 flex items-center justify-end gap-3 bg-slate-950/40 shrink-0">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPhotoDeleteStudent(null)}
								className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								size="sm"
								disabled={isDeletingPhoto}
								onClick={handleConfirmDeleteStudentPhoto}
								className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
							>
								{isDeletingPhoto ? (
									<>
										<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
										Removing...
									</>
								) : (
									'Remove Photo & Notify Student'
								)}
							</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}
