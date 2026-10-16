'use client';

import React, { useState, useCallback } from 'react';
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
import { Loader2, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import { getCroppedImg } from '@/core/utils/cropImage';

export interface ProfilePictureCropModalProps {
	isOpen: boolean;
	imageSrc: string | null;
	onClose: () => void;
	onConfirmUpload: (croppedBlob: Blob) => Promise<void>;
}

export function ProfilePictureCropModal({
	isOpen,
	imageSrc,
	onClose,
	onConfirmUpload
}: ProfilePictureCropModalProps) {
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState<number>(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
		setCroppedAreaPixels(currentCroppedAreaPixels);
	}, []);

	const handleUpload = async () => {
		if (!imageSrc || !croppedAreaPixels) return;

		try {
			setIsProcessing(true);
			setError(null);
			const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
			await onConfirmUpload(croppedBlob);
			onClose();
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to crop and upload photo';
			setError(message);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
			<DialogContent
				showCloseButton={!isProcessing}
				className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6"
			>
				<DialogHeader>
					<DialogTitle className="text-xl font-bold tracking-tight text-white">
						Crop Profile Picture
					</DialogTitle>
					<DialogDescription className="text-slate-400 text-sm">
						Drag to center your face and use the slider to adjust the zoom.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="p-3 bg-red-950/80 border border-red-800/80 rounded-md text-red-200 text-sm">
						{error}
					</div>
				)}

				<div className="relative w-full h-72 sm:h-80 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
					{imageSrc && (
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={1}
							cropShape="round"
							showGrid={false}
							onCropChange={setCrop}
							onCropComplete={onCropComplete}
							onZoomChange={setZoom}
							minZoom={1}
							maxZoom={3}
						/>
					)}
				</div>

				<div className="flex items-center gap-3 px-2 py-2 bg-slate-900/60 rounded-lg border border-slate-800">
					<ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
					<Slider
						value={[zoom]}
						min={1}
						max={3}
						step={0.05}
						onValueChange={(values) => {
							if (values[0] !== undefined) {
								setZoom(values[0]);
							}
						}}
						disabled={isProcessing}
						className="flex-1 cursor-pointer"
					/>
					<ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
				</div>

				<DialogFooter className="gap-2 sm:gap-0 mt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isProcessing}
						className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
					>
						<X className="w-4 h-4 mr-2" />
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleUpload}
						disabled={isProcessing || !croppedAreaPixels}
						className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md transition-colors"
					>
						{isProcessing ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Check className="w-4 h-4 mr-2" />
								Confirm & Upload
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
