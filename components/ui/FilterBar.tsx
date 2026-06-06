'use client';

import * as React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder?: string;
	startDate: string;
	onStartDateChange: (value: string) => void;
	endDate: string;
	onEndDateChange: (value: string) => void;
	showDateRange?: boolean;
	selectValue?: string;
	onSelectChange?: (value: string) => void;
	selectPlaceholder?: string;
	selectOptions?: { label: string; value: string }[];
	onClear: () => void;
	showClear: boolean;
}

export function FilterBar({
	searchTerm,
	onSearchChange,
	searchPlaceholder = 'Search...',
	startDate,
	onStartDateChange,
	endDate,
	onEndDateChange,
	showDateRange = true,
	selectValue,
	onSelectChange,
	selectPlaceholder = 'Select Option',
	selectOptions,
	onClear,
	showClear
}: FilterBarProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{/* Search */}
				<div className="space-y-2">
					<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search</label>
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
						<Input
							placeholder={searchPlaceholder}
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-9 border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500"
						/>
					</div>
				</div>

				{/* Dynamic Select Dropdown */}
				{onSelectChange && selectOptions && (
					<div className="space-y-2">
						<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
							{selectPlaceholder}
						</label>
						<select
							value={selectValue}
							onChange={(e) => onSelectChange(e.target.value)}
							className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-primary"
						>
							<option value="all">All</option>
							{selectOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Start Date */}
				{showDateRange && (
					<div className="space-y-2">
						<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
						<Input
							type="date"
							value={startDate}
							onChange={(e) => onStartDateChange(e.target.value)}
							className="border-slate-800 bg-slate-950 text-slate-100"
						/>
					</div>
				)}

				{/* End Date */}
				{showDateRange && (
					<div className="space-y-2">
						<label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End Date</label>
						<Input
							type="date"
							value={endDate}
							onChange={(e) => onEndDateChange(e.target.value)}
							className="border-slate-800 bg-slate-950 text-slate-100"
						/>
					</div>
				)}
			</div>

			{/* Clear Filters Button */}
			{showClear && (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={onClear}
						size="sm"
						className="text-slate-400 hover:text-white"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Clear Filters
					</Button>
				</div>
			)}
		</div>
	);
}
