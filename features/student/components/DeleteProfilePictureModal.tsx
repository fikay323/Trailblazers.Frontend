'use client';

import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, X } from 'lucide-react';

export interface DeleteProfilePictureModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirmDelete: () => Promise<void>;
}

export function DeleteProfilePictureModal({
	isOpen,
	onClose,
	onConfirmDelete
}: DeleteProfilePictureModalProps) {
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			setError(null);
			await onConfirmDelete();
			onClose();
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to delete profile picture';
			setError(message);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
			<DialogContent
				showCloseButton={!isDeleting}
				className="sm:max-w-md max-h-[85vh] bg-slate-950 border-slate-800 text-slate-100 p-6"
			>
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-400">
							<Trash2 className="w-5 h-5" />
						</div>
						<div>
							<DialogTitle className="text-xl font-bold tracking-tight text-white">
								Remove Profile Picture
							</DialogTitle>
						</div>
					</div>
					<DialogDescription className="text-slate-400 text-sm mt-2">
						Are you sure you want to remove your profile picture? This will delete the photo from our cloud storage and reset your avatar to your initials.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="p-3 bg-red-950/80 border border-red-800/80 rounded-md text-red-200 text-sm">
						{error}
					</div>
				)}

				<DialogFooter className="gap-2 sm:gap-0 mt-4">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
						className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
					>
						<X className="w-4 h-4 mr-2" />
						Keep Photo
					</Button>
					<Button
						type="button"
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-500 text-white font-medium shadow-md transition-colors"
					>
						{isDeleting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Removing...
							</>
						) : (
							<>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete Photo
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
