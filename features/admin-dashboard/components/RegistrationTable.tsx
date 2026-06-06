'use client';

import * as React from 'react';
import { Mail, Clock, Phone, BookOpen } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface RegistrationSubmissionDTO {
	id: string;
	type: number; // 1 for Registration
	name: string;
	email: string;
	createdAt: string;
	metadata: string; // JSON: {"PhoneNumber": "...", "TargetExam": "..."}
}

interface RegistrationTableProps {
	items: RegistrationSubmissionDTO[];
	onSelect: (item: RegistrationSubmissionDTO) => void;
}

export function RegistrationTable({ items, onSelect }: RegistrationTableProps) {
	// Helpers to parse metadata properties
	const getMetadataProperty = (metadataStr: string, prop: string): string => {
		try {
			const parsed = JSON.parse(metadataStr);
			return parsed[prop] || '';
		} catch {
			return '';
		}
	};

	return (
		<div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/20 backdrop-blur-md">
			<Table>
				<TableHeader className="bg-slate-900/50">
					<TableRow className="border-slate-800 hover:bg-slate-900/50">
						<TableHead className="text-slate-400 font-semibold">Student Name</TableHead>
						<TableHead className="text-slate-400 font-semibold">Email Contact</TableHead>
						<TableHead className="text-slate-400 font-semibold">Registered Phone</TableHead>
						<TableHead className="text-slate-400 font-semibold">Target Exam</TableHead>
						<TableHead className="text-slate-400 font-semibold">Date of Entry</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow
							key={item.id}
							onClick={() => onSelect(item)}
							className="border-slate-800 hover:bg-slate-900/40 cursor-pointer transition-colors"
						>
							<TableCell className="font-semibold text-white">
								{item.name}
							</TableCell>
							<TableCell className="text-slate-300">
								<div className="flex items-center gap-1.5">
									<Mail className="h-3.5 w-3.5 text-slate-500" />
									{item.email}
								</div>
							</TableCell>
							<TableCell className="text-slate-300">
								<div className="flex items-center gap-1.5">
									<Phone className="h-3.5 w-3.5 text-slate-500" />
									{getMetadataProperty(item.metadata, 'PhoneNumber')}
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="outline" className="border-indigo-700/50 bg-indigo-950/20 text-indigo-400">
									<BookOpen className="h-3 w-3 mr-1 inline" />
									{getMetadataProperty(item.metadata, 'TargetExam')}
								</Badge>
							</TableCell>
							<TableCell className="text-slate-400 text-sm whitespace-nowrap">
								<div className="flex items-center gap-1">
									<Clock className="h-3.5 w-3.5 text-slate-500" />
									{new Date(item.createdAt).toLocaleDateString(undefined, {
										month: 'short',
										day: 'numeric',
										year: 'numeric'
									})}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
