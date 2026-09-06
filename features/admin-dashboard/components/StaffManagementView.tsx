'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
	Users,
	ShieldCheck,
	UserPlus,
	Mail,
	CheckCircle2,
	Clock,
	RefreshCw,
	AlertCircle,
	Search,
	GraduationCap,
	Shield,
	Send,
	UserCheck,
	UserX,
	Lock,
	ChevronDown
} from 'lucide-react';
import {
	StaffMemberDto,
	StaffRole,
	getStaffRoster,
	inviteStaffMember,
	resendStaffInvitation,
	updateStaffRole,
	toggleStaffStatus
} from '@/core/services/staffService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataPagination } from '@/components/ui/DataPagination';

interface StaffManagementViewProps {
	apiKey: string;
}

export function StaffManagementView({ apiKey }: StaffManagementViewProps) {
	const [staff, setStaff] = useState<StaffMemberDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Filters & Pagination
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'Instructor'>('all');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Invite Modal State
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [inviteName, setInviteName] = useState('');
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteRole, setInviteRole] = useState<StaffRole>('Instructor');
	const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
	const [inviteError, setInviteError] = useState<string | null>(null);

	// Role Change State
	const [roleChangeTarget, setRoleChangeTarget] = useState<{ staff: StaffMemberDto; newRole: StaffRole } | null>(null);
	const [isChangingRole, setIsChangingRole] = useState(false);

	// Status Toggle State
	const [statusTarget, setStatusTarget] = useState<StaffMemberDto | null>(null);
	const [isTogglingStatus, setIsTogglingStatus] = useState(false);

	const loadStaff = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await getStaffRoster(apiKey);
			setStaff(data);
		} catch (err: any) {
			setError(err.message || 'Failed to load staff roster.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadStaff();
	}, [apiKey]);

	// Auto-dismiss notification after 5 seconds
	useEffect(() => {
		if (successMessage) {
			const t = setTimeout(() => setSuccessMessage(null), 5000);
			return () => clearTimeout(t);
		}
	}, [successMessage]);

	// Handle Invite Submission
	const handleSendInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim() || !inviteName.trim()) return;

		setIsSubmittingInvite(true);
		setInviteError(null);

		try {
			await inviteStaffMember(
				{
					fullName: inviteName.trim(),
					email: inviteEmail.trim(),
					role: inviteRole
				},
				apiKey
			);

			setSuccessMessage(`Invitation email sent to ${inviteEmail.trim()} (${inviteRole}).`);
			setIsInviteOpen(false);
			setInviteName('');
			setInviteEmail('');
			setInviteRole('Instructor');
			await loadStaff();
		} catch (err: any) {
			setInviteError(err.message || 'Failed to dispatch staff invitation.');
		} finally {
			setIsSubmittingInvite(false);
		}
	};

	// Handle Resending Invite
	const handleResendInvite = async (invitationId: string, email: string) => {
		try {
			await resendStaffInvitation(invitationId, apiKey);
			setSuccessMessage(`Fresh invitation email resent to ${email}.`);
			await loadStaff();
		} catch (err: any) {
			alert(err.message || 'Failed to resend invitation.');
		}
	};

	// Handle Role Update Confirmation
	const handleConfirmRoleChange = async () => {
		if (!roleChangeTarget) return;

		setIsChangingRole(true);
		try {
			await updateStaffRole(roleChangeTarget.staff.id, roleChangeTarget.newRole, apiKey);
			setSuccessMessage(`${roleChangeTarget.staff.fullName}'s role updated to ${roleChangeTarget.newRole}.`);
			setRoleChangeTarget(null);
			await loadStaff();
		} catch (err: any) {
			alert(err.message || 'Failed to update role.');
		} finally {
			setIsChangingRole(false);
		}
	};

	// Handle Account Status Toggle (Suspend / Reactivate)
	const handleConfirmStatusToggle = async () => {
		if (!statusTarget) return;

		setIsTogglingStatus(true);
		try {
			const newStatus = !statusTarget.isActive;
			await toggleStaffStatus(statusTarget.id, newStatus, undefined, apiKey);
			setSuccessMessage(`${statusTarget.fullName}'s account is now ${newStatus ? 'Active' : 'Suspended'}.`);
			setStatusTarget(null);
			await loadStaff();
		} catch (err: any) {
			alert(err.message || 'Failed to update account status.');
		} finally {
			setIsTogglingStatus(false);
		}
	};

	// Filtered Staff
	const filteredStaff = staff.filter((s) => {
		const matchSearch =
			s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchRole = roleFilter === 'all' || s.role === roleFilter;
		return matchSearch && matchRole;
	});

	// Pagination Math
	const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
	const paginatedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);

	// KPI Stats
	const totalCount = staff.length;
	const activeInstructors = staff.filter((s) => s.role === 'Instructor' && s.status === 'Active').length;
	const activeAdmins = staff.filter((s) => s.role === 'Admin' && s.status === 'Active').length;
	const pendingInvites = staff.filter((s) => s.status === 'PendingInvite').length;

	return (
		<div className="space-y-6">
			{/* Top Header & Invite Button */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-bold text-white flex items-center gap-2">
						<Users className="h-5 w-5 text-orange-400" />
						Staff & Instructor Directory
					</h2>
					<p className="text-xs text-slate-400 mt-0.5">
						Invite educators, manage faculty permissions, and oversee administrator roles.
					</p>
				</div>

				<div className="flex items-center gap-2.5">
					<Button
						variant="outline"
						size="sm"
						onClick={loadStaff}
						disabled={isLoading}
						className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-8 px-2.5 cursor-pointer flex items-center gap-1"
					>
						<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
						Refresh
					</Button>

					<Button
						size="sm"
						onClick={() => {
							setInviteError(null);
							setIsInviteOpen(true);
						}}
						className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8 px-3 cursor-pointer flex items-center gap-1.5 shadow-sm font-semibold"
					>
						<UserPlus className="h-3.5 w-3.5" />
						Invite Staff Member
					</Button>
				</div>
			</div>

			{/* Success Notification Banner */}
			{successMessage && (
				<Alert className="border-emerald-800/60 bg-emerald-950/40 text-emerald-300 py-3">
					<CheckCircle2 className="h-4 w-4 text-emerald-400" />
					<AlertDescription className="text-xs font-medium">{successMessage}</AlertDescription>
				</Alert>
			)}

			{/* Error Banner */}
			{error && (
				<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-xs">{error}</AlertDescription>
				</Alert>
			)}

			{/* KPI Summary Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="pb-1.5 pt-4 px-4">
						<CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
							Total Staff
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<div className="text-2xl font-black text-white">{totalCount}</div>
						<p className="text-[11px] text-slate-500 mt-0.5">Faculty members & accounts</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="pb-1.5 pt-4 px-4">
						<CardTitle className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
							Instructors
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<div className="text-2xl font-black text-white">{activeInstructors}</div>
						<p className="text-[11px] text-slate-500 mt-0.5">Active teaching faculty</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="pb-1.5 pt-4 px-4">
						<CardTitle className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
							Administrators
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<div className="text-2xl font-black text-white">{activeAdmins}</div>
						<p className="text-[11px] text-slate-500 mt-0.5">Full academy access</p>
					</CardContent>
				</Card>

				<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
					<CardHeader className="pb-1.5 pt-4 px-4">
						<CardTitle className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
							Pending Invites
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<div className="text-2xl font-black text-white">{pendingInvites}</div>
						<p className="text-[11px] text-slate-500 mt-0.5">Awaiting password setup</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
					<Input
						placeholder="Search staff by name or email..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1);
						}}
						className="pl-9 border-slate-800 bg-slate-900/60 text-white placeholder-slate-500 text-xs h-9"
					/>
				</div>

				<div className="flex items-center gap-1.5 rounded-md border border-slate-800 p-1 bg-slate-900/60 text-xs">
					<button
						onClick={() => {
							setRoleFilter('all');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							roleFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
						}`}
					>
						All Roles ({totalCount})
					</button>
					<button
						onClick={() => {
							setRoleFilter('Instructor');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							roleFilter === 'Instructor'
								? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						Instructors
					</button>
					<button
						onClick={() => {
							setRoleFilter('Admin');
							setPage(1);
						}}
						className={`px-3 py-1 font-semibold rounded cursor-pointer transition-colors ${
							roleFilter === 'Admin'
								? 'bg-amber-950 text-amber-300 border border-amber-800/50'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						Admins
					</button>
				</div>
			</div>

			{/* Staff Table */}
			<Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
				<CardContent className="p-0">
					{isLoading ? (
						<div className="py-16 text-center text-slate-400">
							<RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
							<p className="text-sm">Loading staff directory...</p>
						</div>
					) : filteredStaff.length === 0 ? (
						<div className="py-16 text-center text-slate-400">
							<p className="text-base font-semibold text-slate-300">No staff members match this search.</p>
							<p className="text-xs text-slate-500 mt-1">Try adjusting your keywords or role filter.</p>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
										<tr>
											<th className="py-3.5 px-4 sm:px-6">Staff Member</th>
											<th className="py-3.5 px-4">Role</th>
											<th className="py-3.5 px-4">Account Status</th>
											<th className="py-3.5 px-4">Role Action</th>
											<th className="py-3.5 px-4 sm:px-6 text-right">Access Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-800/60">
										{paginatedStaff.map((s) => {
											const isAdmin = s.role === 'Admin';
											const isPending = s.status === 'PendingInvite';
											const isExpired = s.status === 'ExpiredInvite';
											const isSuspended = s.status === 'Suspended';

											return (
												<tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
													{/* Staff Details */}
													<td className="py-3.5 px-4 sm:px-6">
														<div className="flex items-center gap-3">
															<div
																className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
																	isAdmin
																		? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
																		: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
																}`}
															>
																{s.fullName.charAt(0) || 'S'}
															</div>
															<div>
																<div className="font-semibold text-white">{s.fullName}</div>
																<div className="text-xs text-slate-400 font-mono">{s.email}</div>
															</div>
														</div>
													</td>

													{/* Role Badge */}
													<td className="py-3.5 px-4">
														<span
															className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
																isAdmin
																	? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
																	: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
															}`}
														>
															{isAdmin ? <Shield className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
															{s.role}
														</span>
													</td>

													{/* Status Badge */}
													<td className="py-3.5 px-4">
														{isPending ? (
															<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-950/40 text-orange-300 border border-orange-800/40">
																<Clock className="h-3 w-3" />
																Invite Pending
															</span>
														) : isExpired ? (
															<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-950/40 text-red-300 border border-red-800/40">
																<AlertCircle className="h-3 w-3" />
																Invite Expired
															</span>
														) : isSuspended ? (
															<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-950 text-red-300 border border-red-800">
																<Lock className="h-3 w-3" />
																Suspended
															</span>
														) : (
															<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
																<CheckCircle2 className="h-3 w-3" />
																Active
															</span>
														)}
													</td>

													{/* Role Change Action */}
													<td className="py-3.5 px-4">
														{isAdmin ? (
															<Button
																variant="outline"
																size="sm"
																onClick={() => setRoleChangeTarget({ staff: s, newRole: 'Instructor' })}
																className="text-xs h-7 px-2.5 border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-800/50 cursor-pointer"
															>
																Change to Instructor
															</Button>
														) : (
															<Button
																variant="outline"
																size="sm"
																onClick={() => setRoleChangeTarget({ staff: s, newRole: 'Admin' })}
																className="text-xs h-7 px-2.5 border-slate-800 bg-slate-900 text-slate-300 hover:text-amber-300 hover:border-amber-800/50 cursor-pointer"
															>
																Make Administrator
															</Button>
														)}
													</td>

													{/* Access / Resend Actions */}
													<td className="py-3.5 px-4 sm:px-6 text-right">
														<div className="flex items-center justify-end gap-1.5">
															{(isPending || isExpired) && s.invitationId && (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleResendInvite(s.invitationId!, s.email)}
																	className="text-xs h-7 px-2.5 border-orange-800/60 bg-orange-950/30 text-orange-300 hover:bg-orange-900/50 cursor-pointer flex items-center gap-1"
																>
																	<Send className="h-3 w-3" />
																	Resend Invite
																</Button>
															)}

															{!isPending && !isExpired && (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => setStatusTarget(s)}
																	className={`text-xs h-7 px-2.5 cursor-pointer flex items-center gap-1 ${
																		isSuspended
																			? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50'
																			: 'border-red-900/60 bg-red-950/20 text-red-400 hover:bg-red-950/50'
																	}`}
																>
																	{isSuspended ? (
																		<>
																			<UserCheck className="h-3 w-3" />
																			Reactivate
																		</>
																	) : (
																		<>
																			<UserX className="h-3 w-3" />
																			Suspend
																		</>
																	)}
																</Button>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							{filteredStaff.length > 0 && (
								<div className="p-4 pt-0">
									<DataPagination
										currentPage={page}
										totalPages={totalPages}
										totalCount={filteredStaff.length}
										pageSize={pageSize}
										pageSizeOptions={[10, 20, 50, 100]}
										itemName="staff members"
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

			{/* Invite Staff Member Modal */}
			<Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
				<DialogContent className="border-slate-800 bg-slate-950 text-slate-100 max-w-md">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
							<UserPlus className="h-5 w-5 text-orange-500" />
							Invite Staff Member
						</DialogTitle>
						<DialogDescription className="text-slate-400 text-xs mt-1">
							Send a branded invitation email with a secure link to set up their password and activate their staff account.
						</DialogDescription>
					</DialogHeader>

					{inviteError && (
						<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300 text-xs py-2.5">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{inviteError}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSendInvite} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-300">Full Name</label>
							<Input
								placeholder="e.g. Dr. Ngozi Adeleke"
								value={inviteName}
								onChange={(e) => setInviteName(e.target.value)}
								className="border-slate-800 bg-slate-900 text-white text-xs h-9"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-300">Staff Email Address</label>
							<Input
								type="email"
								placeholder="e.g. ngozi@trailblazer.edu"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								className="border-slate-800 bg-slate-900 text-white text-xs h-9"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-semibold text-slate-300">Assign Role</label>
							<div className="grid grid-cols-2 gap-2.5">
								<button
									type="button"
									onClick={() => setInviteRole('Instructor')}
									className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
										inviteRole === 'Instructor'
											? 'border-cyan-500/80 bg-cyan-950/30 text-cyan-200'
											: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
									}`}
								>
									<div className="font-bold text-xs flex items-center gap-1.5 text-white">
										<GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
										Instructor
									</div>
									<p className="text-[10px] text-slate-400 mt-1 leading-tight">
										Question bank management, student status inspection, and attendance verification.
									</p>
								</button>

								<button
									type="button"
									onClick={() => setInviteRole('Admin')}
									className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
										inviteRole === 'Admin'
											? 'border-amber-500/80 bg-amber-950/30 text-amber-200'
											: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
									}`}
								>
									<div className="font-bold text-xs flex items-center gap-1.5 text-white">
										<Shield className="h-3.5 w-3.5 text-amber-400" />
										Administrator
									</div>
									<p className="text-[10px] text-slate-400 mt-1 leading-tight">
										Full administrative authority, campus geofence settings, and staff role governance.
									</p>
								</button>
							</div>
						</div>

						<div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setIsInviteOpen(false)}
								className="border-slate-800 text-slate-300 text-xs cursor-pointer"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								size="sm"
								disabled={isSubmittingInvite}
								className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
							>
								{isSubmittingInvite ? (
									<>
										<RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
										Sending Invitation...
									</>
								) : (
									<>
										<Send className="mr-1.5 h-3.5 w-3.5" />
										Send Invitation Email
									</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Role Change Confirmation Modal */}
			<Dialog open={!!roleChangeTarget} onOpenChange={(open) => !open && !isChangingRole && setRoleChangeTarget(null)}>
				<DialogContent className="border-slate-800 bg-slate-950 text-slate-100 max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base font-bold text-white flex items-center gap-2">
							<ShieldCheck className="h-5 w-5 text-orange-500" />
							Confirm Role Modification
						</DialogTitle>
						<DialogDescription className="text-slate-400 text-xs mt-1">
							Are you sure you want to change the role of{' '}
							<span className="text-white font-semibold">{roleChangeTarget?.staff.fullName}</span> (
							<span className="font-mono text-slate-300">{roleChangeTarget?.staff.email}</span>) from{' '}
							<span className="text-slate-200 font-semibold">{roleChangeTarget?.staff.role}</span> to{' '}
							<span className="text-orange-400 font-bold">{roleChangeTarget?.newRole}</span>?
						</DialogDescription>
					</DialogHeader>

					<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
						<Button
							variant="outline"
							size="sm"
							disabled={isChangingRole}
							onClick={() => setRoleChangeTarget(null)}
							className="border-slate-800 text-slate-300 text-xs"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							disabled={isChangingRole}
							onClick={handleConfirmRoleChange}
							className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
						>
							{isChangingRole ? 'Updating...' : `Confirm: Make ${roleChangeTarget?.newRole}`}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Account Status Toggle Modal */}
			<Dialog open={!!statusTarget} onOpenChange={(open) => !open && !isTogglingStatus && setStatusTarget(null)}>
				<DialogContent className="border-slate-800 bg-slate-950 text-slate-100 max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base font-bold text-white">
							{statusTarget?.isActive ? 'Suspend Staff Access' : 'Reactivate Staff Access'}
						</DialogTitle>
						<DialogDescription className="text-slate-400 text-xs mt-1">
							{statusTarget?.isActive
								? `This will temporarily revoke staff portal access for ${statusTarget.fullName}. They will not be able to log in until reactivated.`
								: `This will restore full portal privileges for ${statusTarget?.fullName}.`}
						</DialogDescription>
					</DialogHeader>

					<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
						<Button
							variant="outline"
							size="sm"
							disabled={isTogglingStatus}
							onClick={() => setStatusTarget(null)}
							className="border-slate-800 text-slate-300 text-xs"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							disabled={isTogglingStatus}
							onClick={handleConfirmStatusToggle}
							className={
								statusTarget?.isActive
									? 'bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer'
									: 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer'
							}
						>
							{isTogglingStatus
								? 'Processing...'
								: statusTarget?.isActive
								? 'Confirm Suspension'
								: 'Confirm Reactivation'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
