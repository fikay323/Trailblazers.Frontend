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
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';
			const response = await fetch(`${apiUrl}/api/exams/results/${sessionId}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to load results: ${response.statusText}`);
			}

			const payload: ExamResultsPayload = await response.json();
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
			<div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
				<div className="max-w-4xl mx-auto space-y-6">
					<Skeleton className="h-40 w-full bg-slate-900" />
					<Skeleton className="h-12 w-full bg-slate-900" />
					<Skeleton className="h-64 w-full bg-slate-900" />
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
				<Card className="max-w-md border-red-900/30 bg-red-950/10 text-center text-slate-200">
					<CardHeader>
						<AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
						<CardTitle>Error Loading Results</CardTitle>
						<CardDescription className="text-slate-400">
							{error || 'Unable to fetch the exam submission data.'}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button onClick={fetchResults} variant="outline" className="border-slate-800 text-white">
							Retry
						</Button>
						<Button onClick={() => window.location.href = '/'} variant="link" className="block w-full text-slate-400">
							Back to Home
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
		<div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

				{/* Navigation & Header */}
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						onClick={() => window.location.href = '/'}
						className="text-slate-400 hover:text-white border border-slate-800 bg-slate-900/30 cursor-pointer"
						size="sm"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Button>
				</div>

				{/* Overall Score Card */}
				<Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden relative">
					<div className="absolute top-0 right-0 p-8 opacity-5">
						<Award className="h-40 w-40 text-primary" />
					</div>
					<CardContent className="p-8">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
							<div className="space-y-3">
								<Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
									Exam Session Completed
								</Badge>
								<h1 className="text-3xl font-extrabold text-white tracking-tight">Performance Summary</h1>
								<div className="flex flex-wrap gap-4 text-sm text-slate-400 pt-1">
									<span className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										{new Date(data.completedAt).toLocaleDateString()}
									</span>
									<span className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										{new Date(data.completedAt).toLocaleTimeString()}
									</span>
									<span className="text-slate-300 font-semibold">{data.studentEmail}</span>
								</div>
							</div>
							<div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 shadow-inner">
								<div className="text-center">
									<div className="text-4xl font-extrabold text-primary">{data.overallScore}</div>
									<div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Score</div>
								</div>
								<div className="h-10 w-px bg-slate-800" />
								<div className="text-center">
									<div className="text-4xl font-extrabold text-white">
										{Math.round((data.overallScore / data.totalQuestions) * 100)}%
									</div>
									<div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Percent</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Subject-by-Subject breakdown grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{data.subjectPerformance.map((perf) => (
						<Card key={perf.subject} className="border-slate-800 bg-slate-900/20">
							<CardContent className="p-4 text-center space-y-1">
								<div className="text-xs text-slate-400 font-medium truncate">{perf.subject}</div>
								<div className="text-xl font-bold text-white">
									{perf.score} <span className="text-xs text-slate-500">/ {perf.totalQuestions}</span>
								</div>
								<div className="text-xs text-primary font-semibold">
									{Math.round((perf.score / perf.totalQuestions) * 100)}%
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Subject Score Navigation Tabs */}
				<div className="flex border-b border-slate-800 gap-6 overflow-x-auto pb-1">
					{data.subjectPerformance.map((perf) => (
						<button
							key={perf.subject}
							onClick={() => setActiveSubject(perf.subject)}
							className={`pb-4 text-sm font-semibold transition-all border-b-2 outline-none whitespace-nowrap cursor-pointer ${activeSubject.toLowerCase() === perf.subject.toLowerCase()
								? 'border-primary text-primary'
								: 'border-transparent text-slate-400 hover:text-slate-200'
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

						let cardStyles = 'border-slate-800 bg-slate-900/10';
						if (isCorrect) cardStyles = 'border-green-900/30 bg-green-950/5';
						else if (!isUnattempted) cardStyles = 'border-red-900/30 bg-red-950/5';

						return (
							<Card key={q.id} className={`transition-all border shadow-sm ${cardStyles}`}>
								<CardContent className="p-6 space-y-4">

									{/* Passage display if available */}
									{q.comprehensionPassage && (
										<div className="mb-4 bg-slate-950/40 border border-slate-800/80 rounded-md p-4 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
											<div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Comprehension Passage</div>
											{q.comprehensionPassage}
										</div>
									)}

									{/* Header info */}
									<div className="flex items-start justify-between gap-4">
										<div className="text-sm font-semibold text-slate-200">
											Question {idx + 1}
										</div>
										<div>
											{isCorrect ? (
												<Badge variant="outline" className="border-green-700/40 bg-green-950/30 text-green-400 flex items-center gap-1">
													<Check className="h-3 w-3" /> Correct
												</Badge>
											) : isUnattempted ? (
												<Badge variant="outline" className="border-slate-700 bg-slate-800/20 text-slate-400">
													Unattempted
												</Badge>
											) : (
												<Badge variant="outline" className="border-red-700/40 bg-red-950/30 text-red-400 flex items-center gap-1">
													<X className="h-3 w-3" /> Incorrect
												</Badge>
											)}
										</div>
									</div>

									{/* Question Text */}
									<p className="text-slate-200 text-md leading-relaxed font-medium">{q.questionText}</p>

									{/* Comparative Options View */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
										{Object.entries(q.options).map(([optionChar, optionText]) => {
											const charUpper = optionChar.toUpperCase();
											const selectedUpper = q.selectedOption?.toUpperCase();
											const correctUpper = q.correctOption.toUpperCase();

											const isThisSelected = selectedUpper === charUpper;
											const isThisCorrect = correctUpper === charUpper;

											let btnStyle = 'border-slate-800 bg-slate-950/40 text-slate-300';

											if (isThisCorrect) {
												btnStyle = 'border-green-700 bg-green-950/30 text-green-400 font-semibold';
											} else if (isThisSelected) {
												btnStyle = 'border-red-700 bg-red-950/30 text-red-400 font-semibold';
											}

											return (
												<div
													key={optionChar}
													className={`flex items-center gap-3 border rounded-lg p-3 text-sm transition-all ${btnStyle}`}
												>
													<div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${isThisCorrect
														? 'border-green-500 bg-green-500/10 text-green-400'
														: isThisSelected
															? 'border-red-500 bg-red-500/10 text-red-400'
															: 'border-slate-700 text-slate-400'
														}`}>
														{charUpper}
													</div>
													<span className="flex-1 leading-snug">{optionText}</span>
													{isThisCorrect && <Check className="h-4 w-4 shrink-0 text-green-500" />}
													{!isThisCorrect && isThisSelected && <X className="h-4 w-4 shrink-0 text-red-500" />}
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
