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
			<Card className="border-gray-200 bg-gray-50 text-gray-500 p-8 text-center">
				<p>No active question loaded.</p>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Subject / Progress Indicator */}
			<div className="flex items-center justify-between border-b border-gray-200 pb-4">
				<div>
					<span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Subject</span>
					<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-primary" />
						{question.subject}
					</h2>
				</div>
				<div className="text-right">
					<span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Question</span>
					<p className="text-lg font-bold text-gray-900">#{questionNumber}</p>
				</div>
			</div>

			{/* Comprehension Passage Section if exists */}
			{question.comprehensionPassage && (
				<Card className="border-gray-200 bg-gray-50 shadow-inner overflow-hidden">
					<CardHeader className="bg-gray-100 py-2.5 px-4 border-b border-gray-200">
						<CardTitle className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
							Comprehension Passage
						</CardTitle>
					</CardHeader>
					<CardContent dangerouslySetInnerHTML={{ __html: question.comprehensionPassage }} className="p-4 max-h-55 overflow-y-auto text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line">
					</CardContent>
				</Card>
			)}

			{/* Main Question Card */}
			<Card className="border-gray-200 bg-white shadow-lg">
				<CardContent className="p-6 space-y-6">
					{/* Question Text */}
					<div dangerouslySetInnerHTML={{ __html: question.questionText }} className="text-md sm:text-lg text-gray-900 font-semibold leading-relaxed whitespace-pre-line">
					</div>

					{/* Question Image if exists */}
					{question.imageUrl && (
						<div className="flex justify-center max-w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={question.imageUrl}
								alt={`Question illustration`}
								className="max-h-75 w-auto object-contain rounded-md"
							/>
						</div>
					)}

					{/* Option Selection Grid */}
					<div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-100">
						{Object.entries(question.options).map(([key, value]) => {
							const isSelected = selectedOption === key;
							return (
								<button
									key={key}
									type="button"
									onClick={() => onSelectOption(key)}
									className={`flex items-start gap-4 p-4 text-left rounded-xl border transition-all duration-200 group cursor-pointer ${isSelected
										? 'border-primary bg-primary/5 text-gray-900 shadow-sm'
										: 'border-gray-250 bg-gray-50/50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
										}`}
								>
									{/* Option Character Indicator */}
									<span
										className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-200 ${isSelected
											? 'bg-primary text-primary-foreground'
											: 'bg-gray-200 text-gray-600 group-hover:bg-gray-300 group-hover:text-gray-800'
											}`}
									>
										{key}
									</span>

									{/* Option Value */}
									<span className="flex-1 text-sm sm:text-md pt-0.5 leading-snug font-medium">{value}</span>

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
