'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { BlogPostDto, getPostBySlug } from '@/core/services/blogService';
import { Button } from '@/components/ui/button';
import {
	Calendar,
	User,
	Eye,
	Clock,
	Share2,
	Check,
	Copy,
	ArrowLeft,
	GraduationCap,
	BookOpen,
	Tag,
	Sparkles,
	Loader2
} from 'lucide-react';

function WhatsAppIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
		</svg>
	);
}

interface ArticleClientProps {
	initialPost?: BlogPostDto | null;
	slug: string;
}

export function ArticleClient({ initialPost, slug }: ArticleClientProps) {
	const [post, setPost] = useState<BlogPostDto | null>(initialPost || null);
	const [isLoading, setIsLoading] = useState<boolean>(!initialPost);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!initialPost && slug) {
			setIsLoading(true);
			getPostBySlug(slug)
				.then(data => {
					setPost(data);
					setError(null);
				})
				.catch((err: unknown) => {
					const msg = err instanceof Error ? err.message : 'Failed to load article.';
					setError(msg);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [initialPost, slug]);

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
				<div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
				<div className="h-12 w-full bg-slate-200 animate-pulse rounded" />
				<div className="h-64 w-full bg-slate-200 animate-pulse rounded-2xl" />
			</div>
		);
	}

	if (!post || error) {
		return (
			<div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
				<BookOpen className="h-12 w-12 text-slate-400 mx-auto" />
				<h2 className="text-xl font-bold text-slate-800">Article Not Found</h2>
				<p className="text-xs text-slate-500">
					{error || 'The article you are looking for might have been removed or is temporarily unavailable.'}
				</p>
				<Button asChild className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer mt-2 shadow-md">
					<Link href="/blog">Browse All Articles</Link>
				</Button>
			</div>
		);
	}

	const wordCount = post.content ? post.content.split(/\s+/).length : 0;
	const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

	const currentUrl =
		typeof window !== 'undefined'
			? window.location.href
			: `https://trailblazer-academy.com/blog/${post.slug}`;

	const handleCopyLink = () => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(currentUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		}
	};

	const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
		`${post.title}\n\nRead more at: ${currentUrl}`
	)}`;

	const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
		post.title
	)}&url=${encodeURIComponent(currentUrl)}`;

	return (
		<article className="w-full bg-slate-50/50 min-h-screen text-slate-900">
			{/* Breadcrumb & Back navigation */}
			<div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
					<Link
						href="/blog"
						className="inline-flex items-center gap-1.5 text-slate-600 hover:text-orange-600 transition-colors font-medium"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						Back to Knowledge Hub
					</Link>
					<span className="hidden sm:inline px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-medium">
						{post.category}
					</span>
				</div>
			</div>

			{/* Article Header & Hero */}
			<header className="bg-gradient-to-b from-orange-50/40 via-white to-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
						<span className="px-3 py-1 rounded-full font-bold bg-orange-600 text-white shadow-sm uppercase tracking-wider text-[11px]">
							{post.category}
						</span>
						<span className="flex items-center gap-1">
							<Calendar className="h-3.5 w-3.5 text-slate-400" />
							{new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
								month: 'long',
								day: 'numeric',
								year: 'numeric'
							})}
						</span>
						<span>&bull;</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5 text-slate-400" />
							{readingTimeMinutes} min read
						</span>
						<span>&bull;</span>
						<span className="flex items-center gap-1">
							<Eye className="h-3.5 w-3.5 text-slate-400" />
							{post.viewCount || 1} views
						</span>
					</div>

					<h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
						{post.title}
					</h1>

					<p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
						{post.excerpt}
					</p>

					{/* Author & Share Bar */}
					<div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						{/* Author Info */}
						<div className="flex items-center gap-3">
							<div className="h-11 w-11 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm">
								{post.authorName.charAt(0)}
							</div>
							<div>
								<p className="text-sm font-bold text-slate-900">{post.authorName}</p>
								<p className="text-xs text-slate-500">Trailblazer Academy Faculty</p>
							</div>
						</div>

						{/* Social Share Buttons */}
						<div className="flex items-center gap-2">
							<span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
								Share:
							</span>
							<a
								href={whatsappShareUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
								title="Share on WhatsApp"
							>
								<WhatsAppIcon className="h-4 w-4" />
							</a>
							<a
								href={twitterShareUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
								title="Share on Twitter / X"
							>
								<Share2 className="h-4 w-4" />
							</a>
							<button
								type="button"
								onClick={handleCopyLink}
								className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer text-xs font-medium shadow-sm"
								title="Copy Article Link"
							>
								{copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
								{copied ? 'Copied!' : 'Copy Link'}
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Article Body */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
				{/* Featured Cover Image */}
				{post.coverImageUrl && (
					<div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-white">
						<img
							src={post.coverImageUrl}
							alt={post.title}
							className="w-full h-auto max-h-[500px] object-cover"
						/>
					</div>
				)}

				{/* Markdown Content */}
				<div className="prose prose-slate prose-orange max-w-none text-slate-800 leading-relaxed text-base sm:text-lg space-y-6">
					<ReactMarkdown>{post.content}</ReactMarkdown>
				</div>

				{/* Tags */}
				{post.tags && post.tags.length > 0 && (
					<div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
						<Tag className="h-4 w-4 text-slate-400 mr-1" />
						{post.tags.map(tag => (
							<span
								key={tag}
								className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
							>
								#{tag}
							</span>
						))}
					</div>
				)}

				{/* Author Bio Box */}
				<div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
					<div className="h-14 w-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-extrabold text-xl shrink-0">
						{post.authorName.charAt(0)}
					</div>
					<div className="space-y-1">
						<h3 className="text-base font-bold text-slate-900">{post.authorName}</h3>
						<p className="text-xs text-slate-600 leading-relaxed">
							Educator & Content Contributor at Trailblazer Academy & Edukonsult. Committed to helping Nigerian students navigate exam success and secure tertiary admissions.
						</p>
					</div>
				</div>

				{/* Academy Conversion Banner */}
				<section className="rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-8 sm:p-10 text-white text-center shadow-xl relative overflow-hidden">
					<div className="max-w-xl mx-auto space-y-4">
						<GraduationCap className="h-10 w-10 mx-auto text-amber-200" />
						<h3 className="text-2xl font-black tracking-tight">
							Achieve Your Dream Score at Trailblazers
						</h3>
						<p className="text-xs sm:text-sm text-amber-100">
							Enroll in our comprehensive JAMB UTME, WAEC, NECO, or Post-UTME physical and CBT coaching sessions.
						</p>
						<div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
							<Link
								href="/register"
								className="px-6 py-2.5 rounded-xl bg-white text-orange-700 hover:bg-amber-50 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
							>
								Register Now
							</Link>
							<Link
								href="/contact"
								className="px-6 py-2.5 rounded-xl bg-orange-800/50 hover:bg-orange-800 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
							>
								Contact Academy Office
							</Link>
						</div>
					</div>
				</section>
			</div>
		</article>
	);
}
