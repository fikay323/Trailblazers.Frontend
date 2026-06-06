'use client';

import * as React from 'react';
import { useState } from 'react';
import { QuestionDto } from '@/core/services/examService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QuestionNavigationGridProps {
	questions: QuestionDto[];
	currentQuestionIndex: number;
	answers: Record<string, string>;
	onJumpToQuestion: (index: number) => void;
}

export function QuestionNavigationGrid({
	questions,
	currentQuestionIndex,
	answers,
	onJumpToQuestion
}: QuestionNavigationGridProps) {
	// Group questions by subject, keeping track of their absolute indices
	const groupedBySubject = React.useMemo(() => {
		const groups: Record<string, { question: QuestionDto; absoluteIndex: number }[]> = {};
		questions.forEach((q, idx) => {
			if (!groups[q.subject]) {
				groups[q.subject] = [];
			}
			groups[q.subject].push({ question: q, absoluteIndex: idx });
		});
		return groups;
	}, [questions]);

	const subjects = Object.keys(groupedBySubject);
	const [activeSubjectTab, setActiveSubjectTab] = useState<string>(subjects[0] || '');

	// Fallback in case subjects list updates or is empty
	React.useEffect(() => {
		if (subjects.length > 0 && !subjects.includes(activeSubjectTab)) {
			setActiveSubjectTab(subjects[0]);
		}
	}, [subjects, activeSubjectTab]);

	const activeGroup = groupedBySubject[activeSubjectTab] || [];

	// Calculate counts
	const totalAnswered = React.useMemo(() => {
		return questions.filter((q) => !!answers[q.id]).length;
	}, [questions, answers]);

	return (
		<Card className="border-gray-200 bg-white shadow-lg flex flex-col h-full">
			<CardHeader className="border-b border-gray-100 pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">
						Question Navigator
					</CardTitle>
					<span className="text-xs font-semibold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full">
						{totalAnswered} / {questions.length} Solved
					</span>
				</div>

				{/* Subject Tabs */}
				<div className="flex flex-wrap gap-1.5 pt-3">
					{subjects.map((subj) => {
						const isSelected = activeSubjectTab === subj;
						const answeredInSubject = groupedBySubject[subj].filter((item) => !!answers[item.question.id]).length;
						const totalInSubject = groupedBySubject[subj].length;

						return (
							<button
								key={subj}
								type="button"
								onClick={() => setActiveSubjectTab(subj)}
								className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
									isSelected
										? 'bg-primary border-primary text-primary-foreground shadow-sm'
										: 'bg-gray-150 border-gray-250 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
								}`}
							>
								{subj} ({answeredInSubject}/{totalInSubject})
							</button>
						);
					})}
				</div>
			</CardHeader>

			<CardContent className="p-4 flex-1 overflow-y-auto max-h-[380px] sm:max-h-none">
				{/* Key / Legend */}
				<div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold mb-4 justify-center">
					<div className="flex items-center gap-1.5">
						<span className="h-3 w-3 rounded bg-primary border border-primary/20 block"></span>
						<span>Active</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-300 block"></span>
						<span className="text-emerald-700">Answered</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-3 w-3 rounded bg-gray-50 border border-gray-200 block"></span>
						<span>Unanswered</span>
					</div>
				</div>

				{/* Buttons Matrix Grid */}
				<div className="grid grid-cols-5 gap-2 max-h-70 overflow-y-auto pr-1">
					{activeGroup.map(({ question, absoluteIndex }) => {
						const isActive = currentQuestionIndex === absoluteIndex;
						const isAnswered = !!answers[question.id];

						let btnClass = 'border-gray-250 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700';
						if (isActive) {
							btnClass = 'bg-primary border-primary text-primary-foreground font-extrabold shadow-sm';
						} else if (isAnswered) {
							btnClass = 'border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold';
						}

						return (
							<button
								key={question.id}
								type="button"
								onClick={() => onJumpToQuestion(absoluteIndex)}
								className={`h-10 text-xs rounded-lg border transition-all duration-150 flex items-center justify-center cursor-pointer ${btnClass}`}
							>
								{absoluteIndex + 1}
							</button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
