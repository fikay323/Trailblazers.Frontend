"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, ClipboardList, Loader2 } from "lucide-react"

import { submitRegistration } from "@/core/services/submissionsService"

export default function RegisterPage() {
	const [submitting, setSubmitting] = useState(false)
	const [succeeded, setSucceeded] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [formLoadTimestamp] = useState<number>(() => Date.now())
	const [honeypot, setHoneypot] = useState<string>('')

	const [formData, setFormData] = useState({
		fullName: "",
		dob: "",
		gender: "",
		phone: "",
		email: "",
		address: "",
		guardianName: "",
		guardianRelationship: "Parent",
		guardianPhone: "",
		guardianEmail: "",
		lastSchool: "",
		classCompleted: "",
		programmes: [] as string[],
		subjectCombination: "",
		classMode: "",
		referral: "",
	})

	const programmesList = [
		{ id: "bece", label: "BECE" },
		{ id: "waec", label: "WAEC" },
		{ id: "neco", label: "NECO" },
		{ id: "utme", label: "UTME" },
		{ id: "putme", label: "PUTME" },
		{ id: "jupeb", label: "JUPEB" },
		{ id: "ijmb", label: "IJMB" },
	]

	const handleProgrammeChange = (id: string) => {
		setFormData(prev => ({
			...prev,
			programmes: prev.programmes.includes(id)
				? prev.programmes.filter(p => p !== id)
				: [...prev.programmes, id]
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (!formData.guardianName.trim()) {
			setSubmitError("Parent/Guardian full name is required.");
			return;
		}

		if (!formData.guardianPhone.trim() && !formData.guardianEmail.trim()) {
			setSubmitError("Please provide at least one parent/guardian contact method (phone number or email).");
			return;
		}

		setSubmitting(true);

		try {
			// Map frontend fields to match backend API validation with all captured details
			const registrationPayload = {
				name: formData.fullName.trim(),
				email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@trailblazer-academy.com`,
				phoneNumber: formData.phone.trim(),
				targetExam: formData.programmes.length > 0
					? formData.programmes.map(p => p.toUpperCase()).join(', ')
					: "General Program",
				guardianName: formData.guardianName.trim(),
				guardianPhone: formData.guardianPhone.trim() || undefined,
				guardianEmail: formData.guardianEmail.trim() || undefined,
				guardianRelationship: formData.guardianRelationship.trim() || undefined,
				dateOfBirth: formData.dob,
				gender: formData.gender,
				address: formData.address,
				lastSchool: formData.lastSchool,
				classCompleted: formData.classCompleted,
				subjectCombination: formData.subjectCombination,
				classMode: formData.classMode,
				referral: formData.referral,
				programmes: formData.programmes,
				honeypot: honeypot || undefined,
				formLoadTimestamp
			};

			await submitRegistration(registrationPayload);

			setSucceeded(true);
		} catch (err: any) {
			setSubmitError(err.message || 'Submission failed. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	if (succeeded) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
				<div className="text-center space-y-4 max-w-md">
					<div className="flex justify-center">
						<CheckCircle2 className="h-20 w-20 text-primary animate-in zoom-in duration-300" />
					</div>
					<h1 className="text-3xl font-bold text-foreground">Registration Successful!</h1>
					<p className="text-muted-foreground">
						Thank you for registering with Trailblazer Academy. Our admissions team will contact you shortly via the phone number provided.
					</p>
					<Button onClick={() => window.location.href = "/"} className="mt-4">
						Return Home
					</Button>
				</div>
			</div>
		)
	}

	return (
		<main id="main-content" className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
						Student Registration
					</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Join the academy of excellence. Please fill out the form below to begin your journey.
					</p>
				</div>

				<Card className="border-none shadow-xl">
					<CardHeader className="text-primary rounded-t-xl">
						<div className="flex items-center gap-3 justify-center">
							<ClipboardList className="h-6 w-6" />
							<CardTitle className="text-2xl">Application Form</CardTitle>
						</div>
						<CardDescription className="text-primary text-center">
							Please provide accurate information for processing.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-8 pt-0">
						{submitError && (
							<div className="mb-6 p-4 rounded-md bg-red-950/20 border border-red-900/30 text-red-500 text-sm font-medium">
								{submitError}
							</div>
						)}
						<form onSubmit={handleSubmit} className="space-y-12">
							{/* Anti-Bot Honeypot Trap (invisible to humans, filled by spam bots) */}
							<div className="absolute -left-[9999px] top-0 h-0 w-0 opacity-0 pointer-events-none overflow-hidden" aria-hidden="true" tabIndex={-1}>
								<label htmlFor="hp_website_reg">Leave this empty</label>
								<input
									id="hp_website_reg"
									type="text"
									name="website_url"
									value={honeypot}
									onChange={(e) => setHoneypot(e.target.value)}
									autoComplete="off"
									tabIndex={-1}
								/>
							</div>

							{/* Personal Information */}
							<div className="space-y-8">
								<h3 className="text-lg font-semibold border-b pb-2">1. Personal Information</h3>
								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="fullName">1. Full Name</Label>
										<Input
											id="fullName"
											name="fullName"
											required
											placeholder="Enter your full name"
											value={formData.fullName}
											onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="dob">2. Date of Birth (DD/MM/YYYY)</Label>
										<Input
											id="dob"
											name="dob"
											type="text"
											required
											placeholder="e.g. 15/05/2005"
											value={formData.dob}
											onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
										/>
									</div>
								</div>

								<fieldset className="space-y-3">
									<legend id="gender-label" className="text-sm font-medium text-foreground">3. Gender</legend>
									<RadioGroup
										aria-labelledby="gender-label"
										onValueChange={(val) => setFormData({ ...formData, gender: val })}
										className="flex gap-6"
										required
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="male" id="male" />
											<Label htmlFor="male">Male</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="female" id="female" />
											<Label htmlFor="female">Female</Label>
										</div>
									</RadioGroup>
								</fieldset>

								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="phone">4. Phone Number (Student/Parent)</Label>
										<Input
											id="phone"
											name="phone"
											type="tel"
											required
											placeholder="Enter phone number"
											value={formData.phone}
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">5. Email Address (Optional)</Label>
										<Input
											id="email"
											name="email"
											type="email"
											placeholder="example@email.com"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="address">6. Residential Address</Label>
									<Input
										id="address"
										name="address"
										required
										placeholder="Enter your current address"
										value={formData.address}
										onChange={(e) => setFormData({ ...formData, address: e.target.value })}
									/>
								</div>
							</div>

							{/* Parent / Guardian Information */}
							<div className="space-y-8 pt-4">
								<div>
									<h3 className="text-lg font-semibold border-b pb-2">2. Parent / Guardian Information</h3>
									<p className="text-xs text-muted-foreground mt-1">
										Please provide parent or guardian details. At least one contact method (phone or email) is required for progress updates and reports.
									</p>
								</div>
								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="guardianName">7. Parent / Guardian Full Name *</Label>
										<Input
											id="guardianName"
											name="guardianName"
											required
											placeholder="e.g. Mr. Johnathan Doe"
											value={formData.guardianName}
											onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="guardianRelationship">8. Relationship to Student</Label>
										<Input
											id="guardianRelationship"
											name="guardianRelationship"
											placeholder="e.g. Father, Mother, Guardian, Sponsor"
											value={formData.guardianRelationship}
											onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
										/>
									</div>
								</div>

								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="guardianPhone">9. Guardian Phone Number</Label>
										<Input
											id="guardianPhone"
											name="guardianPhone"
											type="tel"
											placeholder="e.g. 08012345678"
											value={formData.guardianPhone}
											onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="guardianEmail">10. Guardian Email Address</Label>
										<Input
											id="guardianEmail"
											name="guardianEmail"
											type="email"
											placeholder="guardian@example.com"
											value={formData.guardianEmail}
											onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Academic History */}
							<div className="space-y-8 pt-4">
								<h3 className="text-lg font-semibold border-b pb-2">3. Academic Background</h3>
								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="lastSchool">11. Last School Attended</Label>
										<Input
											id="lastSchool"
											name="lastSchool"
											required
											placeholder="Name of your last school"
											value={formData.lastSchool}
											onChange={(e) => setFormData({ ...formData, lastSchool: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="classCompleted">12. Class Completed</Label>
										<Input
											id="classCompleted"
											name="classCompleted"
											required
											placeholder="e.g. SSS 3"
											value={formData.classCompleted}
											onChange={(e) => setFormData({ ...formData, classCompleted: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Programme Selection */}
							<div className="space-y-8 pt-4">
								<h3 className="text-lg font-semibold border-b pb-2">4. Programme Details</h3>
								<fieldset className="space-y-4">
									<legend className="text-sm font-medium text-foreground">13. Programme Registering For (Select all that apply)</legend>
									<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
										{programmesList.map((prog) => (
											<div key={prog.id} className="flex items-center space-x-2">
												<Checkbox
													id={prog.id}
													checked={formData.programmes.includes(prog.id)}
													onCheckedChange={() => handleProgrammeChange(prog.id)}
												/>
												<Label htmlFor={prog.id} className="cursor-pointer">{prog.label}</Label>
											</div>
										))}
									</div>
								</fieldset>

								<div className="space-y-2">
									<Label htmlFor="subjects">14. Subject Combination (for WAEC/UTME/JUPEB)</Label>
									<Input
										id="subjects"
										name="subjects"
										placeholder="e.g. Maths, English, Physics, Chemistry"
										value={formData.subjectCombination}
										onChange={(e) => setFormData({ ...formData, subjectCombination: e.target.value })}
									/>
								</div>

								<fieldset className="space-y-3">
									<legend id="classmode-label" className="text-sm font-medium text-foreground">15. Preferred Class Mode</legend>
									<RadioGroup
										aria-labelledby="classmode-label"
										onValueChange={(val) => setFormData({ ...formData, classMode: val })}
										className="flex flex-wrap gap-6"
										required
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="online" id="online" />
											<Label htmlFor="online">Online</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="physical" id="physical" />
											<Label htmlFor="physical">Physical</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="both" id="both" />
											<Label htmlFor="both">Both</Label>
										</div>
									</RadioGroup>
								</fieldset>

								<div className="space-y-2">
									<Label htmlFor="referral">16. How Did You Hear About Us?</Label>
									<Input
										id="referral"
										name="referral"
										placeholder="e.g. Social Media, Friend, Radio"
										value={formData.referral}
										onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
									/>
								</div>
							</div>

							<div className="flex justify-end pt-6">
								<Button
									type="submit"
									size="lg"
									disabled={submitting}
									className="px-12 py-6 text-lg shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
								>
									{submitting ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											Submitting Application...
										</>
									) : (
										<>
											Submit Application
											<ArrowRight className="ml-2 h-5 w-5" />
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<p className="mt-8 text-center text-sm text-muted-foreground">
					Need help? Contact us at admissions@trailblazer.edu or call (555) 123-4567
				</p>
			</div>
		</main>
	)
}
