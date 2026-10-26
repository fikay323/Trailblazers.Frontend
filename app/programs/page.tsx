import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookOpen, Monitor, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Metadata } from 'next';
import { getSiteAssets, resolveAsset } from "@/core/services/siteAssetService";

export async function generateMetadata(): Promise<Metadata> {
	let ogImageUrl = '/trailblazer.jpeg';
	let ogAlt = 'Students studying at Trailblazer Academy';
	try {
		const assets = await getSiteAssets('seo');
		const match = assets.find((a) => a.key === 'seo.og.programs' || a.key === 'seo.og.default');
		if (match?.imageUrl) {
			ogImageUrl = match.imageUrl;
			if (match.altText) ogAlt = match.altText;
		}
	} catch {
		ogImageUrl = '/trailblazer.jpeg';
	}

	return {
		title: 'Programs – JAMB, WAEC, NECO & GCE Exam Preparation',
		description:
			'Explore Trailblazer Academy’s structured exam preparation programs for JAMB/UTME, WAEC, NECO, and GCE. Intensive coaching, CBT labs, and subject counseling in Ibadan.',
		alternates: {
			canonical: 'https://trailblazer-academy.com/programs',
		},
		openGraph: {
			title: 'Exam Preparation Programs – Trailblazer Academy',
			description:
				'Structured JAMB/UTME, WAEC, NECO & GCE prep with CBT labs, weekly mocks, and expert subject counseling. Secure your admission today.',
			url: 'https://trailblazer-academy.com/programs',
			images: [{ url: ogImageUrl, alt: ogAlt }],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Exam Preparation Programs – Trailblazer Academy',
			description: 'Structured JAMB/UTME, WAEC, NECO & GCE prep with CBT labs in Ibadan.',
			images: [ogImageUrl]
		}
	};
}

export default async function ProgramsPage() {
	let heroAsset = {
		imageUrl: '/images/image-2.jpeg',
		altText: 'Classroom setting'
	};

	try {
		const assets = await getSiteAssets('programs');
		const resolved = resolveAsset(assets, 'programs.hero', '/images/image-2.jpeg', 'Classroom setting');
		heroAsset = {
			imageUrl: resolved.imageUrl,
			altText: resolved.altText || 'Classroom setting'
		};
	} catch {
		heroAsset = {
			imageUrl: '/images/image-2.jpeg',
			altText: 'Classroom setting'
		};
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="bg-[#f8f9fb] py-16 lg:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid items-center gap-12 lg:grid-cols-2">
							<div>
								<span className="text-sm font-semibold uppercase tracking-wider text-primary">
									Academic Pathways
								</span>
								<h1 className="mt-4 text-4xl font-bold text-foreground lg:text-5xl">
									Our Programs
								</h1>
								<p className="mt-6 text-muted-foreground leading-relaxed">
									Structured, intensive, and strategic preparation designed to guarantee academic excellence and secure your admission into top universities.
								</p>
							</div>

							<div className="relative h-75 w-full overflow-hidden rounded-2xl lg:h-87.5">
								<Image
									src={heroAsset.imageUrl}
									alt={heroAsset.altText}
									fill
									className="object-cover"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Programs Section */}
				<section className="bg-background py-16 lg:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-8 lg:grid-cols-2">
							{/* O-Level Preparation Card */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-muted p-2">
										<BookOpen className="h-5 w-5 text-foreground" />
									</div>
									<h2 className="text-2xl font-bold text-foreground">
										O-Level Preparation
									</h2>
								</div>
								<p className="mt-4 text-muted-foreground leading-relaxed">
									Comprehensive foundational coaching designed to ensure outstanding performance across all major West African secondary school certificate examinations. We focus on deep subject mastery rather than rote memorization.
								</p>

								<div className="mt-8 grid grid-cols-3 gap-4">
									<div className="rounded-xl border border-border bg-background p-4 text-center">
										<h3 className="text-lg font-bold text-primary">WAEC</h3>
										<p className="mt-1 text-xs text-muted-foreground uppercase">
											May/June & Nov/Dec
										</p>
									</div>
									<div className="rounded-xl border border-border bg-background p-4 text-center">
										<h3 className="text-lg font-bold text-foreground">NECO</h3>
										<p className="mt-1 text-xs text-muted-foreground uppercase">
											June/July & Nov/Dec
										</p>
									</div>
									<div className="rounded-xl border border-border bg-background p-4 text-center">
										<h3 className="text-lg font-bold text-foreground">GCE</h3>
										<p className="mt-1 text-xs text-muted-foreground uppercase">
											Private Candidates
										</p>
									</div>
								</div>
							</div>

							{/* UTME/JAMB Card */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-primary p-2">
										<Monitor className="h-5 w-5 text-primary-foreground" />
									</div>
									<h2 className="text-2xl font-bold text-foreground">
										UTME / JAMB Training
									</h2>
								</div>
								<p className="mt-4 text-muted-foreground leading-relaxed">
									Master speed, accuracy, and confidence with our intensive Computer-Based Testing (CBT) training program. Students practice in an environment mirroring the exact conditions of the official JAMB examination hall.
								</p>

								<div className="mt-8 space-y-3">
									<div className="flex items-center gap-3 text-sm text-foreground">
										<CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
										<span>Weekly simulated CBT mock exams</span>
									</div>
									<div className="flex items-center gap-3 text-sm text-foreground">
										<CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
										<span>Real-time instant result generation & analytics</span>
									</div>
									<div className="flex items-center gap-3 text-sm text-foreground">
										<CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
										<span>Past questions breakdown (15+ years syllabus coverage)</span>
									</div>
									<div className="flex items-center gap-3 text-sm text-foreground">
										<CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
										<span>Personalized subject combination counseling</span>
									</div>
								</div>
							</div>
						</div>

						{/* Call to action */}
						<div className="mt-16 rounded-2xl bg-slate-900 p-8 sm:p-12 text-center text-white">
							<h3 className="text-2xl sm:text-3xl font-bold">Ready to Start Your Academic Journey?</h3>
							<p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
								Secure your spot in our upcoming exam preparation cohorts. Small class sizes ensure personalized tutor attention.
							</p>
							<div className="mt-6 flex flex-wrap gap-4 justify-center">
								<Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium">
									<Link href="/register">Register Today</Link>
								</Button>
								<Button asChild variant="outline" size="lg" className="border-slate-700 bg-transparent text-white hover:bg-slate-800">
									<Link href="/contact">Inquire for Details</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
