'use client';

import * as React from 'react';
import { useState } from 'react';
import { ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SUBJECT_LIST = [
	'Mathematics',
	'Physics',
	'Chemistry',
	'Biology',
	'Economics',
	'Government',
	'Literature in English',
	'Christian Religious Studies',
	'Geography',
	'Commerce'
];

export function RegistrationGate() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		year: '2024',
		selectedElectives: [] as string[]
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
				studentEmail: formData.email,
				year: parseInt(formData.year, 10),
				subjects: ['Use of English', ...formData.selectedElectives]
			};

			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';
			const response = await fetch(`${apiUrl}/api/exams/start`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.error || `Server responded with status ${response.status}`);
			}

			const data = await response.json(); // Expected: { sessionId, endTime, questions }

			// Store session data in localStorage for active exam recovery
			localStorage.setItem('exam_session_id', data.sessionId);
			localStorage.setItem('exam_end_time', data.endTime);
			localStorage.setItem('exam_questions', JSON.stringify(data.questions));

			// Redirect student into the active exam view page
			window.location.href = '/exam/active';
		} catch (err: any) {
			setError(err.message || 'Failed to start the exam. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-2xl border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-2xl mx-auto text-slate-100">
			<CardHeader className="space-y-2 text-center border-b border-slate-800 pb-6">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<BookOpen className="h-6 w-6" />
				</div>
				<CardTitle className="text-3xl font-extrabold tracking-tight text-white">JAMB Mock Exam Gate</CardTitle>
				<CardDescription className="text-slate-400">
					Enter your registration details and choose your subjects to start your simulated 2-hour exam session.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				{error && (
					<div className="mb-6 p-4 rounded-md bg-red-950/20 border border-red-900/30 text-red-500 text-sm flex items-center gap-2">
						<AlertCircle className="h-5 w-5 shrink-0" />
						<span>{error}</span>
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Student Name */}
						<div className="space-y-2">
							<Label htmlFor="name" className="text-slate-300">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your name"
								required
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className="border-slate-800 bg-slate-900 text-white placeholder-slate-500"
							/>
						</div>

						{/* Email Address */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-slate-300">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								required
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="border-slate-800 bg-slate-900 text-white placeholder-slate-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Phone Number */}
						<div className="space-y-2">
							<Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="e.g. +234800000000"
								required
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								className="border-slate-800 bg-slate-900 text-white placeholder-slate-500"
							/>
						</div>

						{/* Selected Year */}
						<div className="space-y-2">
							<Label htmlFor="year" className="text-slate-300">Exam Year</Label>
							<select
								id="year"
								value={formData.year}
								onChange={(e) => setFormData({ ...formData, year: e.target.value })}
								className="w-full h-10 rounded-md border border-slate-800 bg-slate-900 px-3 py-1 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-primary"
							>
								<option value="2024">2024 (Latest)</option>
								<option value="2023">2023</option>
								<option value="2022">2022</option>
							</select>
						</div>
					</div>

					{/* Subjects selection */}
					<div className="space-y-3 pt-2">
						<Label className="text-slate-300 font-semibold block">
							Choose 3 Elective Subjects <span className="text-slate-400 font-normal">(Use of English is compulsory)</span>
						</Label>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{SUBJECT_LIST.map((subject) => {
								const isSelected = formData.selectedElectives.includes(subject);
								return (
									<button
										key={subject}
										type="button"
										onClick={() => handleElectiveChange(subject)}
										className={`p-3 text-left rounded-md text-xs font-medium border transition-all cursor-pointer ${isSelected
											? 'border-primary bg-primary/10 text-primary-foreground'
											: 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
											}`}
									>
										{subject}
									</button>
								);
							})}
						</div>
						<div className="text-xs text-slate-400 mt-1">
							Selected: <span className="text-slate-200 font-semibold">{formData.selectedElectives.length} / 3</span> electives.
						</div>
					</div>

					{/* Submit */}
					<div className="pt-4 border-t border-slate-800">
						<Button
							type="submit"
							disabled={isLoading || formData.selectedElectives.length !== 3}
							className="w-full h-12 text-md flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer"
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
