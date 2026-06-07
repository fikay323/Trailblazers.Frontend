'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitExam, QuestionDto } from '@/core/services/examService';

interface UseExamEngineProps {
	sessionId: string;
	initialQuestions: QuestionDto[];
	endTime: string;
}

export function useExamEngine({ sessionId, initialQuestions, endTime }: UseExamEngineProps) {
	const router = useRouter();

	// Active question state
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

	// Answers mapping: Record<QuestionId, OptionChar>
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Submission flags
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Rehydrate state on mount if session is active
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const cachedSessionId = localStorage.getItem('exam_session_id');
		const cachedEndTime = localStorage.getItem('exam_end_time');

		if (cachedSessionId && cachedEndTime && new Date(cachedEndTime) > new Date()) {
			const cachedAnswers = localStorage.getItem('exam_answers');
			if (cachedAnswers) {
				try {
					setAnswers(JSON.parse(cachedAnswers));
				} catch (e) {
					console.error('Error rehydrating answers:', e);
				}
			}
			const cachedIndex = localStorage.getItem('exam_current_index');
			if (cachedIndex) {
				const parsedIndex = parseInt(cachedIndex, 10);
				if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < initialQuestions.length) {
					setCurrentQuestionIndex(parsedIndex);
				}
			}
		}
	}, [initialQuestions.length]);

	// Sync state to localStorage when answers, index, or session properties change
	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (sessionId) {
			localStorage.setItem('exam_session_id', sessionId);
			localStorage.setItem('exam_end_time', endTime);
			localStorage.setItem('exam_answers', JSON.stringify(answers));
			localStorage.setItem('exam_current_index', String(currentQuestionIndex));
		}
	}, [answers, currentQuestionIndex, sessionId, endTime]);

	// Select option character for a specific question
	const selectOption = (questionId: string, optionChar: string) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: optionChar
		}));
	};

	// Navigations
	const nextQuestion = () => {
		if (currentQuestionIndex < initialQuestions.length - 1) {
			setCurrentQuestionIndex((idx) => idx + 1);
		}
	};

	const prevQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((idx) => idx - 1);
		}
	};

	const jumpToQuestion = (index: number) => {
		if (index >= 0 && index < initialQuestions.length) {
			setCurrentQuestionIndex(index);
		}
	};

	// Complete and submit assessment to the server
	const submitAssessment = async () => {
		setIsSubmitting(true);
		setError(null);
		try {
			const submissionAnswers: Record<string, string> = {};
			initialQuestions.forEach(q => {
				submissionAnswers[q.id] = answers[q.id] || '-';
			});

			const result = await submitExam(sessionId, submissionAnswers);

			// Clear localStorage cache upon successful submission
			localStorage.removeItem('exam_session_id');
			localStorage.removeItem('exam_end_time');
			localStorage.removeItem('exam_questions');
			localStorage.removeItem('exam_answers');
			localStorage.removeItem('exam_current_index');

			router.push(`/exam/result/${sessionId}`);
			return result;
		} catch (err: any) {
			const errMsg = err.message || 'Submission failed. Please try again.';
			setError(errMsg);
			throw new Error(errMsg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const currentQuestion = initialQuestions[currentQuestionIndex] || null;

	return {
		currentQuestionIndex,
		currentQuestion,
		totalQuestions: initialQuestions.length,
		answers,
		isSubmitting,
		error,
		selectOption,
		nextQuestion,
		prevQuestion,
		jumpToQuestion,
		submitAssessment
	};
}
