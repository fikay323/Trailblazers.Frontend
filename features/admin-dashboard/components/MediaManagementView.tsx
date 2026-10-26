'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
	Image as ImageIcon,
	Share2,
	Sliders,
	Users,
	Sparkles,
	Grid,
	Search,
	RefreshCw,
	Plus,
	Loader2,
	UploadCloud,
	Layers,
	Eye,
	CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteAsset, UpdateSiteAssetPayload } from '@/types/site-assets';
import {
	getSiteAssets,
	upsertSiteAsset,
	deleteSiteAsset,
	reorderSiteAssets
} from '@/core/services/siteAssetService';
import { ImageSlotCard } from './ImageSlotCard';
import { MediaUploadModal } from './MediaUploadModal';

export interface MediaManagementViewProps {
	apiKey?: string;
}

type MediaSubTab = 'seo' | 'home' | 'gallery' | 'team' | 'pages';

export function MediaManagementView({ apiKey }: MediaManagementViewProps) {
	const [assets, setAssets] = useState<SiteAsset[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [activeSubTab, setActiveSubTab] = useState<MediaSubTab>('seo');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const loadAssets = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getSiteAssets();
			setAssets(data);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to load media assets';
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadAssets();
	}, []);

	// Categorize assets into sub-tabs
	const filteredAssets = useMemo(() => {
		let list = assets;
		switch (activeSubTab) {
			case 'seo':
				list = assets.filter((a) => a.group === 'seo');
				break;
			case 'home':
				list = assets.filter((a) => a.group === 'home');
				break;
			case 'gallery':
				list = assets.filter((a) => a.group === 'gallery');
				break;
			case 'team':
				list = assets.filter((a) => a.group === 'team');
				break;
			case 'pages':
				list = assets.filter((a) => ['about', 'programs', 'branding'].includes(a.group));
				break;
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			return list.filter(
				(a) =>
					a.key.toLowerCase().includes(q) ||
					(a.title && a.title.toLowerCase().includes(q)) ||
					(a.altText && a.altText.toLowerCase().includes(q)) ||
					(a.caption && a.caption.toLowerCase().includes(q))
			);
		}

		return list;
	}, [assets, activeSubTab, searchQuery]);

	// Stats
	const totalCount = assets.length;
	const customCdnCount = assets.filter((a) => a.imageUrl.includes('cloudinary.com')).length;
	const defaultStaticCount = totalCount - customCdnCount;

	const handleSaveAsset = async (key: string, payload: UpdateSiteAssetPayload) => {
		const updated = await upsertSiteAsset(key, payload, apiKey);
		setAssets((prev) =>
			prev.map((item) => (item.key === key ? updated : item))
		);
	};

	const handleResetAsset = async (key: string) => {
		// Call upsert with original default static image URL
		const existing = assets.find((a) => a.key === key);
		if (!existing) return;

		let defaultUrl = '/trailblazer.jpeg';
		if (key.startsWith('home.hero.')) {
			defaultUrl = '/images/image-1.jpeg';
		} else if (key.startsWith('gallery.item.')) {
			defaultUrl = '/images/image-5.jpeg';
		} else if (key.startsWith('team.member.')) {
			defaultUrl = '/images/akintunde-gbadamosi.jpeg';
		} else if (key === 'about.hero.background') {
			defaultUrl = '/images/image-5.jpeg';
		} else if (key === 'about.hero.foreground') {
			defaultUrl = '/images/image-3.jpeg';
		} else if (key === 'about.objectives.banner' || key === 'about.cbt_lab') {
			defaultUrl = '/images/image-10.jpeg';
		} else if (key === 'programs.hero') {
			defaultUrl = '/images/image-2.jpeg';
		}

		const updated = await upsertSiteAsset(
			key,
			{
				...existing,
				imageUrl: defaultUrl,
				publicId: null
			},
			apiKey
		);

		setAssets((prev) =>
			prev.map((item) => (item.key === key ? updated : item))
		);
	};

	const handleCreateNewGalleryItem = async (data: { url: string; publicId: string }) => {
		const galleryItems = assets.filter((a) => a.group === 'gallery');
		const nextIndex = galleryItems.length + 1;
		const newKey = `gallery.item.${nextIndex}`;

		const newAsset = await upsertSiteAsset(
			newKey,
			{
				group: 'gallery',
				imageUrl: data.url,
				publicId: data.publicId,
				altText: `Campus photo ${nextIndex}`,
				title: `Facility photo ${nextIndex}`,
				metadataJson: JSON.stringify({ className: 'h-62.5' }),
				sortOrder: nextIndex
			},
			apiKey
		);

		setAssets((prev) => [...prev, newAsset]);
	};

	const subTabMeta: Array<{ id: MediaSubTab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }> = [
		{ id: 'seo', label: 'SEO & Social Cards', icon: Share2, count: assets.filter((a) => a.group === 'seo').length },
		{ id: 'home', label: 'Home Hero Carousel', icon: Sliders, count: assets.filter((a) => a.group === 'home').length },
		{ id: 'gallery', label: 'Campus Gallery', icon: Grid, count: assets.filter((a) => a.group === 'gallery').length },
		{ id: 'team', label: 'Leadership & Faculty', icon: Users, count: assets.filter((a) => a.group === 'team').length },
		{ id: 'pages', label: 'Page Spots & Logo', icon: Layers, count: assets.filter((a) => ['about', 'programs', 'branding'].includes(a.group)).length }
	];

	return (
		<div className="space-y-6">
			{/* Metric Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
					<div>
						<p className="text-xs text-slate-400 font-medium">Total Site Slots</p>
						<p className="text-2xl font-bold text-white mt-0.5">{totalCount}</p>
					</div>
					<div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
						<ImageIcon className="h-5 w-5" />
					</div>
				</div>

				<div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
					<div>
						<p className="text-xs text-slate-400 font-medium">Custom CDN Uploads</p>
						<p className="text-2xl font-bold text-emerald-400 mt-0.5">{customCdnCount}</p>
					</div>
					<div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
						<CheckCircle2 className="h-5 w-5" />
					</div>
				</div>

				<div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
					<div>
						<p className="text-xs text-slate-400 font-medium">Default Static Fallbacks</p>
						<p className="text-2xl font-bold text-slate-300 mt-0.5">{defaultStaticCount}</p>
					</div>
					<div className="h-10 w-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
						<RefreshCw className="h-5 w-5" />
					</div>
				</div>
			</div>

			{/* Sub-tab Navigation Bar */}
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
					{subTabMeta.map((tab) => {
						const TabIcon = tab.icon;
						const isActive = activeSubTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveSubTab(tab.id)}
								className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
									isActive
										? 'bg-orange-600 text-white shadow-sm'
										: 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
								}`}
							>
								<TabIcon className="h-4 w-4" />
								<span>{tab.label}</span>
								<span
									className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
										isActive ? 'bg-orange-800/60 text-white' : 'bg-slate-800 text-slate-400'
									}`}
								>
									{tab.count}
								</span>
							</button>
						);
					})}
				</div>

				{/* Search & Actions */}
				<div className="flex items-center gap-2.5">
					<div className="relative flex-1 md:w-64">
						<Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
						<Input
							placeholder="Search slots or alt text..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8 h-9 text-xs bg-slate-900 border-slate-800 text-white placeholder-slate-500"
						/>
					</div>

					{activeSubTab === 'gallery' && (
						<Button
							type="button"
							size="sm"
							onClick={() => setIsCreateModalOpen(true)}
							className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-9 gap-1.5 font-medium whitespace-nowrap"
						>
							<Plus className="h-3.5 w-3.5" />
							Add Gallery Photo
						</Button>
					)}

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={loadAssets}
						disabled={isLoading}
						className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 h-9 px-2.5"
						title="Refresh assets"
					>
						<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
					</Button>
				</div>
			</div>

			{/* Sub-tab description and tips banner */}
			{activeSubTab === 'seo' && (
				<div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-4 text-xs text-indigo-200 flex items-start gap-3">
					<Share2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
					<div className="space-y-1">
						<p className="font-semibold text-white">OpenGraph & Social Share Preview Cards</p>
						<p className="text-slate-300 leading-relaxed">
							These images generate the rich preview banners whenever students, parents, or sponsors share Trailblazer Academy links on <strong>WhatsApp, Facebook, Twitter, and LinkedIn</strong>.
							Recommended resolution: <strong>1200 × 630 px (16:9)</strong>.
						</p>
					</div>
				</div>
			)}

			{activeSubTab === 'home' && (
				<div className="bg-orange-950/40 border border-orange-800/40 rounded-xl p-4 text-xs text-orange-200 flex items-start gap-3">
					<Sliders className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
					<div className="space-y-1">
						<p className="font-semibold text-white">Homepage Full-Screen Hero Slider</p>
						<p className="text-slate-300 leading-relaxed">
							Controls the slides rotated across the main landing page hero section. Each slide supports a custom background image, headline badge, and descriptive caption.
						</p>
					</div>
				</div>
			)}

			{activeSubTab === 'gallery' && (
				<div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-4 text-xs text-emerald-200 flex items-start gap-3">
					<Grid className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
					<div className="space-y-1">
						<p className="font-semibold text-white">Campus Facilities & Life Gallery</p>
						<p className="text-slate-300 leading-relaxed">
							Displayed on the public <code className="text-emerald-300 font-mono">/gallery</code> page. You can add new campus pictures, update captions, and swap images anytime.
						</p>
					</div>
				</div>
			)}

			{activeSubTab === 'team' && (
				<div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-4 text-xs text-purple-200 flex items-start gap-3">
					<Users className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
					<div className="space-y-1">
						<p className="font-semibold text-white">Leadership & Management Team</p>
						<p className="text-slate-300 leading-relaxed">
							Faculty portraits displayed on the About page. Recommended aspect ratio: <strong>1:1 (Square)</strong> or <strong>4:5 (Portrait)</strong>.
						</p>
					</div>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="p-4 bg-red-950/80 border border-red-800/80 rounded-xl text-red-200 text-sm">
					{error}
				</div>
			)}

			{/* Loading Skeleton */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{[1, 2, 3, 4, 5, 6].map((idx) => (
						<div
							key={idx}
							className="h-80 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse p-4 space-y-4"
						>
							<div className="h-5 bg-slate-800 rounded w-1/2" />
							<div className="h-44 bg-slate-800 rounded-lg" />
							<div className="h-8 bg-slate-800 rounded" />
						</div>
					))}
				</div>
			) : filteredAssets.length === 0 ? (
				<div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center space-y-3">
					<ImageIcon className="h-10 w-10 text-slate-600 mx-auto" />
					<p className="text-white font-semibold">No image slots match your search</p>
					<p className="text-xs text-slate-400">
						Try adjusting your search query or switch to another section tab.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{filteredAssets.map((asset) => {
						const isTeam = asset.group === 'team';
						const isSeo = asset.group === 'seo';
						const aspect = isTeam ? '1:1' : isSeo ? '16:9' : 'free';
						const dimensions = isTeam ? '800 × 800 px (1:1)' : isSeo ? '1200 × 630 px (16:9)' : 'High Res';

						return (
							<ImageSlotCard
								key={asset.key}
								asset={asset}
								defaultFallbackUrl={asset.imageUrl}
								recommendedAspect={aspect}
								recommendedDimensions={dimensions}
								onSave={handleSaveAsset}
								onResetToDefault={handleResetAsset}
								tokenOrApiKey={apiKey}
							/>
						);
					})}
				</div>
			)}

			{/* Create New Gallery Item Modal */}
			<MediaUploadModal
				isOpen={isCreateModalOpen}
				title="Add New Campus Gallery Photo"
				description="Upload a new picture for the public /gallery showcase grid."
				defaultAspect="free"
				folder="gallery"
				tokenOrApiKey={apiKey}
				onClose={() => setIsCreateModalOpen(false)}
				onUploadSuccess={handleCreateNewGalleryItem}
			/>
		</div>
	);
}
