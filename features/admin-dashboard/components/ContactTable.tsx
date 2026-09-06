import * as React from 'react';
import { Mail, Clock, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ContactSubmissionDTO {
	id: string;
	type: number; // 0 for Contact
	name: string;
	email: string;
	createdAt: string;
	metadata: string; // JSON: {"Message": "..."}
}

interface ContactTableProps {
	items: ContactSubmissionDTO[];
	onSelect: (item: ContactSubmissionDTO) => void;
	onDelete?: (item: ContactSubmissionDTO) => void;
}

export function ContactTable({ items, onSelect, onDelete }: ContactTableProps) {
	// Helper to parse message from JSON metadata
	const getMessage = (metadataStr: string): string => {
		try {
			const parsed = JSON.parse(metadataStr);
			return parsed.Message || '';
		} catch {
			return '';
		}
	};

	return (
		<div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/20 backdrop-blur-md">
			<Table>
				<TableHeader className="bg-slate-900/50">
					<TableRow className="border-slate-800 hover:bg-slate-900/50">
						<TableHead className="text-slate-400 font-semibold">Sender</TableHead>
						<TableHead className="text-slate-400 font-semibold">Type</TableHead>
						<TableHead className="text-slate-400 font-semibold hidden md:table-cell">Message Preview</TableHead>
						<TableHead className="text-slate-400 font-semibold">Date</TableHead>
						<TableHead className="text-right text-slate-400 font-semibold">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow
							key={item.id}
							onClick={() => onSelect(item)}
							className="border-slate-800 hover:bg-slate-900/40 cursor-pointer transition-colors"
						>
							<TableCell>
								<div className="font-medium text-white">{item.name}</div>
								<div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
									<Mail className="h-3 w-3 inline text-slate-500" />
									{item.email}
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="outline" className="border-cyan-700/50 bg-cyan-950/20 text-cyan-400">
									Contact Inquiry
								</Badge>
							</TableCell>
							<TableCell className="max-w-md hidden md:table-cell text-slate-300 truncate">
								{getMessage(item.metadata)}
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
							<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
								{onDelete && (
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(item);
										}}
										className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-950/40 cursor-pointer"
										title="Delete inquiry"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
