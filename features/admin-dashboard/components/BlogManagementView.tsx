'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
	getAdminPosts,
	getAdminPostById,
	createBlogPost,
	updateBlogPost,
	deleteBlogPost,
	BlogPostCardDto,
	BlogPostDto,
	CreateBlogPostPayload,
	UpdateBlogPostPayload
} from '@/core/services/blogService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Newspaper,
	Plus,
	Search,
	Edit3,
	Trash2,
	Eye,
	ExternalLink,
	Loader2,
	CheckCircle2,
	AlertCircle,
	Calendar,
	User,
	Tag,
	FileText,
	Image as ImageIcon,
	Sparkles,
	Upload,
	X
} from 'lucide-react';
import { MediaUploadModal } from './MediaUploadModal';

interface BlogManagementViewProps {
	apiKey: string;
}

const PRESET_CATEGORIES = [
	'JAMB & UTME Tips',
	'WAEC & NECO Guides',
	'Study Strategies',
	'University Admissions & Post-UTME',
	'Academy News & Updates'
];

const PRESET_COVERS = [
	{ label: 'JAMB Prep', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80' },
	{ label: 'Study Library', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80' },
	{ label: 'Science & Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80' },
	{ label: 'Exam Success', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
	{ label: 'Academy Campus', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' }
];

export function BlogManagementView({ apiKey }: BlogManagementViewProps) {
	const [posts, setPosts] = useState<BlogPostCardDto[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Filtering
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');

	// Composer Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [previewTab, setPreviewTab] = useState<'write' | 'preview'>('write');

	// Form State
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [content, setContent] = useState('');
	const [coverImageUrl, setCoverImageUrl] = useState('');
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
	const [tagsInput, setTagsInput] = useState('');
	const [isPublished, setIsPublished] = useState(false);

	// Delete Confirmation State
	const [deletingPost, setDeletingPost] = useState<BlogPostCardDto | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		loadPosts();
	}, [apiKey]);

	const loadPosts = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await getAdminPosts(1, 100, undefined, undefined, undefined, apiKey);
			setPosts(res.items);
			setCategories(res.categories.length > 0 ? res.categories : PRESET_CATEGORIES);
		} catch (err: any) {
			setError(err.message || 'Failed to load blog posts.');
		} finally {
			setIsLoading(false);
		}
	};

	const generateSlugFromTitle = (text: string) => {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/[\s-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	};

	const handleTitleChange = (val: string) => {
		setTitle(val);
		if (!isEditing) {
			setSlug(generateSlugFromTitle(val));
		}
	};

	const handleOpenCreateModal = () => {
		setIsEditing(false);
		setEditingId(null);
		setTitle('');
		setSlug('');
		setExcerpt('');
		setContent('');
		setCoverImageUrl(PRESET_COVERS[0].url);
		setCategory(PRESET_CATEGORIES[0]);
		setTagsInput('');
		setIsPublished(true);
		setPreviewTab('write');
		setError(null);
		setIsModalOpen(true);
	};

	const handleOpenEditModal = async (card: BlogPostCardDto) => {
		setIsEditing(true);
		setEditingId(card.id);
		setError(null);
		setPreviewTab('write');

		try {
			setIsSubmitting(true);
			const fullPost = await getAdminPostById(card.id, apiKey);
			setTitle(fullPost.title);
			setSlug(fullPost.slug);
			setExcerpt(fullPost.excerpt);
			setContent(fullPost.content);
			setCoverImageUrl(fullPost.coverImageUrl || '');
			setCategory(fullPost.category || PRESET_CATEGORIES[0]);
			setTagsInput(fullPost.tags ? fullPost.tags.join(', ') : '');
			setIsPublished(fullPost.isPublished);
			setIsModalOpen(true);
		} catch (err: any) {
			setError(err.message || 'Failed to fetch article details for editing.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSavePost = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim() || !excerpt.trim()) {
			setError('Please provide Title, Excerpt, and Article Content.');
			return;
		}

		setIsSubmitting(true);
		setError(null);
		setSuccessMessage(null);

		const tags = tagsInput
			.split(',')
			.map(t => t.trim())
			.filter(Boolean);

		try {
			if (isEditing && editingId) {
				const payload: UpdateBlogPostPayload = {
					title: title.trim(),
					slug: slug.trim() || generateSlugFromTitle(title),
					excerpt: excerpt.trim(),
					content: content.trim(),
					coverImageUrl: coverImageUrl.trim() || null,
					category: category.trim(),
					tags,
					isPublished
				};
				await updateBlogPost(editingId, payload, apiKey);
				setSuccessMessage(`Article "${title}" updated successfully!`);
			} else {
				const payload: CreateBlogPostPayload = {
					title: title.trim(),
					slug: slug.trim() || generateSlugFromTitle(title),
					excerpt: excerpt.trim(),
					content: content.trim(),
					coverImageUrl: coverImageUrl.trim() || null,
					category: category.trim(),
					tags,
					isPublished
				};
				await createBlogPost(payload, apiKey);
				setSuccessMessage(`Article "${title}" created successfully!`);
			}

			setIsModalOpen(false);
			await loadPosts();
		} catch (err: any) {
			setError(err.message || 'Failed to save blog post.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeletePost = async () => {
		if (!deletingPost) return;

		setIsDeleting(true);
		setError(null);
		try {
			await deleteBlogPost(deletingPost.id, apiKey);
			setPosts(prev => prev.filter(p => p.id !== deletingPost.id));
			setSuccessMessage(`Article "${deletingPost.title}" deleted successfully.`);
			setDeletingPost(null);
		} catch (err: any) {
			setError(err.message || 'Failed to delete blog post.');
		} finally {
			setIsDeleting(false);
		}
	};

	// Filtered list
	const filteredPosts = posts.filter(p => {
		const matchesSearch =
			p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.slug.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();

		const matchesStatus =
			publishedFilter === 'all' ||
			(publishedFilter === 'published' && p.isPublished) ||
			(publishedFilter === 'draft' && !p.isPublished);

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const totalPublished = posts.filter(p => p.isPublished).length;
	const totalDrafts = posts.filter(p => !p.isPublished).length;
	const totalViews = posts.reduce((acc, p) => acc + (p.viewCount || 0), 0);

	return (
		<div className="space-y-6">
			{/* Top Action Bar & Metrics */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-bold text-white flex items-center gap-2">
						<Newspaper className="h-5 w-5 text-orange-500" />
						Blog & Knowledge Hub Management
					</h2>
					<p className="text-xs sm:text-sm text-slate-400 mt-0.5">
						Create educational guides, exam advice, academy news, and SEO articles.
					</p>
				</div>
				<Button
					onClick={handleOpenCreateModal}
					className="bg-orange-600 hover:bg-orange-700 text-white font-medium flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
				>
					<Plus className="h-4 w-4" />
					New Article
				</Button>
			</div>

			{/* Metrics Overview Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
				<Card className="border-slate-800 bg-slate-900/60 p-4">
					<p className="text-xs font-medium text-slate-400">Total Articles</p>
					<p className="text-2xl font-black text-white mt-1">{posts.length}</p>
				</Card>
				<Card className="border-slate-800 bg-slate-900/60 p-4">
					<p className="text-xs font-medium text-emerald-400">Published</p>
					<p className="text-2xl font-black text-emerald-400 mt-1">{totalPublished}</p>
				</Card>
				<Card className="border-slate-800 bg-slate-900/60 p-4">
					<p className="text-xs font-medium text-amber-400">Drafts</p>
					<p className="text-2xl font-black text-amber-400 mt-1">{totalDrafts}</p>
				</Card>
				<Card className="border-slate-800 bg-slate-900/60 p-4">
					<p className="text-xs font-medium text-cyan-400">Total Views</p>
					<p className="text-2xl font-black text-cyan-400 mt-1">{totalViews.toLocaleString()}</p>
				</Card>
			</div>

			{/* Feedback Alerts */}
			{error && (
				<Alert variant="destructive" className="border-red-500/50 bg-red-950/20 text-red-400">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{successMessage && (
				<Alert className="border-emerald-500/50 bg-emerald-950/20 text-emerald-400">
					<CheckCircle2 className="h-4 w-4" />
					<AlertDescription>{successMessage}</AlertDescription>
				</Alert>
			)}

			{/* Search & Filters */}
			<Card className="border-slate-800 bg-slate-900/40">
				<CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
					<div className="relative w-full md:w-80">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
						<Input
							placeholder="Search articles by title, slug, excerpt..."
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className="pl-9 bg-slate-950 border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
						{/* Category Filter */}
						<select
							aria-label="Filter articles by category"
							value={selectedCategory}
							onChange={e => setSelectedCategory(e.target.value)}
							className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
						>
							<option value="All">All Categories</option>
							{categories.map(c => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>

						{/* Status Filter */}
						<div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
							<button
								type="button"
								onClick={() => setPublishedFilter('all')}
								className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
									publishedFilter === 'all'
										? 'bg-orange-600 text-white'
										: 'text-slate-400 hover:text-white'
								}`}
							>
								All
							</button>
							<button
								type="button"
								onClick={() => setPublishedFilter('published')}
								className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
									publishedFilter === 'published'
										? 'bg-emerald-600 text-white'
										: 'text-slate-400 hover:text-white'
								}`}
							>
								Published
							</button>
							<button
								type="button"
								onClick={() => setPublishedFilter('draft')}
								className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
									publishedFilter === 'draft'
										? 'bg-amber-600 text-white'
										: 'text-slate-400 hover:text-white'
								}`}
							>
								Drafts
							</button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Articles Table & Shimmer Loader */}
			<Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
				{isLoading ? (
					<div className="p-8 space-y-4">
						{[1, 2, 3, 4].map(i => (
							<div
								key={i}
								className="h-16 w-full rounded-lg bg-slate-800/40 animate-pulse flex items-center justify-between px-4"
							>
								<div className="space-y-2">
									<div className="h-4 w-48 bg-slate-700/50 rounded" />
									<div className="h-3 w-32 bg-slate-700/30 rounded" />
								</div>
								<div className="h-8 w-24 bg-slate-700/40 rounded" />
							</div>
						))}
					</div>
				) : filteredPosts.length === 0 ? (
					<div className="py-16 text-center space-y-3">
						<Newspaper className="h-12 w-12 text-slate-600 mx-auto" />
						<p className="text-base font-semibold text-slate-300">No blog articles found</p>
						<p className="text-xs text-slate-500 max-w-sm mx-auto">
							{searchTerm || selectedCategory !== 'All' || publishedFilter !== 'all'
								? 'Try adjusting your search or filters to locate posts.'
								: 'Get started by creating your first article to share updates and study guides.'}
						</p>
						<Button
							onClick={handleOpenCreateModal}
							variant="outline"
							className="border-slate-700 text-slate-300 hover:text-white cursor-pointer mt-2"
						>
							<Plus className="h-4 w-4 mr-1.5" />
							Create First Article
						</Button>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-slate-300">
							<thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
								<tr>
									<th className="py-3 px-4">Article</th>
									<th className="py-3 px-4 hidden sm:table-cell">Category</th>
									<th className="py-3 px-4 hidden md:table-cell">Author & Date</th>
									<th className="py-3 px-4 text-center">Status</th>
									<th className="py-3 px-4 text-center hidden lg:table-cell">Views</th>
									<th className="py-3 px-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800/60">
								{filteredPosts.map(post => (
									<tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
										<td className="py-3.5 px-4">
											<div className="flex items-center gap-3">
												{post.coverImageUrl ? (
													<img
														src={post.coverImageUrl}
														alt={post.title}
														className="h-11 w-16 object-cover rounded-md border border-slate-800 shrink-0"
													/>
												) : (
													<div className="h-11 w-16 bg-slate-800 rounded-md flex items-center justify-center text-slate-500 shrink-0 border border-slate-700">
														<FileText className="h-5 w-5" />
													</div>
												)}
												<div className="min-w-0">
													<p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
														{post.title}
													</p>
													<p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md font-mono">
														/blog/{post.slug}
													</p>
												</div>
											</div>
										</td>

										<td className="py-3.5 px-4 hidden sm:table-cell">
											<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
												{post.category}
											</span>
										</td>

										<td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-400">
											<div className="flex items-center gap-1.5 text-slate-300 font-medium">
												<User className="h-3 w-3 text-slate-500" />
												{post.authorName}
											</div>
											<div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
												<Calendar className="h-3 w-3" />
												{new Date(post.createdAt).toLocaleDateString(undefined, {
													month: 'short',
													day: 'numeric',
													year: 'numeric'
												})}
											</div>
										</td>

										<td className="py-3.5 px-4 text-center">
											{post.isPublished ? (
												<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
													<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
													Published
												</span>
											) : (
												<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
													Draft
												</span>
											)}
										</td>

										<td className="py-3.5 px-4 text-center hidden lg:table-cell text-xs font-mono text-slate-400">
											{post.viewCount || 0}
										</td>

										<td className="py-3.5 px-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												{/* Live Link */}
												{post.isPublished && (
													<Link
														href={`/blog/${post.slug}`}
														target="_blank"
														rel="noopener noreferrer"
														title="View live post"
														className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
													>
														<ExternalLink className="h-4 w-4" />
													</Link>
												)}

												{/* Edit Button */}
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleOpenEditModal(post)}
													className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
													title="Edit article"
												>
													<Edit3 className="h-4 w-4" />
												</Button>

												{/* Delete Button */}
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setDeletingPost(post)}
													className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
													title="Delete article"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{/* ========================================== */}
			{/* MODAL: CREATE & EDIT ARTICLE COMPOSER     */}
			{/* ========================================== */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
					<Card className="w-full max-w-4xl border-slate-800 bg-slate-900 text-slate-100 shadow-2xl max-h-[92vh] flex flex-col my-auto">
						<CardHeader className="border-b border-slate-800 pb-4 shrink-0 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
									{isEditing ? <Edit3 className="h-5 w-5 text-orange-500" /> : <Plus className="h-5 w-5 text-orange-500" />}
									<h3>{isEditing ? 'Edit Article' : 'Create New Article'}</h3>
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Write in Markdown with real-time preview, SEO excerpt, tags, and category.
								</CardDescription>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<form onSubmit={handleSavePost} className="flex flex-col flex-1 overflow-hidden">
							<CardContent className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
								{/* Title & Slug */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<label className="text-xs font-semibold text-slate-300">
											Article Title <span className="text-red-400">*</span>
										</label>
										<Input
											placeholder="e.g. How to Score 300+ in JAMB UTME 2026"
											value={title}
											onChange={e => handleTitleChange(e.target.value)}
											className="bg-slate-950 border-slate-800 text-white text-sm"
											required
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-xs font-semibold text-slate-300">
											URL Slug <span className="text-slate-500">(Auto-generated or custom)</span>
										</label>
										<Input
											placeholder="e.g. how-to-score-300-in-jamb-utme-2026"
											value={slug}
											onChange={e => setSlug(e.target.value)}
											className="bg-slate-950 border-slate-800 text-white text-sm font-mono text-xs"
											required
										/>
									</div>
								</div>

								{/* Category & Tags */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<label className="text-xs font-semibold text-slate-300">Category</label>
										<select
											aria-label="Article category"
											value={category}
											onChange={e => setCategory(e.target.value)}
											className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
										>
											{PRESET_CATEGORIES.map(c => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-1.5">
										<label className="text-xs font-semibold text-slate-300">
											Tags <span className="text-slate-500">(Comma-separated)</span>
										</label>
										<Input
											placeholder="e.g. JAMB, Physics, Study Plan, Tips"
											value={tagsInput}
											onChange={e => setTagsInput(e.target.value)}
											className="bg-slate-950 border-slate-800 text-white text-sm"
										/>
									</div>
								</div>

								{/* Cover Image URL & Presets */}
								<div className="space-y-2">
									<label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
										<span>Cover Image</span>
										<span className="text-slate-500 font-normal">Optional header banner</span>
									</label>
									<div className="flex gap-2">
										<Input
											placeholder="https://images.unsplash.com/... or upload directly"
											value={coverImageUrl}
											onChange={e => setCoverImageUrl(e.target.value)}
											className="bg-slate-950 border-slate-800 text-white text-sm"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsUploadModalOpen(true)}
											className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs shrink-0 gap-1.5"
										>
											<Upload className="w-3.5 h-3.5 text-orange-400" />
											Upload Image
										</Button>
									</div>
									{coverImageUrl && (
										<div className="relative w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={coverImageUrl}
												alt="Cover Preview"
												className="w-full h-full object-cover"
											/>
											<button
												type="button"
												onClick={() => setCoverImageUrl('')}
												className="absolute top-2 right-2 bg-slate-950/80 hover:bg-red-950 text-slate-300 hover:text-red-300 p-1 rounded border border-slate-700 transition-colors cursor-pointer"
												title="Remove Cover Image"
											>
												<X className="w-3.5 h-3.5" />
											</button>
										</div>
									)}
									<div className="flex flex-wrap items-center gap-1.5 pt-1">
										<span className="text-[11px] text-slate-500 mr-1">Quick Presets:</span>
										{PRESET_COVERS.map(preset => (
											<button
												key={preset.label}
												type="button"
												onClick={() => setCoverImageUrl(preset.url)}
												className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
													coverImageUrl === preset.url
														? 'bg-orange-600/20 text-orange-400 border-orange-500/40'
														: 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
												}`}
											>
												{preset.label}
											</button>
										))}
									</div>
								</div>

								{/* Excerpt / SEO Meta Description */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label className="text-xs font-semibold text-slate-300">
											Article Excerpt & SEO Meta Description <span className="text-red-400">*</span>
										</label>
										<span
											className={`text-[11px] font-mono ${
												excerpt.length > 500 ? 'text-red-400' : 'text-slate-500'
											}`}
										>
											{excerpt.length}/500 chars
										</span>
									</div>
									<textarea
										rows={2}
										placeholder="Brief 1-2 sentence overview of the article shown on preview cards and Google search results."
										value={excerpt}
										onChange={e => setExcerpt(e.target.value)}
										maxLength={550}
										className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
										required
									/>
								</div>

								{/* Content / Markdown Editor with Live Preview */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-xs font-semibold text-slate-300">
											Article Content (Markdown) <span className="text-red-400">*</span>
										</label>
										<div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
											<button
												type="button"
												onClick={() => setPreviewTab('write')}
												className={`px-3 py-1 rounded-md font-medium transition-colors ${
													previewTab === 'write'
														? 'bg-orange-600 text-white'
														: 'text-slate-400 hover:text-white'
												}`}
											>
												Write Markdown
											</button>
											<button
												type="button"
												onClick={() => setPreviewTab('preview')}
												className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
													previewTab === 'preview'
														? 'bg-orange-600 text-white'
														: 'text-slate-400 hover:text-white'
												}`}
											>
												<Eye className="h-3.5 w-3.5" />
												Live Preview
											</button>
										</div>
									</div>

									{previewTab === 'write' ? (
										<textarea
											rows={12}
											placeholder="Write your article in markdown... Support headings (#, ##), bold (**), lists (-), quotes (>), code blocks (```), etc."
											value={content}
											onChange={e => setContent(e.target.value)}
											className="w-full font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
											required
										/>
									) : (
										<div className="w-full min-h-[280px] max-h-[400px] overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-4 prose prose-invert max-w-none text-xs sm:text-sm">
											{content.trim() ? (
												<ReactMarkdown>{content}</ReactMarkdown>
											) : (
												<p className="text-slate-500 italic">No content written yet.</p>
											)}
										</div>
									)}
								</div>

								{/* Publication Status Toggle */}
								<div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
									<div>
										<p className="text-xs font-semibold text-white">Publish Status</p>
										<p className="text-[11px] text-slate-400">
											{isPublished
												? 'Publicly visible to students, parents, and search engines.'
												: 'Saved as a draft. Visible only to tutors and administrators.'}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setIsPublished(!isPublished)}
										className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
											isPublished ? 'bg-emerald-600' : 'bg-slate-700'
										}`}
									>
										<span
											className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
												isPublished ? 'translate-x-6' : 'translate-x-1'
											}`}
										/>
									</button>
								</div>
							</CardContent>

							<div className="border-t border-slate-800 p-4 shrink-0 flex items-center justify-end gap-3 bg-slate-900">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsModalOpen(false)}
									className="border-slate-800 text-slate-300 hover:text-white cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer min-w-[120px]"
								>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : isEditing ? (
										'Update Article'
									) : (
										'Publish Article'
									)}
								</Button>
							</div>
						</form>
					</Card>
				</div>
			)}

			{/* ========================================== */}
			{/* MODAL: DELETE CONFIRMATION DIALOG          */}
			{/* ========================================== */}
			{deletingPost && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
					<Card className="w-full max-w-md border-red-900/40 bg-slate-900 text-slate-100 shadow-2xl">
						<CardHeader className="space-y-1">
							<div className="h-10 w-10 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-2">
								<Trash2 className="h-5 w-5" />
							</div>
							<CardTitle className="text-lg font-bold text-white">
								<h3>Delete Article?</h3>
							</CardTitle>
							<CardDescription className="text-xs text-slate-400">
								Are you sure you want to permanently delete{' '}
								<span className="text-white font-semibold">"{deletingPost.title}"</span>? This action cannot be undone.
							</CardDescription>
						</CardHeader>
						<div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								disabled={isDeleting}
								onClick={() => setDeletingPost(null)}
								className="border-slate-800 text-slate-300 hover:text-white cursor-pointer"
							>
								Cancel
							</Button>
							<Button
								type="button"
								disabled={isDeleting}
								onClick={handleDeletePost}
								className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer min-w-[100px]"
							>
								{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Article'}
							</Button>
						</div>
					</Card>
				</div>
			)}

			{/* Media Upload Modal for Blog Cover */}
			<MediaUploadModal
				isOpen={isUploadModalOpen}
				title="Upload Blog Cover Image"
				description="Upload and crop a header banner for your article (recommended 16:9 aspect ratio)."
				defaultAspect="16:9"
				folder="blog"
				tokenOrApiKey={apiKey}
				onClose={() => setIsUploadModalOpen(false)}
				onUploadSuccess={(data) => setCoverImageUrl(data.url)}
			/>
		</div>
	);
}
