import Image from "next/image"
import Link from "next/link"
import { Users, BookOpen, Monitor, Eye, Target, Award, Shield, Lightbulb, Heart, Zap, Compass, CheckCircle2, Music, Milestone } from "lucide-react"
import { Metadata } from 'next'
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
	title: 'About Us – Motto: Honesty, Integrity & Excellence is our Hallmark',
	description:
		'Discover Trailblazer Academy & Edukonsult — building future trailblazers through excellence in education, dedicated CBT labs, and an expert management team.',
	alternates: {
		canonical: 'https://trailblazer-academy.com/about',
	},
	openGraph: {
		title: 'About Trailblazer Academy & Edukonsult',
		description:
			'Discover our motto, vision, mission, and the management team behind Trailblazer Academy & Edukonsult in Ibadan.',
		url: 'https://trailblazer-academy.com/about',
		images: [{ url: '/trailblazer.jpeg', alt: 'Trailblazer Academy campus' }],
	},
};

const coreValues = [
	{
		title: "Excellence",
		desc: "We strive for outstanding performance in academics and character development.",
		icon: Award,
	},
	{
		title: "Integrity",
		desc: "We uphold honesty, transparency, and moral discipline in all our dealings.",
		icon: Shield,
	},
	{
		title: "Innovation",
		desc: "We embrace modern teaching methods and technology-driven learning.",
		icon: Lightbulb,
	},
	{
		title: "Commitment",
		desc: "We are dedicated to the success and future of every student.",
		icon: Heart,
	},
	{
		title: "Discipline",
		desc: "We promote responsibility, focus, and positive conduct.",
		icon: Zap,
	},
	{
		title: "Leadership",
		desc: "We nurture students to become future leaders and trailblazers.",
		icon: Users,
	},
	{
		title: "Service",
		desc: "We are passionate about contributing positively to society through quality education.",
		icon: Compass,
	},
];

const objectives = [
	"To prepare students excellently for WAEC, NECO, BECE, UTME, and \"A\" Level examinations.",
	"To provide qualitative computer and digital literacy training.",
	"To offer professional academic and career counselling to students and parents.",
	"To guide students in choosing appropriate courses and higher institutions.",
	"To improve students’ academic confidence, performance, and admission opportunities.",
	"To develop morally upright and purpose-driven young people.",
	"To contribute meaningfully to educational advancement and human capital development."
];

const growthPlan = [
	"Full secondary school establishment",
	"CBT centre accreditation",
	"Scholarship foundation",
	"Partnership with institutions",
	"Vocational training units",
];

const managementTeam = [
	{ name: "Dr. Tolulope V. Gbadamosi", title: "Proprietor / Director", initials: "TG" },
	{ name: "Mr. Akintunde S. Gbadamosi", title: "Administrative Officer", initials: "AG" },
	{ name: "Dr. Rotimi Akanni", title: "", initials: "RA" },
	{ name: "Mr. Louise Odunanjo", title: "Accounts Officer", initials: "LO" },
	{ name: "Mr. David Erioluwa Gbadamosi", title: "Management Member", initials: "DG" },
	{ name: "Dr. Oluwatoyin Awolola", title: "Management Member", initials: "OA" },
	{ name: "Miss Boluwatife Ayo", title: "Principal", initials: "BA" },
];

