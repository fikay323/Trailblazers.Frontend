export interface QuestionDto {
	id: string;
	subject: string;
	questionText: string;
	options: Record<string, string>;
	imageUrl?: string | null;
	comprehensionPassage?: string | null;
}

export interface ExamStartResponseDto {
	sessionId: string;
	endTime: string;
	questions: QuestionDto[];
}

export interface ExamSubmitResponseDto {
	score: number;
	totalQuestions: number;
	completedAt: string;
}

export interface StartExamPayload {
	name: string;
	email: string;
	phone: string;
	year: number;
	subjects: string[];
}

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export async function startExam(payload: StartExamPayload): Promise<ExamStartResponseDto> {
	const response = await fetch(`${getApiUrl()}/api/exams/start`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			studentEmail: payload.email,
			year: payload.year,
			subjects: payload.subjects
		})
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}

export async function submitExam(sessionId: string, answers: Record<string, string>): Promise<ExamSubmitResponseDto> {
	const response = await fetch(`${getApiUrl()}/api/exams/submit`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			sessionId,
			studentAnswers: answers
		})
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error || `Server error: ${response.statusText}`);
	}

	return response.json();
}

export async function getExamMetadata(): Promise<{ subjects: string[]; years: number[] }> {
	const response = await fetch(`${getApiUrl()}/api/exams/metadata`);
	if (!response.ok) {
		throw new Error('Failed to retrieve mock exam subjects and years.');
	}
	return response.json();
}

export async function getExamResults(sessionId: string): Promise<any> {
	const response = await fetch(`${getApiUrl()}/api/exams/results/${sessionId}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to load results: ${response.statusText}`);
	}

	return response.json();
}
