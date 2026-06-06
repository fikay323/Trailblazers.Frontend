'use client';

import { useState } from 'react';
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
			const result = await submitExam(sessionId, answers);

			// Clear localStorage cache upon successful submission
			localStorage.removeItem('exam_session_id');
			localStorage.removeItem('exam_end_time');
			localStorage.removeItem('exam_questions');

			router.push(`/exam/results/${sessionId}`);
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