export default function AboutPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="bg-background py-16 lg:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid items-center gap-12 lg:grid-cols-2">
							<div>
								<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
									<span className="h-2 w-2 rounded-full bg-primary" />
									Who We Are
								</span>
								<h1 className="mt-6 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
									Empowering the next generation of{" "}
									<span className="text-primary">trailblazers.</span>
								</h1>
								<p className="mt-6 text-muted-foreground leading-relaxed">
									Trailblazer Academy, a proud initiative of Edukonsult, stands as a beacon of academic excellence. We are dedicated to providing a nurturing environment where ambition meets expert guidance, preparing students not just for exams, but for lifelong success.
								</p>
							</div>

							<div className="relative">
								<div className="relative h-100 w-full lg:h-125">
									{/* Background image */}
									<div className="absolute right-0 top-0 h-87.5 w-[80%] overflow-hidden rounded-2xl">
										<Image
											src="/images/image-5.jpeg"
											alt="Student illustration"
											fill
											className="object-cover"
										/>
									</div>
									{/* Foreground image */}
									<div className="absolute bottom-0 left-0 h-62.5 w-[60%] overflow-hidden rounded-2xl border-4 border-background shadow-xl">
										<Image
											src="/images/image-3.jpeg"
											alt="Teacher explaining"
											fill
											className="object-cover"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Motto & Tagline Banner */}
				<section className="bg-gradient-to-r from-primary to-orange-600 py-12 text-white shadow-inner">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
						<p className="text-sm font-semibold uppercase tracking-widest text-orange-100 mb-2">Our Motto & Tagline</p>
						<h2 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm mb-4">
							"HONESTY, INTEGRITY AND EXCELLENCE IS OUR HALLMARK."
						</h2>
						<div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-xs">
							<span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
							Tagline: Building Future Trailblazers
						</div>
					</div>
				</section>

				{/* Vision & Mission */}
				<section className="bg-background py-16 lg:py-24 border-b border-border/50">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-8 lg:grid-cols-2">
							{/* Vision Card */}
							<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-xs transition-all duration-300 hover:shadow-md">
								<div className="absolute -right-4 -top-4 text-primary/5">
									<Eye className="h-32 w-32" />
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
									<Eye className="h-6 w-6" />
								</div>
								<h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
								<p className="text-muted-foreground leading-relaxed">
									To inspire and nurture future trailblazers through excellence in education, innovation, mentorship, and guidance.
								</p>
							</div>

							{/* Mission Card */}
							<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-xs transition-all duration-300 hover:shadow-md">
								<div className="absolute -right-4 -top-4 text-primary/5">
									<Target className="h-32 w-32" />
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
									<Target className="h-6 w-6" />
								</div>
								<h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
								<p className="text-muted-foreground leading-relaxed">
									To equip learners with the knowledge, skills, confidence, and guidance needed to succeed in examinations, higher education, and life through dedicated teaching and counselling services.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Core Values */}
				<section className="bg-slate-50 py-16 lg:py-24 border-b border-border/50">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
								What We Believe
							</span>
							<h2 className="mt-4 text-3xl font-bold text-foreground lg:text-4xl">Our Core Values</h2>
							<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
								These principles guide every decision, interaction, and learning path we create at Trailblazer Academy.
							</p>
						</div>

						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{coreValues.map((val) => (
								<div key={val.title} className="rounded-2xl border border-border/50 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
									<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<val.icon className="h-5 w-5" />
									</div>
									<h3 className="text-lg font-bold text-foreground">{val.title}</h3>
									<p className="mt-2 text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Organizational Objectives */}
				<section className="bg-background py-16 lg:py-24 border-b border-border/50">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid items-center gap-12 lg:grid-cols-2">
							<div>
								<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
									Our Goals
								</span>
								<h2 className="mt-4 text-3xl font-bold text-foreground lg:text-4xl">
									Organizational Objectives
								</h2>
								<p className="mt-4 text-muted-foreground leading-relaxed">
									Trailblazer Academy & Edukonsult functions on strategic academic and personal development checkpoints designed to raise the bar of secondary and pre-university education in Nigeria.
								</p>
								<div className="mt-8 space-y-4">
									{objectives.map((obj, i) => (
										<div key={i} className="flex items-start gap-3">
											<div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
												<CheckCircle2 className="h-4 w-4" />
											</div>
											<p className="text-foreground font-medium text-sm md:text-base">{obj}</p>
										</div>
									))}
								</div>
							</div>

							<div className="relative overflow-hidden rounded-2xl aspect-video lg:aspect-square">
								<Image
									src="/images/image-10.jpeg"
									alt="Students in classroom"
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
							</div>
						</div>
					</div>
				</section>

				{/* School Anthem */}
				<section className="bg-slate-900 py-16 lg:py-24 text-white">
					<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-6">
							<Music className="h-6 w-6" />
						</div>
						<h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-2">School Anthem</h2>
						<p className="text-orange-400 font-medium tracking-wider uppercase text-sm mb-12">The Voice of Trailblazers</p>

						<div className="grid gap-8 md:grid-cols-2 text-left md:text-center text-lg md:text-xl font-medium text-slate-100 max-w-2xl mx-auto leading-relaxed border-l-2 md:border-l-0 border-primary pl-4 md:pl-0">
							<div className="space-y-2">
								<p>Trailblazers we stand today,</p>
								<p>Guided by knowledge on our way,</p>
								<p>Excellence our noble aim,</p>
								<p>Hard work shall bring us worthy fame.</p>
							</div>
							<div className="space-y-2">
								<p>Wisdom, discipline, and light,</p>
								<p>Leading us toward a bright future,</p>
								<p>Trailblazer Academy we hail,</p>
								<p>With God and truth we shall prevail.</p>
							</div>
						</div>
					</div>
				</section>

				{/* Learning Environment Section */}
				<section className="bg-[#f0f4f8] py-16 lg:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<h2 className="text-3xl font-bold text-foreground lg:text-4xl">
								A Conducive Learning Environment
							</h2>
							<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
								Our facilities are intentionally designed to foster focus, collaboration, and technological fluency, ensuring every student has the tools they need to excel.
							</p>
						</div>

						<div className="mt-12 grid gap-6 lg:grid-cols-2">
							{/* Large CBT Lab Card */}
							<div className="overflow-hidden rounded-2xl bg-card shadow-sm">
								<div className="relative h-75 w-full">
									<Image
										src="/images/image-10.jpeg"
										alt="Dedicated CBT Lab"
										fill
										className="object-cover"
									/>
									<div className="absolute bottom-4 right-4 rounded-full bg-card p-3 shadow-lg">
										<Monitor className="h-5 w-5 text-foreground" />
									</div>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold text-foreground">
										Dedicated CBT Lab
									</h3>
									<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
										Experience the real deal before exam day. Our state-of-the-art Computer-Based Testing (CBT) lab is meticulously designed to mirror standard JAMB environments. Students gain invaluable hands-on practice, reducing test anxiety and improving navigation speed on our modern, lag-free systems.
									</p>
								</div>
							</div>

							{/* Right column with two cards */}
							<div className="flex flex-col gap-6">
								{/* Modern Classrooms Card */}
								<div className="flex-1 rounded-2xl bg-[#1a2234] p-6 text-white">
									<div className="mb-4 inline-flex rounded-lg bg-white/10 p-2">
										<Users className="h-5 w-5 text-white" />
									</div>
									<h3 className="text-xl font-bold">Modern Classrooms</h3>
									<p className="mt-2 text-sm text-gray-300 leading-relaxed">
										Spacious, air-conditioned rooms designed to minimize distractions and maximize comfort during intensive study sessions.
									</p>
								</div>

								{/* Focused Quiet Zones Card */}
								<div className="flex-1 rounded-2xl bg-card p-6 shadow-sm">
									<div className="mb-4 inline-flex rounded-lg bg-muted p-2">
										<BookOpen className="h-5 w-5 text-foreground" />
									</div>
									<h3 className="text-xl font-bold text-foreground">
										Focused Quiet Zones
									</h3>
									<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
										Dedicated areas equipped with individual study carrels, providing a serene atmosphere essential for deep concentration and review.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Future Growth Plan */}
				<section className="bg-background py-16 lg:py-24 border-b border-border/50">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
								Looking Forward
							</span>
							<h2 className="mt-4 text-3xl font-bold text-foreground lg:text-4xl">Future Growth Plan</h2>
							<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
								Our roadmap to expanding horizons and offering deeper, more comprehensive educational opportunities.
							</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
							{growthPlan.map((plan, i) => (
								<div key={i} className="flex gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary dark:bg-orange-950/30">
										<Milestone className="h-5 w-5" />
									</div>
									<div>
										<h3 className="font-bold text-foreground text-lg mb-1">{plan}</h3>
										<p className="text-sm text-muted-foreground">Part of our planned expansions to provide comprehensive support for our student body.</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Management Team */}
				<section className="bg-slate-50 py-16 lg:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
							Our Leadership
						</span>
						<h2 className="mt-4 text-3xl font-bold text-foreground lg:text-4xl">Management Team</h2>
						<p className="mx-auto mt-4 max-w-2xl text-muted-foreground mb-16">
							The visionary leaders driving Trailblazer Academy & Edukonsult's commitment to academic success.
						</p>

						<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto justify-center mb-16">
							{managementTeam.map((member, i) => (
								<div key={i} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
									{/* Avatar Placeholder */}
									<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-orange-600/10 text-2xl font-bold text-primary group-hover:scale-105 transition-transform">
										{member.initials}
									</div>
									<h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
										{member.name}
									</h3>
									{member.title && (
										<p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											{member.title}
										</p>
									)}
								</div>
							))}
						</div>

						{/* Gallery Redirection Button */}
						<div className="flex flex-col items-center justify-center pt-8 border-t border-slate-200">
							<p className="text-muted-foreground text-sm mb-4">Want to see our modern campus and facilities?</p>
							<Link href="/gallery">
								<Button className="bg-primary hover:bg-orange-600 text-white font-semibold text-base px-8 py-5 rounded-md shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer">
									<Users className="h-5 w-5" />
									View Campus Gallery
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}
