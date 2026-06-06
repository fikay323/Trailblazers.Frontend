'use client';

import * as React from 'react';
import { QuestionDto } from '@/core/services/examService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, BookOpen } from 'lucide-react';

interface QuestionViewerProps {
	question: QuestionDto | null;
	questionNumber: number;
	selectedOption?: string;
	onSelectOption: (optionChar: string) => void;
}

export function QuestionViewer({
	question,
	questionNumber,
	selectedOption,
	onSelectOption
}: QuestionViewerProps) {
	if (!question) {
		return (
			<Card className="border-slate-800 bg-slate-900/50 text-slate-400 p-8 text-center">
				<p>No active question loaded.</p>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Subject / Progress Indicator */}
			<div className="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Subject</span>
					<h2 className="text-lg font-bold text-white flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-primary" />
						{question.subject}
					</h2>
				</div>
				<div className="text-right">
					<span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question</span>
					<p className="text-lg font-bold text-white">#{questionNumber}</p>
				</div>
			</div>

			{/* Comprehension Passage Section if exists */}
			{question.comprehensionPassage && (
				<Card className="border-slate-800/80 bg-slate-950/60 shadow-inner overflow-hidden">
					<CardHeader className="bg-slate-900/40 py-2.5 px-4 border-b border-slate-800/50">
						<CardTitle className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
							Comprehension Passage
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 max-h-55 overflow-y-auto text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
						{question.comprehensionPassage}
					</CardContent>
				</Card>
			)}

			{/* Main Question Card */}
			<Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-xl">
				<CardContent className="p-6 space-y-6">
					{/* Question Text */}
					<div className="text-md sm:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-line">
						{question.questionText}
					</div>

					{/* Question Image if exists */}
					{question.imageUrl && (
						<div className="flex justify-center max-w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-2">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={question.imageUrl}
								alt={`Question illustration`}
								className="max-h-75 w-auto object-contain rounded-md"
							/>
						</div>
					)}

					{/* Option Selection Grid */}
					<div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-800/50">
						{Object.entries(question.options).map(([key, value]) => {
							const isSelected = selectedOption === key;
							return (
								<button
									key={key}
									type="button"
									onClick={() => onSelectOption(key)}
									className={`flex items-start gap-4 p-4 text-left rounded-xl border transition-all duration-200 group cursor-pointer ${isSelected
											? 'border-primary bg-primary/10 text-white shadow-md shadow-primary/5'
											: 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 text-slate-300 hover:text-slate-100'
										}`}
								>
									{/* Option Character Indicator */}
									<span
										className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-200 ${isSelected
												? 'bg-primary text-primary-foreground'
												: 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
											}`}
									>
										{key}
									</span>

									{/* Option Value */}
									<span className="flex-1 text-sm sm:text-md pt-0.5 leading-snug">{value}</span>

									{/* Selected Icon */}
									{isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 self-center" />}
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
