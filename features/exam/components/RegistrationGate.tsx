'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { getExamMetadata, startExam } from '@/core/services/examService';

export function RegistrationGate() {
	const [metadata, setMetadata] = useState<{ subjects: string[]; years: number[] } | null>(null);
	const [isLoadingMeta, setIsLoadingMeta] = useState(true);
	const [metaError, setMetaError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		year: '',
		selectedElectives: [] as string[]
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch exam metadata on mount
	useEffect(() => {
		async function fetchMetadata() {
			try {
				const data = await getExamMetadata();
				setMetadata(data);
				// Automatically select the first available year
				if (data.years && data.years.length > 0) {
					setFormData((prev) => ({ ...prev, year: String(data.years[0]) }));
				}
			} catch (err: any) {
				setMetaError(err.message || 'Could not load exam configuration.');
			} finally {
				setIsLoadingMeta(false);
			}
		}
		fetchMetadata();
	}, []);

	const electiveSubjects = React.useMemo(() => {
		if (!metadata) return [];
		return metadata.subjects.filter(
			(subj) => subj.toLowerCase() !== 'use of english'
		);
	}, [metadata]);

	const handleElectiveChange = (subject: string) => {
		setFormData((prev) => {
			const isSelected = prev.selectedElectives.includes(subject);
			if (isSelected) {
				return {
					...prev,
					selectedElectives: prev.selectedElectives.filter((s) => s !== subject)
				};
			} else {
				if (prev.selectedElectives.length >= 3) return prev; // Limit to 3 electives
				return {
					...prev,
					selectedElectives: [...prev.selectedElectives, subject]
				};
			}
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate that exactly 3 electives are selected (plus English = 4 subjects total)
		if (formData.selectedElectives.length !== 3) {
			setError('Please select exactly 3 elective subjects (English is automatically included).');
			return;
		}

		setIsLoading(true);

		try {
			const payload = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				year: parseInt(formData.year, 10),
				subjects: ['Use of English', ...formData.selectedElectives]
			};

			const data = await startExam(payload); // Expected: { sessionId, endTime, questions }

			// Store session data in localStorage for active exam recovery
			localStorage.setItem('exam_session_id', data.sessionId);
			localStorage.setItem('exam_end_time', data.endTime);
			localStorage.setItem('exam_questions', JSON.stringify(data.questions));

			// Redirect student into the active exam view page
			window.location.href = `/exam/active?session=${data.sessionId}`;
		} catch (err: any) {
			setError(err.message || 'Failed to start the exam. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingMeta) {
		return (
			<Card className="w-full max-w-2xl border-gray-200 bg-white shadow-xl mx-auto text-gray-800 p-8">
				<div className="flex flex-col items-center justify-center space-y-4 py-12">
					<Loader2 className="h-10 w-10 text-primary animate-spin" />
					<p className="text-gray-500 text-sm font-medium">Loading exam options from server...</p>
				</div>
			</Card>
		);
	}

	if (metaError || !metadata) {
		return (
			<Card className="w-full max-w-2xl border-red-200 bg-red-50 shadow-xl mx-auto text-red-800 p-6">
				<div className="flex items-center gap-3">
					<AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
					<div>
						<h3 className="font-bold">Configuration Error</h3>
						<p className="text-sm text-red-700">{metaError || 'Unable to connect to the backend server.'}</p>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-2xl border-gray-200 bg-white shadow-xl mx-auto text-gray-800">
			<CardContent className="p-6">
				{error && (
					<div className="mb-6 p-4 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
						<AlertCircle className="h-5 w-5 shrink-0" />
						<span>{error}</span>
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Student Name */}
						<div className="space-y-2">
							<Label htmlFor="name" className="text-gray-700 font-semibold">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your name"
								required
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className="border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary"
							/>
						</div>

						{/* Email Address */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-gray-700 font-semibold">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								required
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Phone Number */}
						<div className="space-y-2">
							<Label htmlFor="phone" className="text-gray-700 font-semibold">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="e.g. +234800000000"
								required
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								className="border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary"
							/>
						</div>

						{/* Selected Year */}
						<div className="space-y-2">
							<Label htmlFor="year" className="text-gray-700 font-semibold">Exam Year</Label>
							<select
								id="year"
								value={formData.year}
								onChange={(e) => setFormData({ ...formData, year: e.target.value })}
								className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
							>
								{metadata.years.map((y) => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Subjects selection */}
					<div className="space-y-3 pt-2">
						<Label className="text-gray-700 font-bold block">
							Choose 3 Elective Subjects <span className="text-gray-500 font-normal">(Use of English is compulsory)</span>
						</Label>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{electiveSubjects.map((subject) => {
								const isSelected = formData.selectedElectives.includes(subject);
								return (
									<button
										key={subject}
										type="button"
										onClick={() => handleElectiveChange(subject)}
										className={`p-3 text-left rounded-md text-xs font-semibold border transition-all cursor-pointer ${isSelected
											? 'border-primary bg-primary/10 text-primary font-bold'
											: 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
											}`}
									>
										{subject}
									</button>
								);
							})}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Selected: <span className="text-gray-800 font-bold">{formData.selectedElectives.length} / 3</span> electives.
						</div>
					</div>

					{/* Submit */}
					<div className="pt-4 border-t border-gray-100">
						<Button
							type="submit"
							disabled={
								isLoading ||
								!formData.name.trim() ||
								!formData.email.trim() ||
								!formData.phone.trim() ||
								!formData.year ||
								formData.selectedElectives.length !== 3
							}
							className="w-full h-12 text-md flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer font-bold"
						>
							{isLoading ? 'Initializing Session...' : 'Start Exam Simulator'}
							<ArrowRight className="h-5 w-5" />
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
