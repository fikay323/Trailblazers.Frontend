'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DataPaginationProps {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	pageSize: number;
	pageSizeOptions?: number[];
	itemName?: string;
	onPageChange: (newPage: number) => void;
	onPageSizeChange: (newPageSize: number) => void;
	disabled?: boolean;
	className?: string;
}

export function DataPagination({
	currentPage,
	totalPages,
	totalCount,
	pageSize,
	pageSizeOptions = [10, 20, 50, 100],
	itemName = 'items',
	onPageChange,
	onPageSizeChange,
	disabled = false,
	className = ''
}: DataPaginationProps) {
	const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, totalCount);
	const effectiveTotalPages = Math.max(1, totalPages);

	return (
		<div className={`w-full pt-4 border-t border-slate-800/80 ${className}`}>
			{/* Mobile Layout (< sm) */}
			<div className="flex flex-col gap-3 sm:hidden">
				{/* Top Tier: Item count & Rows per page */}
				<div className="flex items-center justify-between text-xs text-slate-400 px-1">
					<div>
						Showing <span className="font-semibold text-white">{startItem}–{endItem}</span> of{' '}
						<span className="font-semibold text-white">{totalCount}</span> {itemName}
					</div>

					<div className="flex items-center gap-1.5">
						<span className="text-[11px] text-slate-400">Rows:</span>
						<select
							value={pageSize}
							disabled={disabled}
							onChange={(e) => onPageSizeChange(Number(e.target.value))}
							aria-label="Select rows per page"
							className="h-7 rounded border border-slate-800 bg-slate-900 px-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
						>
							{pageSizeOptions.map((opt) => (
								<option key={opt} value={opt} className="bg-slate-950 text-white">
									{opt}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Bottom Tier: Previous, Page Info, Next (Full Width) */}
				<div className="flex items-center justify-between gap-2 px-1">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						disabled={disabled || currentPage <= 1}
						className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs h-8 px-3 cursor-pointer flex items-center gap-1"
					>
						<ChevronLeft className="h-3.5 w-3.5" />
						Previous
					</Button>

					<span className="text-xs font-medium text-slate-400">
						Page <strong className="text-white font-semibold">{currentPage}</strong> of{' '}
						<strong className="text-white font-semibold">{effectiveTotalPages}</strong>
					</span>

					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(Math.min(effectiveTotalPages, currentPage + 1))}
						disabled={disabled || currentPage >= effectiveTotalPages || totalCount === 0}
						className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs h-8 px-3 cursor-pointer flex items-center gap-1"
					>
						Next
						<ChevronRight className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			{/* Desktop Layout (>= sm) */}
			<div className="hidden sm:flex sm:items-center sm:justify-between px-2 text-xs">
				{/* Left: Rows Per Page & Item Count */}
				<div className="flex items-center gap-4 text-slate-400">
					<div className="flex items-center gap-2">
						<span>Rows per page:</span>
						<select
							value={pageSize}
							disabled={disabled}
							onChange={(e) => onPageSizeChange(Number(e.target.value))}
							aria-label="Select rows per page"
							className="h-8 rounded-md border border-slate-800 bg-slate-900 px-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
						>
							{pageSizeOptions.map((opt) => (
								<option key={opt} value={opt} className="bg-slate-950 text-white">
									{opt}
								</option>
							))}
						</select>
					</div>

					<span className="text-slate-600">•</span>

					<div>
						Showing <span className="font-semibold text-white">{startItem}</span> to{' '}
						<span className="font-semibold text-white">{endItem}</span> of{' '}
						<span className="font-semibold text-white">{totalCount}</span> {itemName}
					</div>
				</div>

				{/* Right: Page Indicator & Action Buttons */}
				<div className="flex items-center gap-3">
					<span className="text-slate-400">
						Page <strong className="text-white font-semibold">{currentPage}</strong> of{' '}
						<strong className="text-white font-semibold">{effectiveTotalPages}</strong>
					</span>

					<div className="flex items-center gap-1.5">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(Math.max(1, currentPage - 1))}
							disabled={disabled || currentPage <= 1}
							className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs h-8 px-2.5 cursor-pointer flex items-center gap-1"
						>
							<ChevronLeft className="h-3.5 w-3.5" />
							Previous
						</Button>

						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(Math.min(effectiveTotalPages, currentPage + 1))}
							disabled={disabled || currentPage >= effectiveTotalPages || totalCount === 0}
							className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs h-8 px-2.5 cursor-pointer flex items-center gap-1"
						>
							Next
							<ChevronRight className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
