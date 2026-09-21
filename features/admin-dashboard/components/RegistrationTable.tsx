import * as React from 'react';
import { Mail, Clock, Phone, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
	onDelete?: (item: RegistrationSubmissionDTO) => void;
}

export function RegistrationTable({ items, onSelect, onDelete }: RegistrationTableProps) {
	// Helpers to parse metadata properties
	const getMetadataProperty = (metadataStr: string, prop: string): any => {
		try {
			const parsed = JSON.parse(metadataStr);
			return parsed[prop] ?? '';
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
						<TableHead className="text-slate-400 font-semibold">Account Status</TableHead>
						<TableHead className="text-slate-400 font-semibold">Date of Entry</TableHead>
						<TableHead className="text-right text-slate-400 font-semibold">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => {
						const isAccountCreated =
							getMetadataProperty(item.metadata, 'AccountCreated') === 'true' ||
							getMetadataProperty(item.metadata, 'AccountCreated') === true;

						return (
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
								<TableCell>
									{isAccountCreated ? (
										<Badge variant="outline" className="border-emerald-600/40 bg-emerald-950/30 text-emerald-400 font-medium">
											<CheckCircle2 className="h-3 w-3 mr-1 inline" />
											Enrolled
										</Badge>
									) : (
										<Badge variant="outline" className="border-amber-600/40 bg-amber-950/30 text-amber-400 font-medium">
											Pending
										</Badge>
									)}
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
											title="Delete registration"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
