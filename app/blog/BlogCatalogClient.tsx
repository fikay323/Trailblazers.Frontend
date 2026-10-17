'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
	getPublishedPosts,
	BlogPostCardDto,
	BlogCatalogResponse
} from '@/core/services/blogService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Search,
	Calendar,
	User,
	Eye,
	Clock,
	ArrowRight,
	Sparkles,
	BookOpen,
	GraduationCap,
	CheckCircle2
} from 'lucide-react';

const PRESET_CATEGORIES = [
	'All',
	'JAMB & UTME Tips',
	'WAEC & NECO Guides',
	'Study Strategies',
	'University Admissions & Post-UTME',
	'Academy News & Updates'
];

export function BlogCatalogClient() {
	const [posts, setPosts] = useState<BlogPostCardDto[]>([]);
	const [categories, setCategories] = useState<string[]>(PRESET_CATEGORIES);
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadPosts();
	}, [selectedCategory]);

	const loadPosts = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await getPublishedPosts(1, 24, selectedCategory, searchQuery);
			setPosts(res.items);
			if (res.categories && res.categories.length > 0) {
				const uniqueCats = Array.from(new Set(['All', ...res.categories]));
				setCategories(uniqueCats);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to load blog posts.';
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		loadPosts();
	};

	// Featured post is the first article when looking at "All" without search
	const featuredPost =
		selectedCategory === 'All' && !searchQuery.trim() && posts.length > 0
			? posts[0]
			: null;

	const gridPosts = featuredPost ? posts.slice(1) : posts;

	return (
		<div className="w-full bg-slate-50/60 min-h-screen text-slate-900">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-slate-50 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
				<div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
						<Sparkles className="h-3.5 w-3.5" />
						Knowledge Hub & Insights
					</div>
					<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
						Master JAMB, WAEC & Admissions <br className="hidden sm:inline" />
						with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700">Expert Guidance</span>
					</h1>
					<p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
						Proven study techniques, syllabus breakdowns, subject guides, and timely updates from the faculty at Trailblazer Academy & Edukonsult.
					</p>

					{/* Search Bar */}
					<form
						onSubmit={handleSearchSubmit}
						className="max-w-xl mx-auto pt-4 flex items-center gap-2"
					>
						<div className="relative flex-1">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								type="text"
								placeholder="Search topics, exams, study guides..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm"
							/>
						</div>
						<Button
							type="submit"
							className="h-11 px-5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl cursor-pointer shrink-0 shadow-md shadow-orange-600/20"
						>
							Search
						</Button>
					</form>

					{/* Category Filter Pills */}
					<div className="flex flex-wrap items-center justify-center gap-2 pt-4">
						{categories.map(cat => (
							<button
								key={cat}
								type="button"
								onClick={() => setSelectedCategory(cat)}
								className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
									selectedCategory === cat
										? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-2 ring-orange-500/50'
										: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</section>

			{/* Main Content Area */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
				{/* Loading State: Skeletons */}
				{isLoading && (
					<div className="space-y-8">
						{/* Featured Skeleton */}
						<div className="w-full h-80 rounded-2xl bg-slate-200/80 animate-pulse border border-slate-200" />
						{/* Grid Skeletons */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3, 4, 5, 6].map(i => (
								<div
									key={i}
									className="h-96 rounded-xl bg-slate-200/80 animate-pulse border border-slate-200"
								/>
							))}
						</div>
					</div>
				)}

				{/* Error State */}
				{!isLoading && error && (
					<div className="text-center py-16 bg-red-50 border border-red-200 rounded-2xl p-8">
						<p className="text-red-600 font-semibold mb-2">Unable to load articles</p>
						<p className="text-xs text-slate-600 mb-4">{error}</p>
						<Button
							onClick={loadPosts}
							variant="outline"
							className="border-red-300 text-red-700 hover:bg-red-100 cursor-pointer"
						>
							Try Again
						</Button>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && posts.length === 0 && (
					<div className="text-center py-20 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
						<div className="h-16 w-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-500">
							<BookOpen className="h-8 w-8" />
						</div>
						<h3 className="text-lg font-bold text-slate-800">No articles found</h3>
						<p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
							{searchQuery
								? `We couldn't find any articles matching "${searchQuery}". Try searching for another keyword or browse all categories.`
								: 'New articles and study guides are currently being prepared by our academic faculty. Check back shortly!'}
						</p>
						{(searchQuery || selectedCategory !== 'All') && (
							<Button
								onClick={() => {
									setSearchQuery('');
									setSelectedCategory('All');
								}}
								variant="outline"
								className="border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer mt-2"
							>
								Clear Filters
							</Button>
						)}
					</div>
				)}

				{/* Featured Article Card */}
				{!isLoading && !error && featuredPost && (
					<Link
						href={`/blog/${featuredPost.slug}`}
						className="group block relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-orange-400 transition-all duration-300 shadow-sm hover:shadow-xl"
					>
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
							<div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-[260px] overflow-hidden bg-slate-100">
								{featuredPost.coverImageUrl ? (
									<img
										src={featuredPost.coverImageUrl}
										alt={featuredPost.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
										<BookOpen className="h-20 w-20" />
									</div>
								)}
								<div className="absolute top-4 left-4">
									<span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-md uppercase tracking-wider">
										Featured Article
									</span>
								</div>
							</div>

							<div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
								<div className="space-y-3">
									<div className="flex items-center gap-3 text-xs text-slate-500">
										<span className="px-2.5 py-0.5 rounded-full font-medium bg-orange-50 text-orange-700 border border-orange-200">
											{featuredPost.category}
										</span>
										<span className="flex items-center gap-1">
											<Calendar className="h-3.5 w-3.5" />
											{new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString(
												undefined,
												{ month: 'short', day: 'numeric', year: 'numeric' }
											)}
										</span>
									</div>

									<h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
										{featuredPost.title}
									</h2>

									<p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
										{featuredPost.excerpt}
									</p>
								</div>

								<div className="pt-4 border-t border-slate-100 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="h-8 w-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold">
											{featuredPost.authorName.charAt(0)}
										</div>
										<div className="text-xs">
											<p className="font-semibold text-slate-800">{featuredPost.authorName}</p>
											<p className="text-[11px] text-slate-500">Academic Faculty</p>
										</div>
									</div>

									<span className="text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
										Read Full Article <ArrowRight className="h-3.5 w-3.5" />
									</span>
								</div>
							</div>
						</div>
					</Link>
				)}

				{/* Articles Grid */}
				{!isLoading && !error && gridPosts.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
						{gridPosts.map(post => (
							<Link
								key={post.id}
								href={`/blog/${post.slug}`}
								className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-300"
							>
								{/* Card Cover */}
								<div className="relative h-48 w-full overflow-hidden bg-slate-100">
									{post.coverImageUrl ? (
										<img
											src={post.coverImageUrl}
											alt={post.title}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
											<BookOpen className="h-12 w-12" />
										</div>
									)}
									<span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/95 backdrop-blur-md text-orange-700 border border-orange-200 shadow-sm">
										{post.category}
									</span>
								</div>

								{/* Card Body */}
								<div className="p-5 flex-1 flex flex-col justify-between space-y-4">
									<div className="space-y-2">
										<div className="flex items-center gap-3 text-[11px] text-slate-500">
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{new Date(post.publishedAt || post.createdAt).toLocaleDateString(
													undefined,
													{ month: 'short', day: 'numeric', year: 'numeric' }
												)}
											</span>
											<span>&bull;</span>
											<span className="flex items-center gap-1">
												<Eye className="h-3 w-3" />
												{post.viewCount || 0} reads
											</span>
										</div>

										<h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
											{post.title}
										</h3>

										<p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
											{post.excerpt}
										</p>
									</div>

									<div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
										<span className="text-slate-600 font-medium truncate max-w-[150px]">
											{post.authorName}
										</span>
										<span className="text-orange-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
											Read <ArrowRight className="h-3 w-3" />
										</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}

				{/* High-Converting Enrollment CTA Banner */}
				<section className="rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
					<div className="max-w-2xl mx-auto space-y-4 relative z-10">
						<GraduationCap className="h-10 w-10 mx-auto text-amber-200" />
						<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Ready to Score 300+ in JAMB or Ace WAEC?
						</h2>
						<p className="text-sm sm:text-base text-amber-100">
							Join hundreds of successful students learning at Trailblazer Academy. Experienced tutors, CBT practice software, and personalized mentorship.
						</p>
						<div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
							<Link
								href="/register"
								className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-orange-700 hover:bg-amber-50 font-bold text-sm transition-all shadow-md cursor-pointer"
							>
								Register for Coaching Today
							</Link>
							<Link
								href="/programs"
								className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-800/60 hover:bg-orange-800 text-white border border-white/20 font-semibold text-sm transition-all cursor-pointer"
							>
								Explore Academic Programs
							</Link>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
