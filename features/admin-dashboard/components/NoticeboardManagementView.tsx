'use client';

import React, { useState, useEffect } from 'react';
import {
	getAllAnnouncements,
	createAnnouncement,
	deleteAnnouncement,
	AnnouncementDto,
	AnnouncementPriority
} from '@/core/services/announcementService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Bell,
	Megaphone,
	Send,
	Trash2,
	AlertCircle,
	CheckCircle,
	Calendar,
	Mail,
	MessageSquare,
	Loader2,
	Plus,
	Search,
	Users,
	Sparkles
} from 'lucide-react';

interface NoticeboardManagementViewProps {
	apiKey: string;
}

const PRIORITY_OPTIONS: { id: AnnouncementPriority; label: string; badgeColor: string }[] = [
	{ id: 'General', label: 'General Notice', badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
	{ id: 'Urgent', label: 'Urgent Announcement', badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30' },
	{ id: 'FeeReminder', label: 'Fee Reminder', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
	{ id: 'Holiday', label: 'Holiday / Break', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
	{ id: 'MockExamSchedule', label: 'Mock Exam Schedule', badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30' }
];

export function NoticeboardManagementView({ apiKey }: NoticeboardManagementViewProps) {
	const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Composer state
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [priority, setPriority] = useState<AnnouncementPriority>('General');
	const [targetAudience, setTargetAudience] = useState('All');
	const [sendEmailBroadcast, setSendEmailBroadcast] = useState(false);
	const [sendSmsBroadcast, setSendSmsBroadcast] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [showComposer, setShowComposer] = useState(false);

	// Search & filter
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		loadAnnouncements();
	}, [apiKey]);

	const loadAnnouncements = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await getAllAnnouncements(1, 50, apiKey);
			setAnnouncements(res.items);
		} catch (err: any) {
			setError(err.message || 'Failed to load announcements.');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePublish = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			setError('Please provide both a title and message content.');
			return;
		}

		setIsPublishing(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const created = await createAnnouncement(
				{
					title: title.trim(),
					content: content.trim(),
					priority,
					targetAudience,
					sendEmailBroadcast,
					sendSmsBroadcast
				},
				apiKey
			);

			setSuccessMessage(
				`Notice "${created.title}" published successfully${
					sendEmailBroadcast ? ' and enqueued for email broadcast' : ''
				}!`
			);
			setTitle('');
			setContent('');
			setPriority('General');
			setSendEmailBroadcast(false);
			setSendSmsBroadcast(false);
			setShowComposer(false);
			await loadAnnouncements();
		} catch (err: any) {
			setError(err.message || 'Failed to publish announcement.');
		} finally {
			setIsPublishing(false);
		}
	};

	const handleDelete = async (id: string, noticeTitle: string) => {
		if (!confirm(`Are you sure you want to delete "${noticeTitle}"?`)) return;

		try {
			await deleteAnnouncement(id, apiKey);
			setAnnouncements(prev => prev.filter(a => a.id !== id));
			setSuccessMessage(`Notice "${noticeTitle}" deleted.`);
		} catch (err: any) {
			setError(err.message || 'Failed to delete announcement.');
		}
	};

	const filteredAnnouncements = announcements.filter(
		a =>
			a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
			a.authorName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getPriorityBadgeClass = (p: AnnouncementPriority) => {
		const found = PRIORITY_OPTIONS.find(o => o.id === p);
		return found ? found.badgeColor : 'bg-slate-800 text-slate-300 border-slate-700';
	};

	return (
		<div className="space-y-6">
			{/* Top Action Bar */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-lg font-bold text-white flex items-center gap-2">
						<Megaphone className="h-5 w-5 text-orange-400" />
						Academy Noticeboard &amp; Broadcasts
					</h2>
					<p className="text-xs text-slate-400 mt-0.5">
						Broadcast official announcements, exam schedules, and holiday notices to students.
					</p>
				</div>

				<Button
					onClick={() => setShowComposer(!showComposer)}
					className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-9 cursor-pointer flex items-center gap-1.5"
				>
					{showComposer ? (
						'Hide Composer'
					) : (
						<>
							<Plus className="h-4 w-4" />
							Create Announcement
						</>
					)}
				</Button>
			</div>

			{/* Status Feedback Alerts */}
			{error && (
				<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{successMessage && (
				<Alert className="border-emerald-800 bg-emerald-950/50 text-emerald-300">
					<CheckCircle className="h-4 w-4" />
					<AlertDescription>{successMessage}</AlertDescription>
				</Alert>
			)}

			{/* Announcement Composer */}
			{showComposer && (
				<Card className="border-slate-800 bg-slate-900/80 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
					<CardHeader className="border-b border-slate-800 pb-3">
						<CardTitle className="text-base font-bold text-white flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-orange-400" />
							Publish New Notice
						</CardTitle>
						<CardDescription className="text-xs text-slate-400">
							Broadcasts appear immediately on the student portal noticeboard.
						</CardDescription>
					</CardHeader>

					<CardContent className="pt-4">
						<form onSubmit={handlePublish} className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="sm:col-span-2">
									<label className="text-xs font-semibold text-slate-300 block mb-1">
										Notice Title *
									</label>
									<Input
										placeholder="e.g. JAMB CBT Mock Exam #3 Rescheduled to Saturday"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="border-slate-800 bg-slate-950 text-white text-xs h-9"
										required
									/>
								</div>

								<div>
									<label className="text-xs font-semibold text-slate-300 block mb-1">
										Target Audience
									</label>
									<select
										value={targetAudience}
										onChange={(e) => setTargetAudience(e.target.value)}
										className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 h-9"
									>
										<option value="All">All Students (General)</option>
										<option value="JAMB">JAMB UTME Cohort</option>
										<option value="WAEC">WAEC / SSCE Cohort</option>
									</select>
								</div>
							</div>

							<div>
								<label className="text-xs font-semibold text-slate-300 block mb-1.5">
									Priority &amp; Category
								</label>
								<div className="flex flex-wrap gap-2">
									{PRIORITY_OPTIONS.map((opt) => (
										<button
											key={opt.id}
											type="button"
											onClick={() => setPriority(opt.id)}
											className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${
												priority === opt.id
													? `${opt.badgeColor} ring-1 ring-orange-500`
													: 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
											}`}
										>
											{opt.label}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="text-xs font-semibold text-slate-300 block mb-1">
									Announcement Body *
								</label>
								<textarea
									rows={4}
									placeholder="Write the full announcement details here. Students will be able to read this on their dashboard..."
									value={content}
									onChange={(e) => setContent(e.target.value)}
									className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
									required
								/>
							</div>

							{/* Push Broadcast Options */}
							<div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
								<span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
									Broadcast Notification Channels (Optional)
								</span>
								<div className="flex flex-wrap gap-6 pt-1">
									<label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
										<input
											type="checkbox"
											checked={sendEmailBroadcast}
											onChange={(e) => setSendEmailBroadcast(e.target.checked)}
											className="rounded border-slate-800 text-orange-600 focus:ring-orange-500"
										/>
										<Mail className="h-3.5 w-3.5 text-orange-400" />
										<span>Email Broadcast (Send to all active students)</span>
									</label>

									<label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
										<input
											type="checkbox"
											checked={sendSmsBroadcast}
											onChange={(e) => setSendSmsBroadcast(e.target.checked)}
											className="rounded border-slate-800 text-orange-600 focus:ring-orange-500"
										/>
										<MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
										<span>SMS Broadcast (Alert via phone)</span>
									</label>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowComposer(false)}
									className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer text-xs"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									size="sm"
									disabled={isPublishing}
									className="bg-orange-600 hover:bg-orange-700 text-white text-xs cursor-pointer flex items-center gap-1.5"
								>
									{isPublishing ? (
										<>
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
											Publishing Notice...
										</>
									) : (
										<>
											<Send className="h-3.5 w-3.5" />
											Publish Notice
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Search Filter */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
				<Input
					placeholder="Search notices by title, content, or author..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-9 border-slate-800 bg-slate-900/60 text-white placeholder-slate-500 text-xs h-9"
				/>
			</div>

			{/* Announcements Feed / Table */}
			<Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
				<CardHeader className="pb-3 border-b border-slate-800">
					<CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
						<span>Published Announcements ({filteredAnnouncements.length})</span>
					</CardTitle>
				</CardHeader>

				<CardContent className="pt-4">
					{isLoading ? (
						<div className="py-12 text-center text-slate-400">
							<Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
							<p className="text-xs">Loading academy notices...</p>
						</div>
					) : filteredAnnouncements.length === 0 ? (
						<div className="py-12 text-center text-slate-500 space-y-2">
							<Bell className="h-8 w-8 mx-auto text-slate-600" />
							<p className="text-sm font-semibold text-slate-400">No announcements found</p>
							<p className="text-xs text-slate-500">
								Click &quot;Create Announcement&quot; above to publish your first notice to students.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredAnnouncements.map((notice) => (
								<div
									key={notice.id}
									className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-950/90 transition-colors space-y-2.5"
								>
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
										<div className="flex flex-wrap items-center gap-2">
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadgeClass(
													notice.priority
												)}`}
											>
												{notice.priorityName}
											</span>
											<span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
												<Users className="h-3 w-3 text-slate-500" />
												Audience: {notice.targetAudience}
											</span>
											{notice.sentEmailBroadcast && (
												<span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
													<Mail className="h-2.5 w-2.5" /> Email Broadcast
												</span>
											)}
										</div>

										<div className="flex items-center gap-3">
											<span className="text-[11px] text-slate-500 flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{new Date(notice.createdAt).toLocaleDateString()}
											</span>
											<button
												onClick={() => handleDelete(notice.id, notice.title)}
												className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded cursor-pointer"
												title="Delete notice"
												aria-label="Delete notice"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</div>
									</div>

									<div>
										<h3 className="text-sm font-bold text-white">{notice.title}</h3>
										<p className="text-xs text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
											{notice.content}
										</p>
									</div>

									<div className="text-[10px] text-slate-500">
										By <strong className="text-slate-400">{notice.authorName}</strong>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
