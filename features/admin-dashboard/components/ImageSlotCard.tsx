'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Upload,
	RotateCcw,
	Save,
	Loader2,
	ExternalLink,
	CheckCircle2,
	AlertCircle,
	Sparkles
} from 'lucide-react';
import { SiteAsset, UpdateSiteAssetPayload } from '@/types/site-assets';
import { MediaUploadModal, AspectRatioOption } from './MediaUploadModal';

export interface ImageSlotCardProps {
	asset: SiteAsset;
	defaultFallbackUrl: string;
	recommendedAspect?: AspectRatioOption;
	recommendedDimensions?: string;
	onSave: (key: string, payload: UpdateSiteAssetPayload) => Promise<void>;
	onResetToDefault?: (key: string) => Promise<void>;
	tokenOrApiKey?: string;
}

export function ImageSlotCard({
	asset,
	defaultFallbackUrl,
	recommendedAspect = '16:9',
	recommendedDimensions = '1200 × 630 px',
	onSave,
	onResetToDefault,
	tokenOrApiKey
}: ImageSlotCardProps) {
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState<string>(asset.imageUrl || defaultFallbackUrl);
	const [publicId, setPublicId] = useState<string | null>(asset.publicId || null);
	const [altText, setAltText] = useState<string>(asset.altText || '');
	const [title, setTitle] = useState<string>(asset.title || '');
	const [caption, setCaption] = useState<string>(asset.caption || '');
	const [isSaving, setIsSaving] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const isCustomImage = imageUrl !== defaultFallbackUrl;
	const isCloudinary = imageUrl.includes('cloudinary.com');

	const handleUploadSuccess = (data: { url: string; publicId: string }) => {
		setImageUrl(data.url);
		setPublicId(data.publicId);
		setStatusMessage({
			type: 'success',
			text: 'New picture uploaded! Click "Save Changes" to apply.'
		});
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			setStatusMessage(null);
			await onSave(asset.key, {
				group: asset.group,
				imageUrl,
				publicId,
				altText: altText.trim(),
				title: title.trim(),
				caption: caption.trim(),
				metadataJson: asset.metadataJson,
				sortOrder: asset.sortOrder
			});
			setStatusMessage({
				type: 'success',
				text: 'Changes saved successfully!'
			});
			setTimeout(() => setStatusMessage(null), 3000);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to save changes';
			setStatusMessage({ type: 'error', text: msg });
		} finally {
			setIsSaving(false);
		}
	};

	const handleReset = async () => {
		if (!onResetToDefault) {
			setImageUrl(defaultFallbackUrl);
			setPublicId(null);
			return;
		}

		try {
			setIsSaving(true);
			await onResetToDefault(asset.key);
			setImageUrl(defaultFallbackUrl);
			setPublicId(null);
			setStatusMessage({
				type: 'success',
				text: 'Reset to default picture.'
			});
			setTimeout(() => setStatusMessage(null), 3000);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to reset';
			setStatusMessage({ type: 'error', text: msg });
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
			<div className="space-y-4">
				{/* Header & Badges */}
				<div className="flex items-start justify-between gap-3">
					<div>
						<h4 className="font-semibold text-white text-base tracking-tight flex items-center gap-2">
							{asset.title || asset.key}
						</h4>
						<div className="flex items-center gap-2 mt-1">
							<span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
								{asset.key}
							</span>
							<span className="text-[11px] text-orange-400/90 font-medium bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded">
								{recommendedDimensions}
							</span>
						</div>
					</div>

					{isCustomImage ? (
						<span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full">
							<CheckCircle2 className="w-3 h-3" />
							Custom CDN
						</span>
					) : (
						<span className="text-[11px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
							Default Static
						</span>
					)}
				</div>

				{/* Image Preview Container */}
				<div className="relative group w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={imageUrl}
						alt={altText || 'Preview'}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
						<a
							href={imageUrl}
							target="_blank"
							rel="noreferrer"
							className="text-xs text-white/90 hover:text-white flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs"
						>
							<ExternalLink className="w-3 h-3" />
							View Full Image
						</a>
						<button
							type="button"
							onClick={() => setIsUploadModalOpen(true)}
							className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs font-medium"
						>
							<Upload className="w-3 h-3" />
							Replace
						</button>
					</div>
				</div>

				{/* Form Inputs: Alt Text, Title, Caption */}
				<div className="space-y-3">
					<div>
						<label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
							<span>SEO Alt Text</span>
							<span className="text-[10px] text-slate-500 font-normal">Helps Google ranking & accessibility</span>
						</label>
						<Input
							value={altText}
							onChange={(e) => setAltText(e.target.value)}
							placeholder="Descriptive text for search engines and screen readers"
							className="bg-slate-950 border-slate-800 text-white text-xs h-9"
						/>
					</div>

					{asset.group === 'home' && (
						<>
							<div>
								<label className="text-xs font-semibold text-slate-300 block mb-1">
									Slide Headline Label
								</label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="e.g. JAMB/CBT Prep"
									className="bg-slate-950 border-slate-800 text-white text-xs h-9"
								/>
							</div>
							<div>
								<label className="text-xs font-semibold text-slate-300 block mb-1">
									Slide Description
								</label>
								<Input
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
									placeholder="e.g. Complete JAMB CBT training with professional guidance."
									className="bg-slate-950 border-slate-800 text-white text-xs h-9"
								/>
							</div>
						</>
					)}
				</div>

				{/* Feedback status */}
				{statusMessage && (
					<div
						className={`text-xs p-2 rounded flex items-center gap-1.5 ${
							statusMessage.type === 'success'
								? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
								: 'bg-red-950/60 text-red-300 border border-red-800/60'
						}`}
					>
						{statusMessage.type === 'success' ? (
							<CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
						) : (
							<AlertCircle className="w-3.5 h-3.5 shrink-0" />
						)}
						<span>{statusMessage.text}</span>
					</div>
				)}
			</div>

			{/* Actions Footer */}
			<div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-4 mt-4">
				<div>
					{isCustomImage && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleReset}
							disabled={isSaving}
							className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2 gap-1"
						>
							<RotateCcw className="w-3 h-3" />
							Reset Default
						</Button>
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setIsUploadModalOpen(true)}
						disabled={isSaving}
						className="text-xs border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 h-8 gap-1.5"
					>
						<Upload className="w-3 h-3 text-orange-400" />
						Upload New
					</Button>

					<Button
						type="button"
						size="sm"
						onClick={handleSave}
						disabled={isSaving}
						className="text-xs bg-orange-600 hover:bg-orange-700 text-white h-8 gap-1.5 font-medium"
					>
						{isSaving ? (
							<>
								<Loader2 className="w-3 h-3 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="w-3 h-3" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Upload Modal Instance */}
			<MediaUploadModal
				isOpen={isUploadModalOpen}
				title={`Upload: ${asset.title || asset.key}`}
				defaultAspect={recommendedAspect}
				folder={asset.group === 'team' ? 'team' : asset.group === 'gallery' ? 'gallery' : 'site-assets'}
				tokenOrApiKey={tokenOrApiKey}
				onClose={() => setIsUploadModalOpen(false)}
				onUploadSuccess={handleUploadSuccess}
			/>
		</div>
	);
}
