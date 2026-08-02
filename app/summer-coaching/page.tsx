import type { Metadata } from 'next'
import Link from 'next/link'
import {
	Calendar,
	Clock,
	MapPin,
	Sparkles,
	CheckCircle2,
	BookOpen,
	Monitor,
	GraduationCap,
	PhoneCall,
	ArrowRight,
	ShieldCheck,
	HelpCircle,
	Zap,
	Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSummerStatus } from '@/lib/summer-coaching-utils'

export const metadata: Metadata = {
	title: 'Summer Lessons & Coaching in Moniya, Ibadan | Trailblazer Academy',
	description:
		'Intensive summer prep lessons at Trailblazer Academy, Moniya, Ibadan. Classes for JSS1-SS3, WAEC/JAMB headstart, and practical CBT computer training. Register today!',
	alternates: {
		canonical: 'https://trailblazer-academy.com/summer-coaching',
	},
	openGraph: {
		type: 'website',
		locale: 'en_NG',
		url: 'https://trailblazer-academy.com/summer-coaching',
		siteName: 'Trailblazer Academy & Edukonsult',
		title: 'Summer Lessons & Holiday Coaching in Moniya, Ibadan',
		description:
			'Boost your child’s academic performance this holiday! Intensive preparatory classes for JSS1–SS3, JAMB headstart, and CBT training at Trailblazer Academy.',
		images: [
			{
				url: '/trailblazer.jpeg',
				width: 1200,
				height: 630,
				alt: 'Trailblazer Academy Summer Coaching Program',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Summer Coaching 2026 – Trailblazer Academy, Moniya, Ibadan',
		description:
			'Holiday coaching for JSS1–SS3 & UTME/JAMB headstart. Practical CBT lab, expert tutors, proven results.',
		images: ['/trailblazer.jpeg'],
	},
}

export default function SummerCoachingPage() {
	const status = getSummerStatus()

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: 'Trailblazer Intensive Summer Coaching & Holiday Lessons 2026',
		description:
			'Intensive holiday preparatory lessons for secondary school students (JSS1 to SS3), JAMB candidates, and computer CBT literacy in Moniya, Ibadan.',
		startDate: '2026-08-03T08:00:00+01:00',
		endDate: '2026-09-04T14:00:00+01:00',
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: {
			'@type': 'Place',
			name: 'Trailblazer Academy & Edukonsult Campus',
			address: {
				'@type': 'PostalAddress',
				streetAddress: '5 Odo Oba Rd, beside Odo-Oba Mosque, Moniya',
				addressLocality: 'Ibadan',
				addressRegion: 'Oyo State',
				addressCountry: 'NG',
			},
		},
		organizer: {
			'@type': 'EducationalOrganization',
			name: 'Trailblazer Academy & Edukonsult',
			url: 'https://trailblazer-academy.com',
		},
		offers: {
			'@type': 'Offer',
			url: 'https://trailblazer-academy.com/summer-coaching',
			priceCurrency: 'NGN',
			availability: 'https://schema.org/InStock',
			validFrom: '2026-08-01',
		},
	}

	const tracks = [
		{
			level: 'Junior Secondary Track',
			target: 'JSS 1, JSS 2 & JSS 3 Students',
			icon: BookOpen,
			color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
			badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
			highlights: [
				'Mathematics & Basic Science Problem Solving',
				'English Language, Essay & Phonics',
				'Basic Technology & Computer Fundamentals',
				'BECE/JSCE Preparation Strategy',
			],
		},
		{
			level: 'Senior Secondary Track',
			target: 'SS 1, SS 2 & SS 3 Students',
			icon: GraduationCap,
			color: 'from-orange-500/10 to-red-500/10 border-orange-500/20',
			badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
			highlights: [
				'Core Sciences (Physics, Chemistry, Biology, Further Maths)',
				'Commercial & Arts (Economics, Accounting, Government, Lit-in-English)',
				'WAEC / NECO / GCE Early Syllabus Coverage',
				'Structured Weekly Progress Evaluations',
			],
		},
		{
			level: 'JAMB / UTME Headstart',
			target: 'SS 2, SS 3 & Post-Secondary Candidates',
			icon: Sparkles,
			color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20',
			badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
			highlights: [
				'Speed & Accuracy Time-Management Hacks',
				'Comprehensive Past Question Breakdown (2000–2025)',
				'Novel & Comprehension Deep-Dive',
				'Subject Combination Advice & Career Guidance',
			],
		},
		{
			level: 'Practical CBT & Digital Skills',
			target: 'All Enrolled Students',
			icon: Monitor,
			color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
			badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
			highlights: [
				'Hands-on Computer Keyboard & Mouse Navigation',
				'Real CBT Exam Interface Simulations',
				'Overcoming Computer Exam Anxiety',
				'Individual Performance Analytics & Scoring',
			],
		},
	]

	const faqs = [
		{
			question: 'When do the summer lessons officially start?',
			answer: status.faqStartAnswer,
		},
		{
			question: 'Where is the lesson venue located in Ibadan?',
			answer:
				'The summer coaching takes place at Trailblazer Academy Campus: 5 Odo Oba Rd, beside Odo-Oba Mosque, Moniya, Ibadan, Oyo State.',
		},
		{
			question: 'Are CBT computer practice sessions included for all students?',
			answer:
				'Yes! All enrolled students receive access to our dedicated computer CBT laboratory to practice digital exams, building crucial speed and familiarity early.',
		},
		{
			question: 'What subjects are covered during the summer coaching?',
			answer:
				'We cover all core subjects including Mathematics, English Language, Physics, Chemistry, Biology, Further Mathematics, Economics, Government, Literature-in-English, Commerce, Accounting, and Civic Education.',
		},
		{
			question: 'How do I register my child or ward?',
			answer:
				'You can register online immediately by clicking the "Register Now" button, or visit our Moniya campus directly. You can also call or WhatsApp +234 816 599 9425 for assistance.',
		},
	]

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-16 sm:py-24 text-white">
					{/* Decorative Glows */}
					<div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />

					<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center max-w-3xl mx-auto">
							<span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 shadow-xs">
								<Sparkles className="h-3.5 w-3.5 animate-pulse" />
								{status.heroHeadline}
							</span>

							<h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
								Intensive Summer Coaching <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">2026</span>
							</h1>

							<p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
								Transform your holiday into a stepping stone for academic excellence. Trailblazer Academy presents a comprehensive summer preparatory program for JSS1–SS3 students, JAMB headstarters, and computer CBT learners in Moniya, Ibadan.
							</p>

							{/* Quick Details Badges */}
							<div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-200">
								<div className="flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-2.5 border border-slate-700">
									<Calendar className="h-4 w-4 text-orange-400" />
									<span>{status.venueBadge}</span>
								</div>
								<div className="flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-2.5 border border-slate-700">
									<Clock className="h-4 w-4 text-orange-400" />
									<span>Morning & Afternoon Classes</span>
								</div>
								<div className="flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-2.5 border border-slate-700">
									<MapPin className="h-4 w-4 text-orange-400" />
									<span>Moniya, Ibadan</span>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
								<Link href="/register" className="w-full sm:w-auto">
									<Button className="w-full sm:w-auto bg-primary hover:bg-orange-600 text-white font-bold text-base px-8 py-6 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer">
										<span>Register For Summer Lessons</span>
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>

								<a
									href="https://wa.me/2348165999425?text=Hello%20Trailblazer%20Academy,%20I%20want%20to%20inquire%20about%20the%20Summer%20Lessons."
									target="_blank"
									rel="noopener noreferrer"
									className="w-full sm:w-auto"
								>
									<Button variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-base px-8 py-6 rounded-xl cursor-pointer">
										<PhoneCall className="mr-2 h-5 w-5 text-emerald-400" />
										<span>WhatsApp Inquiry</span>
									</Button>
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Program Tracks Grid */}
				<section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center max-w-3xl mx-auto">
							<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
								Customized Learning Tracks
							</span>
							<h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
								Tailored Coaching Programs for Every Level
							</h2>
							<p className="mt-4 text-muted-foreground text-base">
								Whether strengthening fundamental concepts or getting a head start on national examinations, our structured tracks deliver proven results.
							</p>
						</div>

						<div className="mt-12 grid gap-8 md:grid-cols-2">
							{tracks.map((track, i) => {
								const Icon = track.icon
								return (
									<div
										key={i}
										className={`relative overflow-hidden rounded-2xl border bg-card p-8 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${track.color}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
												<Icon className="h-6 w-6" />
											</div>
											<span className={`rounded-full px-3 py-1 text-xs font-bold ${track.badgeColor}`}>
												{track.target}
											</span>
										</div>

										<h3 className="mt-6 text-xl font-bold text-foreground">
											{track.level}
										</h3>

										<ul className="mt-6 space-y-3">
											{track.highlights.map((item, idx) => (
												<li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
													<CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</div>
								)
							})}
						</div>
					</div>
				</section>

				{/* Why Choose Trailblazers */}
				<section className="py-16 lg:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-2 lg:items-center">
							<div>
								<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
									The Trailblazer Distinction
								</span>
								<h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
									Why Parents & Students Choose Our Summer Program
								</h2>
								<p className="mt-4 text-muted-foreground leading-relaxed">
									We don't just keep students busy during the holiday; we engineer academic breakthroughs by combining subject mastery with modern digital tools and godly discipline.
								</p>

								<div className="mt-8 space-y-6">
									<div className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
											<Monitor className="h-5 w-5" />
										</div>
										<div>
											<h4 className="font-bold text-foreground">Dedicated CBT Computer Facility</h4>
											<p className="mt-1 text-sm text-muted-foreground">
												Students practice on actual computer systems to master online test formats, reducing exam day phobia.
											</p>
										</div>
									</div>

									<div className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
											<Users className="h-5 w-5" />
										</div>
										<div>
											<h4 className="font-bold text-foreground">Seasoned & Passionate Educators</h4>
											<p className="mt-1 text-sm text-muted-foreground">
												Led by university lecturers, researchers, and senior subject specialists committed to individual growth.
											</p>
										</div>
									</div>

									<div className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
											<ShieldCheck className="h-5 w-5" />
										</div>
										<div>
											<h4 className="font-bold text-foreground">Disciplined & Inspiring Atmosphere</h4>
											<p className="mt-1 text-sm text-muted-foreground">
												A safe, moral, and faith-guided learning environment where character development matches academic excellence.
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Venue Card Box */}
							<div className="rounded-3xl border border-border/80 bg-card p-8 shadow-xl relative overflow-hidden">
								<div className="absolute top-0 right-0 p-8 text-slate-200 dark:text-slate-800 pointer-events-none">
									<Zap className="h-32 w-32 opacity-20" />
								</div>

								<h3 className="text-2xl font-bold text-foreground">Venue & Schedule Summary</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Conveniently situated in Moniya, Ibadan for easy accessibility.
								</p>

								<div className="mt-8 space-y-4 text-sm">
									<div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 border border-border/50">
										<Calendar className="h-5 w-5 text-primary shrink-0" />
										<div>
											<span className="font-semibold text-foreground block">Commencement & Status</span>
											<span className="text-muted-foreground">{status.venueBadge}</span>
										</div>
									</div>

									<div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 border border-border/50">
										<Clock className="h-5 w-5 text-primary shrink-0" />
										<div>
											<span className="font-semibold text-foreground block">Class Schedule</span>
											<span className="text-muted-foreground">Monday to Friday (Morning & Afternoon Batches)</span>
										</div>
									</div>

									<div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 border border-border/50">
										<MapPin className="h-5 w-5 text-primary shrink-0" />
										<div>
											<span className="font-semibold text-foreground block">Campus Address</span>
											<span className="text-muted-foreground">5 Odo Oba Rd, beside Odo-Oba Mosque, Moniya, Ibadan</span>
										</div>
									</div>
								</div>

								<div className="mt-8 pt-6 border-t border-border">
									<Link href="/register">
										<Button className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl cursor-pointer">
											Secure Student Seat Now
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FAQs */}
				<section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
					<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
								<HelpCircle className="h-3.5 w-3.5" />
								Frequently Asked Questions
							</span>
							<h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
								Common Questions From Parents
							</h2>
						</div>

						<div className="mt-12 space-y-4">
							{faqs.map((faq, index) => (
								<div
									key={index}
									className="rounded-2xl border border-border bg-card p-6 shadow-xs"
								>
									<h4 className="text-base font-bold text-foreground">
										{faq.question}
									</h4>
									<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
										{faq.answer}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Final CTA Banner */}
				<section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-16 text-white text-center">
					<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
						<h2 className="text-3xl font-extrabold sm:text-4xl">
							{status.ctaBannerTitle}
						</h2>
						<p className="mt-4 text-base sm:text-lg text-orange-100 max-w-2xl mx-auto">
							{status.ctaBannerSub}
						</p>
						<div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
							<Link href="/register">
								<Button className="w-full sm:w-auto bg-white text-orange-700 hover:bg-slate-100 font-extrabold text-base px-8 py-6 rounded-xl cursor-pointer shadow-lg hover:scale-105 transition-transform">
									Register For Summer Lessons
								</Button>
							</Link>
							<Link href="/contact">
								<Button variant="outline" className="w-full sm:w-auto border-white text-white bg-white/10 hover:scale-105 font-bold text-base px-8 py-6 rounded-xl cursor-pointer">
									Contact Admissions Team
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}
