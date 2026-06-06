'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Mail, Clock, User, ExternalLink } from 'lucide-react';
import { FilterBar } from '@/components/ui/FilterBar';
import { ContactTable, ContactSubmissionDTO } from './ContactTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ContactSubmissionsViewProps {
	apiKey: string;
}

export function ContactSubmissionsView({ apiKey }: ContactSubmissionsViewProps) {
	// Filters State
	const [searchTerm, setSearchTerm] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	// Pagination State
	const [page, setPage] = useState(1);
	const pageSize = 8;

	// Data States
	const [items, setItems] = useState<ContactSubmissionDTO[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Modal State
	const [selectedItem, setSelectedItem] = useState<ContactSubmissionDTO | null>(null);

	const fetchContacts = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const queryParams = new URLSearchParams();
			// Type=0 is Contact enum value on backend
			queryParams.append('type', '0');

			if (searchTerm.trim()) {
				queryParams.append('searchTerm', searchTerm.trim());
			}
			if (startDate) {
				queryParams.append('startDate', new Date(startDate).toISOString());
			}
			if (endDate) {
				const end = new Date(endDate);
				end.setHours(23, 59, 59, 999);
				queryParams.append('endDate', end.toISOString());
			}

			queryParams.append('pageNumber', page.toString());
			queryParams.append('pageSize', pageSize.toString());

			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';
			const response = await fetch(`${apiUrl}/api/submissions?${queryParams.toString()}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'X-API-KEY': apiKey
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to load contact submissions: ${response.statusText}`);
			}

			const data = await response.json();
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
			fetchContacts();
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, startDate, endDate, page, apiKey]);

	const handleClearFilters = () => {
		setSearchTerm('');
		setStartDate('');
		setEndDate('');
		setPage(1);
	};

	const totalPages = Math.ceil(totalCount / pageSize);

	// Helper to parse full message
	const getMessage = (metadataStr: string): string => {
		try {
			const parsed = JSON.parse(metadataStr);
			return parsed.Message || '';
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
						<div className="text-red-500 font-medium mb-2">Error loading inquiries</div>
						<p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
						<Button onClick={fetchContacts} className="mt-4" variant="outline">
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
							<h3 className="text-lg font-semibold text-white">No inquiries found</h3>
							<p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
								No contact submissions matched your query parameters.
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
					<ContactTable items={items} onSelect={setSelectedItem} />

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between pt-4 px-2">
							<div className="text-sm text-slate-400">
								Showing <span className="font-medium text-white">{((page - 1) * pageSize) + 1}</span> to{' '}
								<span className="font-medium text-white">{Math.min(page * pageSize, totalCount)}</span> of{' '}
								<span className="font-medium text-white">{totalCount}</span> inquiries
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
									disabled={page === 1}
									className="border-slate-800 text-slate-300 disabled:opacity-50"
								>
									<ChevronLeft className="h-4 w-4 mr-1" />
									Previous
								</Button>
								<span className="text-sm text-slate-400 px-2">
									Page {page} of {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
									disabled={page === totalPages}
									className="border-slate-800 text-slate-300 disabled:opacity-50"
								>
									Next
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Expand Message Dialog */}
			<Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
				<DialogContent className="border-slate-800 bg-slate-950 text-slate-100 max-w-xl">
					{selectedItem && (
						<>
							<DialogHeader className="border-b border-slate-800 pb-4">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
										Contact Inquiry
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
									<a href={`mailto:${selectedItem.email}`} className="text-primary hover:underline flex items-center gap-0.5">
										{selectedItem.email}
										<ExternalLink className="h-3 w-3" />
									</a>
								</DialogDescription>
							</DialogHeader>

							<div className="py-4 space-y-2">
								<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message Details</h4>
								<div className="bg-slate-900/50 border border-slate-800/80 rounded-md p-4 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
									{getMessage(selectedItem.metadata)}
								</div>
							</div>

							<div className="flex justify-end pt-2 border-t border-slate-800">
								<Button onClick={() => setSelectedItem(null)} variant="outline" className="border-slate-800 text-slate-300">
									Close
								</Button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
