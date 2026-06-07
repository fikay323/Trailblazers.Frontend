'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, AlertCircle, Award, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ReviewQuestionDTO {
	id: string;
	subject: string;
	questionText: string;
	options: Record<string, string>;
	selectedOption: string | null; // Selected option char (e.g. 'A', 'B')
	correctOption: string;       // Correct option char
	comprehensionPassage?: string | null;
}

interface SubjectPerformanceDTO {
	subject: string;
	score: number;
	totalQuestions: number;
}

interface ExamResultsPayload {
	sessionId: string;
	studentEmail: string;
	targetYear: number;
	overallScore: number;
	totalQuestions: number;
	completedAt: string;
	subjectPerformance: SubjectPerformanceDTO[];
	reviewQuestions: ReviewQuestionDTO[];
}

import { getExamResults } from '@/core/services/examService';

export default function ExamResultsPage() {
	const params = useParams();
	const sessionId = params.sessionId as string;

	const [data, setData] = useState<ExamResultsPayload | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeSubject, setActiveSubject] = useState<string>('');

	const fetchResults = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const payload: ExamResultsPayload = await getExamResults(sessionId);
			setData(payload);

			// Set first subject as active by default
			if (payload.subjectPerformance && payload.subjectPerformance.length > 0) {
				setActiveSubject(payload.subjectPerformance[0].subject);
			}
		} catch (err: any) {
			setError(err.message || 'An error occurred.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (sessionId) {
			fetchResults();
		}
	}, [sessionId]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4">
				<div className="max-w-4xl mx-auto space-y-6">
					<Skeleton className="h-40 w-full bg-gray-200" />
					<Skeleton className="h-12 w-full bg-gray-200" />
					<Skeleton className="h-64 w-full bg-gray-200" />
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
				<Card className="max-w-xl w-xl py-14 border-red-200 bg-red-50 text-center text-red-900">
					<CardHeader>
						<AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
						<CardTitle>Error Loading Results</CardTitle>
						<CardDescription className="text-red-700">
							{error || 'Unable to fetch the exam submission data.'}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button onClick={fetchResults} variant="outline" className="border-gray-300 bg-white text-gray-750 cursor-pointer">
							Retry
						</Button>
						<Button onClick={() => window.location.href = '/exam'} variant="link" className="block w-full text-gray-500 cursor-pointer">
							Back to Exam Entry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Filter questions for the active subject tab
	const filteredQuestions = data.reviewQuestions.filter(
		(q) => q.subject.toLowerCase() === activeSubject.toLowerCase()
	);

	return (
		<div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

				{/* Navigation & Header */}
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						onClick={() => window.location.href = '/exam'}
						className="text-gray-650 hover:text-gray-900 border border-gray-300 bg-white cursor-pointer"
						size="sm"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Exam Gate
					</Button>
				</div>

				{/* Overall Score Card */}
				<Card className="border-gray-200 bg-white shadow-lg overflow-hidden relative">
					<div className="absolute top-0 right-0 p-8 opacity-5">
						<Award className="h-40 w-40 text-primary" />
					</div>
					<CardContent className="p-8">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
							<div className="space-y-3">
								<Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-bold">
									Exam Session Completed
								</Badge>
								<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Performance Summary</h1>
								<div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-1">
									<span className="flex items-center gap-1">
										<Calendar className="h-4 w-4 text-gray-400" />
										{new Date(data.completedAt).toLocaleDateString()}
									</span>
									<span className="flex items-center gap-1">
										<Clock className="h-4 w-4 text-gray-400" />
										{new Date(data.completedAt).toLocaleTimeString()}
									</span>
									<span className="text-gray-700 font-semibold">{data.studentEmail}</span>
								</div>
							</div>
							<div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-inner">
								<div className="text-center">
									<div className="text-4xl font-black text-primary">{data.overallScore}</div>
									<div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Score</div>
								</div>
								<div className="h-10 w-px bg-gray-200" />
								<div className="text-center">
									<div className="text-4xl font-black text-gray-900">
										{data.totalQuestions > 0 ? Math.round((data.overallScore / data.totalQuestions) * 100) : 0}%
									</div>
									<div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Percent</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Subject-by-Subject breakdown grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{data.subjectPerformance.map((perf) => (
						<Card key={perf.subject} className="border-gray-200 bg-white shadow-sm">
							<CardContent className="p-4 text-center space-y-1">
								<div className="text-xs text-gray-500 font-bold truncate uppercase tracking-wider">{perf.subject}</div>
								<div className="text-xl font-bold text-gray-900">
									{perf.score} <span className="text-xs text-gray-400">/ {perf.totalQuestions}</span>
								</div>
								<div className="text-xs text-primary font-bold">
									{perf.totalQuestions > 0 ? Math.round((perf.score / perf.totalQuestions) * 100) : 0}%
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Subject Score Navigation Tabs */}
				<div className="flex border-b border-gray-200 gap-6 overflow-x-auto pb-1">
					{data.subjectPerformance.map((perf) => (
						<button
							key={perf.subject}
							onClick={() => setActiveSubject(perf.subject)}
							className={`pb-4 text-sm font-bold transition-all border-b-2 outline-none whitespace-nowrap cursor-pointer ${activeSubject.toLowerCase() === perf.subject.toLowerCase()
								? 'border-primary text-primary'
								: 'border-transparent text-gray-500 hover:text-gray-800'
								}`}
						>
							{perf.subject}
						</button>
					))}
				</div>

				{/* Comparative Question Cards List */}
				<div className="space-y-6">
					{filteredQuestions.map((q, idx) => {
						const isCorrect = q.selectedOption?.toUpperCase() === q.correctOption.toUpperCase();
						const isUnattempted = !q.selectedOption;

						let cardStyles = 'border-gray-200 bg-white';
						if (isCorrect) cardStyles = 'border-green-200 bg-green-50/30';
						else if (!isUnattempted) cardStyles = 'border-red-200 bg-red-50/30';

						return (
							<Card key={q.id} className={`transition-all border shadow-sm ${cardStyles}`}>
								<CardContent className="p-6 space-y-4">

									{/* Passage display if available */}
									{q.comprehensionPassage && (
										<div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-4 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
											<div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Comprehension Passage</div>
											<span dangerouslySetInnerHTML={{ __html: q.comprehensionPassage }}></span>
										</div>
									)}

									{/* Header info */}
									<div className="flex items-start justify-between gap-4">
										<div className="text-sm font-bold text-gray-700">
											Question {idx + 1}
										</div>
										<div>
											{isCorrect ? (
												<Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 font-semibold flex items-center gap-1">
													<Check className="h-3 w-3" /> Correct
												</Badge>
											) : isUnattempted ? (
												<Badge variant="outline" className="border-gray-300 bg-gray-100 text-gray-600 font-semibold">
													Unattempted
												</Badge>
											) : (
												<Badge variant="outline" className="border-red-300 bg-red-50 text-red-700 font-semibold flex items-center gap-1">
													<X className="h-3 w-3" /> Incorrect
												</Badge>
											)}
										</div>
									</div>

									{/* Question Text */}
									<p dangerouslySetInnerHTML={{ __html: q.questionText }} className="text-gray-900 text-md leading-relaxed font-bold"></p>

									{/* Comparative Options View */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
										{Object.entries(q.options).map(([optionChar, optionText]) => {
											const charUpper = optionChar.toUpperCase();
											const selectedUpper = q.selectedOption?.toUpperCase();
											const correctUpper = q.correctOption.toUpperCase();

											const isThisSelected = selectedUpper === charUpper;
											const isThisCorrect = correctUpper === charUpper;

											let btnStyle = 'border-gray-200 bg-gray-50/50 text-gray-700';

											if (isThisCorrect) {
												btnStyle = 'border-green-500 bg-green-50 text-green-700 font-bold';
											} else if (isThisSelected) {
												btnStyle = 'border-red-500 bg-red-50 text-red-700 font-bold';
											}

											return (
												<div
													key={optionChar}
													className={`flex items-center gap-3 border rounded-lg p-3 text-sm transition-all ${btnStyle}`}
												>
													<div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${isThisCorrect
														? 'border-green-600 bg-green-600 text-white'
														: isThisSelected
															? 'border-red-600 bg-red-600 text-white'
															: 'border-gray-300 text-gray-500 bg-white'
														}`}>
														{charUpper}
													</div>
													<span className="flex-1 leading-snug font-medium">{optionText}</span>
													{isThisCorrect && <Check className="h-4 w-4 shrink-0 text-green-600" />}
													{!isThisCorrect && isThisSelected && <X className="h-4 w-4 shrink-0 text-red-600" />}
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

			</div>
		</div>
	);
}
