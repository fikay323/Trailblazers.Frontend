import * as React from 'react';
import { useState, useEffect } from 'react';
import { getSubmissions, deleteSubmission, createStudentAccount } from '@/core/services/submissionsService';
import {
	ChevronLeft,
	ChevronRight,
	MessageSquare,
	Mail,
	Clock,
	User,
	Phone,
	BookOpen,
	Trash2,
	AlertTriangle,
	UserCheck,
	Loader2,
	Copy,
	Check,
	ShieldCheck,
	HeartHandshake
} from 'lucide-react';
import { FilterBar } from '@/components/ui/FilterBar';
import { RegistrationTable, RegistrationSubmissionDTO } from './RegistrationTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataPagination } from '@/components/ui/DataPagination';

interface RegistrationSubmissionsViewProps {
	apiKey: string;
}

export function RegistrationSubmissionsView({ apiKey }: RegistrationSubmissionsViewProps) {
	// Filters State
	const [searchTerm, setSearchTerm] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	// Pagination State
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Data States
	const [items, setItems] = useState<RegistrationSubmissionDTO[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Modal State
	const [selectedItem, setSelectedItem] = useState<RegistrationSubmissionDTO | null>(null);
	const [itemToDelete, setItemToDelete] = useState<RegistrationSubmissionDTO | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Account Provisioning State
	const [isCreatingAccount, setIsCreatingAccount] = useState(false);
	const [createAccountResult, setCreateAccountResult] = useState<{
		message: string;
		inviteUrl?: string;
		emailSent?: boolean;
		emailStatusMessage?: string;
	} | null>(null);
	const [createAccountError, setCreateAccountError] = useState<string | null>(null);
	const [copiedLink, setCopiedLink] = useState(false);

	const handleCreateAccount = async () => {
		if (!selectedItem) return;
		setIsCreatingAccount(true);
		setCreateAccountError(null);
		setCreateAccountResult(null);

		try {
			const res = await createStudentAccount(selectedItem.id, apiKey);
			setCreateAccountResult({
				message: res.message,
				inviteUrl: res.invitation?.inviteUrl,
				emailSent: res.invitation?.emailSent,
				emailStatusMessage: res.invitation?.emailStatusMessage
			});

			const currentMeta = (() => {
				try {
					return JSON.parse(selectedItem.metadata);
				} catch {
					return {};
				}
			})();
			currentMeta.AccountCreated = true;
			currentMeta.AccountCreatedAt = new Date().toISOString();
			currentMeta.AccountInviteUrl = res.invitation?.inviteUrl;
			currentMeta.AccountEmailSent = res.invitation?.emailSent;

			const updated = {
				...selectedItem,
				metadata: JSON.stringify(currentMeta)
			};
			setSelectedItem(updated);
			fetchRegistrations();
		} catch (err: any) {
			setCreateAccountError(err.message || 'Failed to create student account.');
		} finally {
			setIsCreatingAccount(false);
		}
	};

	const handleCopyLink = (url: string) => {
		if (!url) return;
		navigator.clipboard.writeText(url);
		setCopiedLink(true);
		setTimeout(() => setCopiedLink(false), 2000);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		setIsDeleting(true);
		try {
			await deleteSubmission(itemToDelete.id, apiKey);
			if (selectedItem?.id === itemToDelete.id) {
				setSelectedItem(null);
			}
			setItemToDelete(null);
			await fetchRegistrations();
		} catch (err: any) {
			alert(err.message || 'Failed to delete registration.');
		} finally {
			setIsDeleting(false);
		}
	};

	const fetchRegistrations = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const startStr = startDate ? new Date(startDate).toISOString() : undefined;
			const endStr = endDate ? (() => {
				const end = new Date(endDate);
				end.setHours(23, 59, 59, 999);
				return end.toISOString();
			})() : undefined;

			const data = await getSubmissions({
				type: '1',
				searchTerm: searchTerm.trim() || undefined,
				startDate: startStr,
				endDate: endStr,
				pageNumber: page,
				pageSize: pageSize
			}, apiKey);

			setItems(data.items || []);
			setTotalCount(data.totalCount || 0);
		} catch (err: any) {
			setError(err.message || 'An error occurred.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchRegistrations();
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, startDate, endDate, page, pageSize, apiKey]);

	const handleClearFilters = () => {
		setSearchTerm('');
		setStartDate('');
		setEndDate('');
		setPage(1);
	};

	const totalPages = Math.ceil(totalCount / pageSize);

	// Helpers to parse metadata properties
	const getMetadataProperty = (metadataStr: string, prop: string): string => {
		try {
			const parsed = JSON.parse(metadataStr);
			return parsed[prop] || '';
		} catch {
			return '';
		}
	};

	return (
		<div className="space-y-6">
			{/* Reusable Filter Bar */}
			<Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
				<CardContent className="py-3">
					<FilterBar
						searchTerm={searchTerm}
						onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
						searchPlaceholder="Search name or email..."
						startDate={startDate}
						onStartDateChange={(val) => { setStartDate(val); setPage(1); }}
						endDate={endDate}
						onEndDateChange={(val) => { setEndDate(val); setPage(1); }}
						onClear={handleClearFilters}
						showClear={!!(searchTerm || startDate || endDate)}
					/>
				</CardContent>
			</Card>

			{/* Main Content Area */}
			{error ? (
				<Card className="border-red-900/30 bg-red-950/10 text-center py-12">
					<CardContent>
						<div className="text-red-500 font-medium mb-2">Error loading registrations</div>
						<p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
						<Button onClick={fetchRegistrations} className="mt-4" variant="outline">
							Retry
						</Button>
					</CardContent>
				</Card>
			) : isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-12 w-full bg-slate-900" />
					<Skeleton className="h-16 w-full bg-slate-900" />
					<Skeleton className="h-16 w-full bg-slate-900" />
					<Skeleton className="h-16 w-full bg-slate-900" />
				</div>
			) : items.length === 0 ? (
				<Card className="border-slate-800 bg-slate-900/10 text-center py-16">
					<CardContent className="space-y-4">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-500">
							<MessageSquare className="h-8 w-8" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white">No registrations found</h3>
							<p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
								No student registration submissions matched your query parameters.
							</p>
						</div>
						{(searchTerm || startDate || endDate) && (
							<Button onClick={handleClearFilters} variant="outline" className="border-slate-800 text-slate-300">
								Clear Filters
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					<RegistrationTable items={items} onSelect={setSelectedItem} onDelete={setItemToDelete} />

					{/* Pagination */}
					<DataPagination
						currentPage={page}
						totalPages={totalPages}
						totalCount={totalCount}
						pageSize={pageSize}
						pageSizeOptions={[10, 20, 50, 100]}
						itemName="registrations"
						onPageChange={setPage}
						onPageSizeChange={(newSize) => {
							setPageSize(newSize);
							setPage(1);
						}}
						disabled={isLoading}
					/>
				</div>
			)}

			{/* Expand Details Dialog */}
			<Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
				<DialogContent className="border-slate-800 bg-slate-950 text-slate-100 max-w-xl">
					{selectedItem && (
						<>
							<DialogHeader className="border-b border-slate-800 pb-4">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
										Student Registration
									</Badge>
									<span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
										<Clock className="h-3 w-3" />
										{new Date(selectedItem.createdAt).toLocaleString()}
									</span>
								</div>
								<DialogTitle className="text-xl font-bold text-white mt-3 flex items-center gap-2">
									<User className="h-5 w-5 text-slate-400" />
									{selectedItem.name}
								</DialogTitle>
								<DialogDescription className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
									<Mail className="h-4 w-4 text-slate-500" />
									<a href={`mailto:${selectedItem.email}`} className="text-primary hover:underline">
										{selectedItem.email}
									</a>
								</DialogDescription>
							</DialogHeader>

							<div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
								{/* 1. Student Profile & Academic Details */}
								<div>
									<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student Profile & Academic Details</h4>
									<div className="bg-slate-900/50 border border-slate-800/80 rounded-md p-4 space-y-2.5 text-sm">
										<div className="flex justify-between border-b border-slate-800/60 pb-2">
											<span className="text-slate-400 flex items-center gap-1">
												<Phone className="h-4 w-4 text-slate-500" />
												Phone Number
											</span>
											<span className="text-slate-200 font-semibold">{getMetadataProperty(selectedItem.metadata, 'PhoneNumber') || 'N/A'}</span>
										</div>
										<div className="flex justify-between border-b border-slate-800/60 pb-2">
											<span className="text-slate-400 flex items-center gap-1">
												<BookOpen className="h-4 w-4 text-slate-500" />
												Target Program(s)
											</span>
											<span className="text-slate-200 font-semibold">{getMetadataProperty(selectedItem.metadata, 'TargetExam') || 'N/A'}</span>
										</div>
										{getMetadataProperty(selectedItem.metadata, 'DateOfBirth') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Date of Birth</span>
												<span className="text-slate-200">{getMetadataProperty(selectedItem.metadata, 'DateOfBirth')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'Gender') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Gender</span>
												<span className="text-slate-200 capitalize">{getMetadataProperty(selectedItem.metadata, 'Gender')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'Address') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Address</span>
												<span className="text-slate-200 text-right max-w-[280px] truncate">{getMetadataProperty(selectedItem.metadata, 'Address')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'LastSchool') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Last School Attended</span>
												<span className="text-slate-200">{getMetadataProperty(selectedItem.metadata, 'LastSchool')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'ClassCompleted') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Class Completed</span>
												<span className="text-slate-200">{getMetadataProperty(selectedItem.metadata, 'ClassCompleted')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'SubjectCombination') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Subject Combination</span>
												<span className="text-slate-200">{getMetadataProperty(selectedItem.metadata, 'SubjectCombination')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'ClassMode') && (
											<div className="flex justify-between border-b border-slate-800/60 pb-2">
												<span className="text-slate-400">Class Mode</span>
												<span className="text-slate-200 capitalize">{getMetadataProperty(selectedItem.metadata, 'ClassMode')}</span>
											</div>
										)}
										{getMetadataProperty(selectedItem.metadata, 'Referral') && (
											<div className="flex justify-between pt-1">
												<span className="text-slate-400">Referral Channel</span>
												<span className="text-slate-200">{getMetadataProperty(selectedItem.metadata, 'Referral')}</span>
											</div>
										)}
									</div>
								</div>

								{/* 2. Parent / Guardian Details */}
								<div>
									<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
										<HeartHandshake className="h-3.5 w-3.5 text-orange-400" />
										Parent / Guardian Information
									</h4>
									<div className="bg-slate-900/50 border border-slate-800/80 rounded-md p-4 space-y-2.5 text-sm">
										<div className="flex justify-between border-b border-slate-800/60 pb-2">
											<span className="text-slate-400">Guardian Name</span>
											<span className="text-slate-200 font-semibold">
												{getMetadataProperty(selectedItem.metadata, 'GuardianName') || 'Not provided'}
												{getMetadataProperty(selectedItem.metadata, 'GuardianRelationship') && (
													<span className="text-xs text-slate-400 font-normal ml-1">
														({getMetadataProperty(selectedItem.metadata, 'GuardianRelationship')})
													</span>
												)}
											</span>
										</div>
										<div className="flex justify-between border-b border-slate-800/60 pb-2">
											<span className="text-slate-400">Guardian Phone</span>
											<span className="text-slate-200 font-medium">
												{getMetadataProperty(selectedItem.metadata, 'GuardianPhone') ? (
													<a href={`tel:${getMetadataProperty(selectedItem.metadata, 'GuardianPhone')}`} className="text-primary hover:underline">
														{getMetadataProperty(selectedItem.metadata, 'GuardianPhone')}
													</a>
												) : (
													'Not provided'
												)}
											</span>
										</div>
										<div className="flex justify-between pt-1">
											<span className="text-slate-400">Guardian Email</span>
											<span className="text-slate-200 font-medium">
												{getMetadataProperty(selectedItem.metadata, 'GuardianEmail') ? (
													<a href={`mailto:${getMetadataProperty(selectedItem.metadata, 'GuardianEmail')}`} className="text-primary hover:underline">
														{getMetadataProperty(selectedItem.metadata, 'GuardianEmail')}
													</a>
												) : (
													'Not provided'
												)}
											</span>
										</div>
									</div>
								</div>

								{/* 3. Account Provisioning Section */}
								<div>
									<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
										<ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
										Student Portal Account
									</h4>
									{(() => {
										const isAccountCreated =
											getMetadataProperty(selectedItem.metadata, 'AccountCreated') === 'true' ||
											getMetadataProperty(selectedItem.metadata, 'AccountCreated') === true;
										const inviteUrl =
											getMetadataProperty(selectedItem.metadata, 'AccountInviteUrl') ||
											createAccountResult?.inviteUrl;

										if (isAccountCreated) {
											return (
												<div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
															<ShieldCheck className="h-4 w-4 text-emerald-400" />
															Account Provisioned
														</div>
														<Badge variant="outline" className="border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-xs">
															Role: Student
														</Badge>
													</div>
													<p className="text-xs text-slate-300">
														An account activation link was generated for <span className="font-semibold text-white">{selectedItem.email}</span>.
													</p>
													{inviteUrl && (
														<div className="space-y-1.5 pt-1">
															<div className="text-[11px] text-slate-400 font-medium">Activation Link:</div>
															<div className="flex items-center gap-2">
																<input
																	type="text"
																	readOnly
																	value={inviteUrl}
																	className="flex-1 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono select-all"
																/>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => handleCopyLink(inviteUrl)}
																	className="border-slate-800 hover:bg-slate-800 text-xs cursor-pointer"
																>
																	{copiedLink ? (
																		<>
																			<Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />
																			Copied
																		</>
																	) : (
																		<>
																			<Copy className="h-3.5 w-3.5 mr-1 text-slate-400" />
																			Copy Link
																		</>
																	)}
																</Button>
															</div>
														</div>
													)}
												</div>
											);
										}

										return (
											<div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-3">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
														<UserCheck className="h-4 w-4 text-orange-400" />
														Account Not Yet Created
													</div>
													<Badge variant="outline" className="border-amber-500/40 bg-amber-950/40 text-amber-400 text-xs">
														Pending Enrollment
													</Badge>
												</div>
												<p className="text-xs text-slate-400 leading-relaxed">
													After following up with the student and guardian, click below to enroll the student and dispatch an account activation link to their email.
												</p>
												{createAccountError && (
													<div className="p-3 rounded-md bg-red-950/40 border border-red-800/40 text-red-400 text-xs">
														{createAccountError}
													</div>
												)}
												<Button
													onClick={handleCreateAccount}
													disabled={isCreatingAccount}
													className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2 cursor-pointer shadow-md shadow-orange-600/20"
												>
													{isCreatingAccount ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Enrolling & Dispatching Activation Email...
														</>
													) : (
														<>
															<UserCheck className="mr-2 h-4 w-4" />
															Enroll & Create Student Account
														</>
													)}
												</Button>
											</div>
										);
									})()}
								</div>
							</div>

							<div className="flex justify-between items-center pt-3 border-t border-slate-800">
								<Button
									onClick={() => setItemToDelete(selectedItem)}
									variant="outline"
									size="sm"
									className="border-red-900/60 text-red-400 hover:bg-red-950/60 hover:text-red-200 cursor-pointer flex items-center gap-1.5"
								>
									<Trash2 className="h-4 w-4" />
									Delete Registration
								</Button>
								<Button onClick={() => setSelectedItem(null)} variant="outline" size="sm" className="border-slate-800 text-slate-300">
									Close
								</Button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<Dialog open={!!itemToDelete} onOpenChange={(open) => !open && !isDeleting && setItemToDelete(null)}>
				<DialogContent className="border-slate-800 bg-slate-950 text-slate-100 max-w-md">
					<DialogHeader className="space-y-2">
						<div className="flex items-center gap-2 text-red-400">
							<AlertTriangle className="h-5 w-5" />
							<DialogTitle className="text-lg font-bold text-white">Delete Registration</DialogTitle>
						</div>
						<DialogDescription className="text-slate-400 text-sm leading-relaxed">
							Are you sure you want to permanently delete the registration record for{' '}
							<span className="text-white font-semibold">{itemToDelete?.name}</span> (
							<span className="font-mono text-slate-300">{itemToDelete?.email}</span>)? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
						<Button
							variant="outline"
							size="sm"
							disabled={isDeleting}
							onClick={() => setItemToDelete(null)}
							className="border-slate-800 text-slate-300 hover:bg-slate-900 cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							disabled={isDeleting}
							onClick={handleConfirmDelete}
							className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
						>
							{isDeleting ? 'Deleting...' : 'Delete Registration'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
