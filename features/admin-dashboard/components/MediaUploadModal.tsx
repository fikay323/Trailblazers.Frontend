'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
	Loader2,
	ZoomIn,
	ZoomOut,
	UploadCloud,
	Crop,
	X,
	Check,
	Maximize2
} from 'lucide-react';
import { getCroppedImg } from '@/core/utils/cropImage';
import { uploadMediaFile } from '@/core/services/siteAssetService';

export type AspectRatioOption = '16:9' | '1:1' | '4:3' | 'free';

export interface MediaUploadModalProps {
	isOpen: boolean;
	title?: string;
	description?: string;
	defaultAspect?: AspectRatioOption;
	lockAspect?: boolean;
	folder?: string;
	tokenOrApiKey?: string;
	onClose: () => void;
	onUploadSuccess: (data: { url: string; publicId: string; fileName: string }) => void;
}

export function MediaUploadModal({
	isOpen,
	title = 'Upload & Crop Picture',
	description = 'Choose a picture, adjust the crop framing, and upload directly to the CDN.',
	defaultAspect = '16:9',
	lockAspect = false,
	folder = 'site-assets',
	tokenOrApiKey,
	onClose,
	onUploadSuccess
}: MediaUploadModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string>('asset.webp');
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState<number>(1);
	const [selectedAspect, setSelectedAspect] = useState<AspectRatioOption>(defaultAspect);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getNumericAspect = (opt: AspectRatioOption): number | undefined => {
		switch (opt) {
			case '16:9':
				return 16 / 9;
			case '1:1':
				return 1;
			case '4:3':
				return 4 / 3;
			case 'free':
			default:
				return undefined;
		}
	};

	const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
		setCroppedAreaPixels(currentCroppedAreaPixels);
	}, []);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.size > 12 * 1024 * 1024) {
				setError('File exceeds 12MB limit. Please select a smaller image.');
				return;
			}
			setFileName(file.name.replace(/\.[^/.]+$/, '') + '.webp');
			setError(null);
			const reader = new FileReader();
			reader.onload = () => {
				setImageSrc(reader.result as string);
				setCrop({ x: 0, y: 0 });
				setZoom(1);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpload = async () => {
		if (!imageSrc || !croppedAreaPixels) return;

		try {
			setIsUploading(true);
			setError(null);

			const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
			const uploadResult = await uploadMediaFile(croppedBlob, fileName, folder, tokenOrApiKey);

			onUploadSuccess({
				url: uploadResult.url,
				publicId: uploadResult.publicId,
				fileName: uploadResult.fileName
			});

			handleClose();
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
			setError(message);
		} finally {
			setIsUploading(false);
		}
	};

	const handleClose = () => {
		if (isUploading) return;
		setImageSrc(null);
		setError(null);
		setCrop({ x: 0, y: 0 });
		setZoom(1);
		if (fileInputRef.current) fileInputRef.current.value = '';
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent
				showCloseButton={!isUploading}
				className="sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden bg-slate-950 border-slate-800 text-slate-100 p-6"
			>
				<DialogHeader className="shrink-0">
					<DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
						<UploadCloud className="h-5 w-5 text-orange-500" />
						{title}
					</DialogTitle>
					<DialogDescription className="text-slate-400 text-sm">
						{description}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto space-y-4 py-2 min-h-0 custom-scrollbar pr-1">
					{error && (
						<div className="p-3 bg-red-950/80 border border-red-800/80 rounded-md text-red-200 text-sm">
							{error}
						</div>
					)}

					{!imageSrc ? (
						<div
							onClick={() => fileInputRef.current?.click()}
							className="border-2 border-dashed border-slate-800 hover:border-orange-500/60 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 text-center group"
						>
							<div className="h-14 w-14 rounded-full bg-orange-600/10 group-hover:bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 transition-colors">
								<UploadCloud className="h-7 w-7" />
							</div>
							<p className="text-white font-medium text-base mb-1">
								Click to browse or drop an image here
							</p>
							<p className="text-slate-400 text-xs max-w-sm">
								Supports PNG, JPEG, WebP, GIF, SVG up to 12MB. You can adjust and crop the frame before upload.
							</p>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
								className="hidden"
								onChange={handleFileSelect}
							/>
						</div>
					) : (
						<div className="space-y-4">
							{/* Cropper Container */}
							<div className="relative w-full h-80 sm:h-96 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
								<Cropper
									image={imageSrc}
									crop={crop}
									zoom={zoom}
									aspect={getNumericAspect(selectedAspect)}
									showGrid={true}
									onCropChange={setCrop}
									onCropComplete={onCropComplete}
									onZoomChange={setZoom}
									minZoom={1}
									maxZoom={4}
								/>
							</div>

							{/* Aspect Ratio Selector & Zoom Controls */}
							<div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 rounded-lg border border-slate-800">
								{!lockAspect && (
									<div className="flex items-center gap-1.5">
										<span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
											<Crop className="h-3.5 w-3.5 text-slate-500" />
											Aspect:
										</span>
										{(['16:9', '1:1', '4:3', 'free'] as AspectRatioOption[]).map((opt) => (
											<button
												key={opt}
												type="button"
												onClick={() => setSelectedAspect(opt)}
												className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
													selectedAspect === opt
														? 'bg-orange-600 text-white border-orange-500'
														: 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
												}`}
											>
												{opt === 'free' ? 'Freeform' : opt}
											</button>
										))}
									</div>
								)}

								<div className="flex items-center gap-2 min-w-44 ml-auto">
									<ZoomOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
									<Slider
										value={[zoom]}
										min={1}
										max={4}
										step={0.05}
										onValueChange={(val) => setZoom(val[0])}
										className="flex-1"
									/>
									<ZoomIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
								</div>
							</div>

							<div className="flex items-center justify-between text-xs text-slate-400 px-1">
								<span>Target CDN Folder: <code className="text-orange-400 font-mono">trailblazers/{folder}</code></span>
								<button
									type="button"
									onClick={() => setImageSrc(null)}
									className="text-slate-400 hover:text-white underline"
								>
									Choose another picture
								</button>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="mt-4 shrink-0 flex items-center justify-between sm:justify-between border-t border-slate-800/80 pt-4">
					<Button
						type="button"
						variant="ghost"
						onClick={handleClose}
						disabled={isUploading}
						className="text-slate-400 hover:text-white hover:bg-slate-900"
					>
						Cancel
					</Button>

					<Button
						type="button"
						onClick={handleUpload}
						disabled={!imageSrc || isUploading}
						className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-medium"
					>
						{isUploading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Uploading to Cloudinary...
							</>
						) : (
							<>
								<Check className="w-4 h-4" />
								Confirm & Upload
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
