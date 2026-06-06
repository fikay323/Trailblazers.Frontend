'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startExam, StartExamPayload } from '@/core/services/examService';

export function useStartExam() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const beginMockExam = async (payload: StartExamPayload) => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await startExam(payload);

			// Save data locally for active session context
			localStorage.setItem('exam_session_id', data.sessionId);
			localStorage.setItem('exam_end_time', data.endTime);
			localStorage.setItem('exam_questions', JSON.stringify(data.questions));

			router.push(`/exam/active?session=${data.sessionId}`);
			return data;
		} catch (err: any) {
			const errMsg = err.message || 'Failed to start the exam session.';
			setError(errMsg);
			throw new Error(errMsg);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		beginMockExam,
		isLoading,
		error
	};
}
