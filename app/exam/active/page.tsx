'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useExamEngine } from '@/features/exam/hooks/useExamEngine';
import { ExamTimer } from '@/features/exam/components/ExamTimer';
import { QuestionViewer } from '@/features/exam/components/QuestionViewer';
import { QuestionNavigationGrid } from '@/features/exam/components/QuestionNavigationGrid';
import { QuestionDto } from '@/core/services/examService';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, Loader2, AlertCircle } from 'lucide-react';

function ActiveExamWorkspace() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [sessionData, setSessionData] = useState<{
		sessionId: string;
		endTime: string;
		questions: QuestionDto[];
	} | null>(null);

	// Extract active sessionId from the URL parameters
	const urlSessionId = searchParams.get('session') || searchParams.get('sessionId');

	useEffect(() => {
		// Attempt to load from localStorage
		const cachedSessionId = localStorage.getItem('exam_session_id');
		const cachedEndTime = localStorage.getItem('exam_end_time');
		const cachedQuestionsStr = localStorage.getItem('exam_questions');

		const activeSessionId = urlSessionId || cachedSessionId;

		if (!activeSessionId || !cachedEndTime || !cachedQuestionsStr) {
			setLoading(false);
			return;
		}

		try {
			const parsedQuestions = JSON.parse(cachedQuestionsStr) as QuestionDto[];
			setSessionData({
				sessionId: activeSessionId,
				endTime: cachedEndTime,
				questions: parsedQuestions
			});
		} catch (e) {
			console.error('Error parsing cached questions:', e);
		} finally {
			setLoading(false);
		}
	}, [urlSessionId]);

	// Wire engine if session data exists
	const engine = useExamEngine({
		sessionId: sessionData?.sessionId || '',
		initialQuestions: sessionData?.questions || [],
		endTime: sessionData?.endTime || ''
	});

	const handleTimeUp = async () => {
		try {
			await engine.submitAssessment();
		} catch (err) {
			console.error('Auto-submit on time up failed:', err);
		}
	};

	const handleSubmitClick = async () => {
		const answeredCount = Object.keys(engine.answers).length;
		const totalCount = engine.totalQuestions;
		const confirmMsg = `Are you sure you want to submit your exam?\nYou have answered ${answeredCount} out of ${totalCount} questions.\nYou cannot change your answers after submission.`;

		if (window.confirm(confirmMsg)) {
			try {
				await engine.submitAssessment();
			} catch (err) {
				// Error state is captured inside engine
			}
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center gap-3">
				<Loader2 className="h-8 w-8 text-primary animate-spin" />
				<p className="text-gray-500 text-sm font-medium">Loading testing workspace...</p>
			</div>
		);
	}

	if (!sessionData || sessionData.questions.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center p-4">
				<div className="max-w-md w-full text-center space-y-6 bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
						<AlertCircle className="h-6 w-6" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-bold text-gray-900">No Active Session Found</h2>
						<p className="text-gray-500 text-sm leading-relaxed">
							It seems you don&apos;t have an active examination session or your previous session has expired.
						</p>
					</div>
					<Button
						onClick={() => router.push('/exam')}
						className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold"
					>
						Return to Entry Gate
					</Button>
				</div>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50 text-gray-800 flex flex-col relative overflow-hidden">
			{/* Ambient glow decoration */}
			<div className="absolute top-[-20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

			{/* Header Bar */}
			<header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="h-7 w-7 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">
							T
						</span>
						<div>
							<h1 className="text-sm font-black tracking-wider text-gray-900 uppercase">Trailblazers</h1>
							<p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">CBT Exam Arena</p>
						</div>
					</div>

					{/* Isolated ExamTimer */}
					<ExamTimer endTime={sessionData.endTime} onTimeUp={handleTimeUp} />
				</div>
			</header>

			{/* Grid Dashboard Layout */}
			<div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
				{/* Main Arena (Left Column) */}
				<section className="lg:col-span-2 space-y-6">
					{engine.error && (
						<div className="p-4 rounded-xl bg-red-50 border border-red-150 text-red-600 text-sm flex items-center gap-2">
							<AlertCircle className="h-5 w-5 shrink-0" />
							<span>{engine.error}</span>
						</div>
					)}

					{/* Question Viewer */}
					<QuestionViewer
						question={engine.currentQuestion}
						questionNumber={engine.currentQuestionIndex + 1}
						selectedOption={engine.currentQuestion ? engine.answers[engine.currentQuestion.id] : undefined}
						onSelectOption={(optionChar) => {
							if (engine.currentQuestion) {
								engine.selectOption(engine.currentQuestion.id, optionChar);
							}
						}}
					/>

					{/* Navigation controls */}
					<div className="flex items-center justify-between pt-4 border-t border-gray-200">
						<Button
							variant="outline"
							onClick={engine.prevQuestion}
							disabled={engine.currentQuestionIndex === 0}
							className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
						>
							<ChevronLeft className="h-4 w-4 mr-2" />
							Previous
						</Button>

						<Button
							onClick={engine.nextQuestion}
							disabled={engine.currentQuestionIndex === engine.totalQuestions - 1}
							className="bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
						>
							Next
							<ChevronRight className="h-4 w-4 ml-2" />
						</Button>
					</div>
				</section>

				{/* Navigation Panel (Right Column) */}
				<aside className="space-y-6">
					<QuestionNavigationGrid
						questions={sessionData.questions}
						currentQuestionIndex={engine.currentQuestionIndex}
						answers={engine.answers}
						onJumpToQuestion={engine.jumpToQuestion}
					/>

					{/* Submit Exam Button */}
					<div className="pt-2">
						<Button
							onClick={handleSubmitClick}
							disabled={engine.isSubmitting}
							className="w-full py-6 text-sm font-bold bg-red-600 hover:bg-red-750 text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
						>
							{engine.isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Submitting assessment...
								</>
							) : (
								<>
									<Send className="h-4 w-4" />
									Submit Exam
								</>
							)}
						</Button>
					</div>
				</aside>
			</div>
		</main>
	);
}

export default function ActiveExamWorkspacePage() {
	return (
		<React.Suspense
			fallback={
				<div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center gap-3">
					<Loader2 className="h-8 w-8 text-primary animate-spin" />
					<p className="text-gray-500 text-sm font-medium">Loading testing workspace...</p>
				</div>
			}
		>
			<ActiveExamWorkspace />
		</React.Suspense>
	);
}
