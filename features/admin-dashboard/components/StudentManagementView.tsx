'use client';

import React, { useState, useEffect } from 'react';
import {
	getAllStudents,
	toggleStudentStatus,
	getStudentHistory,
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
	ShieldAlert
} from 'lucide-react';

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

	useEffect(() => {
		loadStudents();
	}, [apiKey]);

	const loadStudents = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const list = await getAllStudents(apiKey);
			setStudents(list);
		} catch (err: any) {
			setError(err.message || 'Failed to load students.');
		} finally {
			setIsLoading(false);
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
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 border-slate-800 bg-slate-900/60 text-white placeholder-slate-500"
					/>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex rounded-md border border-slate-800 p-1 bg-slate-900/60">
						<button
							onClick={() => setStatusFilter('all')}
							className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${statusFilter === 'all'
								? 'bg-slate-800 text-white'
								: 'text-slate-400 hover:text-white'
								}`}
						>
							All ({totalStudents})
						</button>
						<button
							onClick={() => setStatusFilter('active')}
							className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${statusFilter === 'active'
								? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
								: 'text-slate-400 hover:text-white'
								}`}
						>
							Active ({activeCount})
						</button>
						<button
							onClick={() => setStatusFilter('suspended')}
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

			{/* Error Alert */}
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
									{filteredStudents.map((s) => (
										<tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
											<td className="py-4 px-4 sm:px-6">
												<div className="font-semibold text-white">{s.fullName}</div>
												<div className="text-xs text-slate-400 font-mono">{s.email}</div>
												{s.phoneNumber && (
													<div className="text-[11px] text-slate-500">{s.phoneNumber}</div>
												)}
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
					)}
				</CardContent>
			</Card>

			{/* MODAL: Toggle Student Status (Deactivate / Activate with Pre-selected Reasons) */}
			{selectedStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
						<CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between">
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

						<CardContent className="space-y-4 pt-4">
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

						<div className="border-t border-slate-800 px-6 py-4 flex items-center justify-end gap-3 bg-slate-950/40">
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
					<Card className="w-full max-w-2xl border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
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

						<CardContent className="space-y-4 pt-4 overflow-y-auto flex-1">
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

						<div className="border-t border-slate-800 px-6 py-3 flex justify-end shrink-0 bg-slate-950/40">
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
		</div>
	);
}
