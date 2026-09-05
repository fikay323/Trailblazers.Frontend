'use client';

import React, { useState, useEffect } from 'react';
import {
	getQuestions,
	createQuestion,
	deleteQuestion,
	AdminQuestionItem
} from '@/core/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Search,
	Plus,
	Trash2,
	RefreshCw,
	HelpCircle,
	CheckCircle,
	X,
	BookOpen,
	AlertCircle
} from 'lucide-react';

interface QuestionBankViewProps {
	apiKey: string;
}

const AVAILABLE_SUBJECTS = [
	{ id: 'english', name: 'Use of English' },
	{ id: 'mathematics', name: 'Mathematics' },
	{ id: 'physics', name: 'Physics' },
	{ id: 'chemistry', name: 'Chemistry' },
	{ id: 'biology', name: 'Biology' },
	{ id: 'economics', name: 'Economics' },
	{ id: 'government', name: 'Government' },
	{ id: 'literature', name: 'Literature in English' },
	{ id: 'crk', name: 'Christian Religious Knowledge' },
	{ id: 'commerce', name: 'Commerce' },
	{ id: 'accounting', name: 'Principles of Accounts' },
	{ id: 'agricultural_science', name: 'Agricultural Science' }
];

export function QuestionBankView({ apiKey }: QuestionBankViewProps) {
	const [questions, setQuestions] = useState<AdminQuestionItem[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filter state
	const [selectedSubject, setSelectedSubject] = useState<string>('');
	const [selectedYear, setSelectedYear] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [pageNumber, setPageNumber] = useState<number>(1);
	const pageSize = 15;

	// Create Question Modal state
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [createSubject, setCreateSubject] = useState('english');
	const [createYear, setCreateYear] = useState('2026');
	const [createQuestionText, setCreateQuestionText] = useState('');
	const [optionA, setOptionA] = useState('');
	const [optionB, setOptionB] = useState('');
	const [optionC, setOptionC] = useState('');
	const [optionD, setOptionD] = useState('');
	const [correctOption, setCorrectOption] = useState('A');
	const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	// Deletion state
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		loadQuestions();
	}, [selectedSubject, selectedYear, pageNumber, apiKey]);

	const loadQuestions = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await getQuestions(
				{
					subject: selectedSubject || undefined,
					year: selectedYear ? parseInt(selectedYear) : undefined,
					searchTerm: searchTerm.trim() || undefined,
					pageNumber,
					pageSize
				},
				apiKey
			);
			setQuestions(res.items);
			setTotalCount(res.totalCount);
		} catch (err: any) {
			setError(err.message || 'Failed to load question bank.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setPageNumber(1);
		loadQuestions();
	};

	const handleCreateQuestion = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreateError(null);

		if (!createQuestionText.trim()) {
			setCreateError('Question text is required.');
			return;
		}

		if (!optionA.trim() || !optionB.trim()) {
			setCreateError('Options A and B are required.');
			return;
		}

		setIsSubmittingQuestion(true);
		try {
			const options: Record<string, string> = {
				A: optionA.trim(),
				B: optionB.trim()
			};
			if (optionC.trim()) options['C'] = optionC.trim();
			if (optionD.trim()) options['D'] = optionD.trim();

			await createQuestion(
				{
					subject: createSubject,
					examYear: parseInt(createYear) || 2026,
					questionText: createQuestionText.trim(),
					correctOption: correctOption.toUpperCase(),
					options,
					examType: 'custom'
				},
				apiKey
			);

			setIsCreateModalOpen(false);
			// Reset form
			setCreateQuestionText('');
			setOptionA('');
			setOptionB('');
			setOptionC('');
			setOptionD('');
			setCorrectOption('A');

			await loadQuestions();
		} catch (err: any) {
			setCreateError(err.message || 'Failed to create question.');
		} finally {
			setIsSubmittingQuestion(false);
		}
	};

	const handleDeleteQuestion = async (id: string) => {
		if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
			return;
		}

		setDeletingId(id);
		try {
			await deleteQuestion(id, apiKey);
			setQuestions((prev) => prev.filter((q) => q.id !== id));
			setTotalCount((prev) => Math.max(0, prev - 1));
		} catch (err: any) {
			alert(err.message || 'Failed to delete question.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Top Bar / Actions */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
				<div>
					<h3 className="text-xl font-bold text-white flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-orange-400" />
						Question Bank Repository
					</h3>
					<p className="text-xs text-slate-400 mt-0.5">
						Total Questions Indexed: <span className="font-bold text-white">{totalCount}</span>
					</p>
				</div>

				<Button
					onClick={() => setIsCreateModalOpen(true)}
					className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2 cursor-pointer flex items-center gap-1.5"
				>
					<Plus className="h-4 w-4" />
					Add Custom Question
				</Button>
			</div>

			{/* Filters Row */}
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
				{/* Search Input */}
				<form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
					<Input
						placeholder="Search question text or concepts..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs"
					/>
				</form>

				{/* Subject Filter */}
				<div>
					<select
						value={selectedSubject}
						onChange={(e) => {
							setSelectedSubject(e.target.value);
							setPageNumber(1);
						}}
						aria-label="Filter by Subject"
						className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
					>
						<option value="">All Subjects</option>
						{AVAILABLE_SUBJECTS.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</div>

				{/* Year Filter */}
				<div>
					<select
						value={selectedYear}
						onChange={(e) => {
							setSelectedYear(e.target.value);
							setPageNumber(1);
						}}
						aria-label="Filter by Year"
						className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
					>
						<option value="">All Years</option>
						{[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
							<option key={yr} value={yr}>
								{yr}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Error Alert */}
			{error && (
				<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Questions List */}
			{isLoading ? (
				<div className="py-16 text-center text-slate-400">
					<RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
					<p>Loading question bank...</p>
				</div>
			) : questions.length === 0 ? (
				<div className="py-16 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/30">
					<HelpCircle className="h-10 w-10 mx-auto mb-2 text-slate-600" />
					<p className="text-base font-semibold text-slate-300">No questions found matching criteria.</p>
					<p className="text-xs text-slate-500 mt-1">
						Use the "Add Custom Question" button above to populate the question bank.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{questions.map((q, idx) => (
						<Card key={q.id} className="border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
							<CardHeader className="pb-3 pt-4 px-5 border-b border-slate-800/60 flex flex-row items-center justify-between">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-mono text-xs text-slate-400 font-bold">
										#{(pageNumber - 1) * pageSize + idx + 1}
									</span>
									<span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-orange-950 text-orange-400 border border-orange-800/60">
										{q.subject}
									</span>
									<span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
										{q.examYear} UTME
									</span>
									{q.examType === 'custom' && (
										<span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
											Custom Built
										</span>
									)}
								</div>

								<Button
									variant="outline"
									size="sm"
									disabled={deletingId === q.id}
									onClick={() => handleDeleteQuestion(q.id)}
									className="text-xs h-7 px-2 border-slate-800 bg-slate-950 text-red-400 hover:bg-red-950 hover:text-red-300 cursor-pointer"
								>
									{deletingId === q.id ? (
										<RefreshCw className="h-3 w-3 animate-spin" />
									) : (
										<Trash2 className="h-3 w-3" />
									)}
								</Button>
							</CardHeader>

							<CardContent className="pt-4 px-5 pb-5 space-y-3">
								<div className="text-sm font-medium text-white leading-relaxed">
									{q.questionText}
								</div>

								{/* Options Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
									{Object.entries(q.options || {}).map(([optKey, optText]) => {
										const isCorrect = q.correctOption?.toUpperCase() === optKey.toUpperCase();
										return (
											<div
												key={optKey}
												className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-colors ${isCorrect
													? 'border-emerald-700 bg-emerald-950/40 text-emerald-200 font-semibold'
													: 'border-slate-800 bg-slate-950/40 text-slate-300'
													}`}
											>
												<span
													className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${isCorrect
														? 'bg-emerald-600 text-white'
														: 'bg-slate-800 text-slate-400'
														}`}
												>
													{optKey}
												</span>
												<span className="flex-1">{optText}</span>
												{isCorrect && (
													<CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					))}

					{/* Pagination */}
					<div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
						<div>
							Showing {(pageNumber - 1) * pageSize + 1} to{' '}
							{Math.min(pageNumber * pageSize, totalCount)} of {totalCount} questions
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={pageNumber <= 1}
								onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
								className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer text-xs h-8"
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={pageNumber * pageSize >= totalCount}
								onClick={() => setPageNumber((p) => p + 1)}
								className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer text-xs h-8"
							>
								Next
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* CREATE QUESTION MODAL */}
			{isCreateModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<Card className="w-full max-w-xl border-slate-800 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
						<CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between shrink-0">
							<div>
								<CardTitle className="text-lg font-bold text-white flex items-center gap-2">
									<Plus className="h-5 w-5 text-orange-400" />
									Create Custom Question
								</CardTitle>
								<CardDescription className="text-xs text-slate-400 mt-0.5">
									Add a custom question to the exam question bank repository.
								</CardDescription>
							</div>
							<button
								onClick={() => setIsCreateModalOpen(false)}
								className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
								aria-label="Close modal"
							>
								<X className="h-5 w-5" />
							</button>
						</CardHeader>

						<form onSubmit={handleCreateQuestion} className="flex-1 overflow-y-auto p-5 space-y-4">
							{createError && (
								<Alert variant="destructive" className="border-red-800 bg-red-950/50 text-red-300">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{createError}</AlertDescription>
								</Alert>
							)}

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label htmlFor="create-q-subject" className="text-xs font-semibold text-slate-300 block mb-1">
										Subject
									</label>
									<select
										id="create-q-subject"
										value={createSubject}
										onChange={(e) => setCreateSubject(e.target.value)}
										className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
									>
										{AVAILABLE_SUBJECTS.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label htmlFor="create-q-year" className="text-xs font-semibold text-slate-300 block mb-1">
										Exam Year
									</label>
									<Input
										id="create-q-year"
										type="number"
										value={createYear}
										onChange={(e) => setCreateYear(e.target.value)}
										className="border-slate-800 bg-slate-950 text-white text-xs h-9"
										required
									/>
								</div>
							</div>

							<div>
								<label htmlFor="create-q-text" className="text-xs font-semibold text-slate-300 block mb-1">
									Question Text
								</label>
								<textarea
									id="create-q-text"
									rows={3}
									placeholder="Enter the question formulation here..."
									value={createQuestionText}
									onChange={(e) => setCreateQuestionText(e.target.value)}
									className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
									required
								/>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-semibold text-slate-300 block">
									Answer Options (Mark the correct answer):
								</label>

								{[
									{ label: 'A', value: optionA, setter: setOptionA },
									{ label: 'B', value: optionB, setter: setOptionB },
									{ label: 'C', value: optionC, setter: setOptionC },
									{ label: 'D', value: optionD, setter: setOptionD }
								].map((opt) => (
									<div key={opt.label} className="flex items-center gap-2">
										<label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-300 w-12 shrink-0">
											<input
												type="radio"
												name="correctOption"
												value={opt.label}
												checked={correctOption === opt.label}
												onChange={() => setCorrectOption(opt.label)}
												className="text-orange-600 focus:ring-orange-500"
											/>
											{opt.label}:
										</label>
										<Input
											placeholder={`Option ${opt.label} text`}
											value={opt.value}
											onChange={(e) => opt.setter(e.target.value)}
											className="border-slate-800 bg-slate-950 text-white text-xs h-8"
											required={opt.label === 'A' || opt.label === 'B'}
										/>
									</div>
								))}
							</div>

							<div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setIsCreateModalOpen(false)}
									className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									size="sm"
									disabled={isSubmittingQuestion}
									className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer"
								>
									{isSubmittingQuestion ? (
										<>
											<RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
											Saving Question...
										</>
									) : (
										'Save Question'
									)}
								</Button>
							</div>
						</form>
					</Card>
				</div>
			)}
		</div>
	);
}
