"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"

interface Member {
	name: string
	title: string
	image: string
	excerpt: string
	paragraphs: string[]
}

const managementTeam: Member[] = [
	{
		name: "Mr. Akintunde Gbadamosi",
		title: "Proprietor",
		image: "/images/akintunde-gbadamosi.jpeg",
		excerpt: "Akintunde Gbadamosi is an administrator and social protection professional dedicated to moral discipline, leadership development, and academic excellence.",
		paragraphs: [
			"Akintunde Gbadamosi is an administrator, and social development professional with a deep passion for raising godly, disciplined, and academically excellent children. As the proprietor of Trailblazer Academy, he is committed to providing quality education that nurtures intellectual excellence, moral integrity, leadership, and lifelong learning.",
			"With extensive experience in public service, particularly in the field of social protection, Mr. Gbadamosi brings a wealth of knowledge in leadership, community development, and human capacity building. He is also a dedicated Christian leader and teacher who believes that education should shape both character and competence.",
			"Driven by a vision to raise future trailblazers, he is committed to creating a safe, innovative, and inspiring learning environment where every child is empowered to discover their potential, excel academically, and become a positive influence in society."
		]
	},
	{
		name: "Dr. Tolulope Victoria Gbadamosi",
		title: "Proprietress / Founder & Director",
		image: "/images/tolulope-gbadamosi.jpeg",
		excerpt: "Dr. Tolulope Victoria Gbadamosi is an Associate Professor at the University of Ibadan, specializing in teacher education, curriculum innovation, and academic mentoring.",
		paragraphs: [
			"Dr. Tolulope Victoria Gbadamosi is an Associate Professor in the Department of Arts and Social Sciences Education, University of Ibadan, Nigeria. She is an educator, researcher, mentor, and educational consultant with expertise in service learning, entrepreneurship education, teacher education, graduate employability, and curriculum innovation.",
			"With over two decades of experience in teaching, research, and community engagement, she has led several national and international research projects, published widely in reputable journals, and mentored students, teachers, and young professionals.",
			"As the Founder and Director of Trailblazer Academy & Edukonsult, Dr. Gbadamosi is passionate about nurturing excellence through academic mentoring, admission guidance, and leadership development. Guided by her Christian faith, she believes that true education develops both the mind and character. Her mission is to raise a generation of knowledgeable, purpose-driven, and God-fearing leaders who will make a positive impact on society.",
			"Her personal philosophy is simple: \"Excellence is achieved through diligence, integrity, faith in God, and a commitment to lifelong learning.\""
		]
	},
	{
		name: "Mr. Adepoju Adeshola Andrew",
		title: "Head of Academics",
		image: "/images/adeshola-andrew.jpeg",
		excerpt: "Mr. Andrew is an economics education researcher and analyst committed to innovative learning, financial literacy, and educational transformation.",
		paragraphs: [
			"Mr. Adepoju Adeshola Andrew is an educator, researcher, and academic professional with a strong commitment to advancing quality education, research, and community development. He is currently pursuing a PhD in Economics Education at the University of Ibadan, Nigeria, having previously obtained a Master of Science (M.Sc. Ed.) in Economics Education from the same institution. He holds a Bachelor of Science in Education (B.Sc. Ed.) in Economics from Osun State University, Osogbo, and is a certified teacher registered with the Teachers Registration Council of Nigeria (TRCN).",
			"His academic and research interests span Service Learning, Financial Literacy, Money Management, Economics Education, Sustainability Education, Entrepreneurship Education, and Cultural Exchange. He is particularly interested in understanding how education can be used to develop life skills, promote financial responsibility, strengthen entrepreneurial competencies, and support sustainable development.",
			"With teaching experience gained through classroom instruction at both secondary school and tertiary levels, as well as during his National Youth Service Corps (NYSC), he has developed a strong foundation in curriculum delivery, learner engagement, assessment, and educational programme implementation. These experiences have reinforced his passion for creating meaningful learning experiences that connect theory with real-world practice.",
			"Professionally, he serves as a Research Analyst, where he engages in research design, data collection, statistical analysis, project management, and the interpretation of research findings to support evidence-based decision-making. He has also served as a co-investigator on sponsored intervention research projects and have contributed to scholarly discussions through publications and presentations at national and international conferences.",
			"As Head of Academics, he is committed to fostering academic excellence, promoting innovative and research-driven learning, mentoring learners and educators, and developing programmes that equip individuals with the knowledge, skills, and values needed to thrive in an evolving global society. His goal is to contribute to educational transformation through impactful teaching, quality research, and sustainable community engagement."
		]
	},
	{
		name: "Dr. Olurotimi Oladayo Akanni",
		title: "Management Member / Senior Lecturer",
		image: "/images/rotimi-akani.jpeg",
		excerpt: "Dr. Akanni is a Senior Lecturer in Guidance and Counselling at Emmanuel Alayande University, with research focus on positive psychology.",
		paragraphs: [
			"Dr. Olurotimi Oladayo Akanni is a Senior Lecturer in the Department of Special Education and Guidance and Counselling at Emmanuel Alayande University of Education, Oyo. He holds a Ph.D. in Guidance and Counselling from the University of Ilorin and has extensive experience in teaching, research, counselling, and educational leadership.",
			"He has published over 36 journal articles, contributed to academic books, and led TETFund-sponsored research projects. Dr. Akanni is a member of several professional bodies, including the Counselling Association of Nigeria (CASSON) and the Positive Psychology Association of Nigeria.",
			"A passionate educator and mentor, he is committed to promoting academic excellence, career development, and quality education through research, counselling, and community engagement."
		]
	},
	{
		name: "Dr. Oluwatoyin Isaiah Awolola",
		title: "Management Member / Senior Lecturer",
		image: "/images/oluwatoyin-awolola.jpeg",
		excerpt: "Dr. Awolola is a Senior Lecturer in Educational Management at Emmanuel Alayande University, specializing in planning, policy, and administration.",
		paragraphs: [
			"Oluwatoyin Isaiah AWOLOLA is currently a Senior Lecturer in the Department of Educational Management, Emmanuel Alayande University of Education (EAUED), Oyo. His educational qualifications include NCE (1996) St. Andrew’s College of Education, Oyo; B.Ed. Educational Management (Geography) in (2002) University of Ibadan; M.Ed. Educational Management (2007), University of Ibadan; Certificate in Data Applications (2011), Federal College of Education (SPED), Oyo; and Ph. D. Educational Management (Planning and Policy) (2017) University of Ibadan, Ibadan.",
			"Dr. Awolola has attended numerous international educational conferences. In addition, he is a resource educationalist, conference organiser and workshops manager for educational institutions. He specialised in Educational Management with interest in Educational Planning, Policy, Economics and Administration. He is a member of professional association: Education Dialogue Association (EDUDIA), Global Education Network (GEN); Nigeria Association for Educational Administration and Planning (NAEAP); Commonwealth Council for Educational Administration and Management (CCEAM); Higher Education Research and Policy Network (HERPNET); Historians of Education Development Society of Nigeria (HOEDSON); Teachers Registration Council of Nigeria (TRCN); Member of ASUU, EAUED, Oyo, among others. He is an alumni of AGSO ‘91, SACCODIAN ‘96 and University of Ibadan 2022 set among others.",
			"He was awarded ‘Excellent Academic Award’ by GEN in 2021 and “Distinguished Leadership Award” by EDUDIA in 2025. He has authored and co-authored over 65 publications in reputable international and National journals. He was formerly Assistant Financial Director of GEN and currently the Treasurer of SACCODIAN ‘96 and General Secretary of EDUDIA. He is married to Dr. Folasade Aderonke Awolola and blessed with wonderful children."
		]
	},
	{
		name: "Mr. Louis Odubanjo",
		title: "Management Member / Administrator",
		image: "/images/louis-odubanjo.jpeg",
		excerpt: "Mr. Odubanjo is an accomplished education leader, author, and curriculum evaluator, championing transformative schooling models.",
		paragraphs: [
			"Louis Odubanjo is an accomplished education leader, author, and administrator with extensive experience in curriculum development, instructional leadership, teacher mentoring, educational evaluation, and school management. He holds a B.A. in Philosophy, a PGDE, and an M.Ed. in Educational Evaluation, and is a Member of the Chartered College of Teaching (UK). Louis is the author of Ripples in Teacher Education, ComforMIX, and The Education Shift, and co-author of You Are Worth More Than You Think. Renowned for his visionary leadership and integrity, he champions schools as centres of transformation where academic excellence, character development, innovation, and global relevance converge. He is committed to empowering educators, developing future-ready learners, and advancing educational excellence."
		]
	},
	{
		name: "Mr. David Erioluwa Gbadamosi",
		title: "Data Analyst & Management Member",
		image: "/images/david-gbadamosi.jpeg",
		excerpt: "David Gbadamosi is a Data Analyst skilled in business intelligence, SQL, Excel, and Power BI dashboard development.",
		paragraphs: [
			"David Gbadamosi is a Data Analyst skilled in Excel, SQL, Power BI, Business Intelligence, and Data Visualization.",
			"He is a B.Sc. graduate of the Federal University of Agriculture, Abeokuta and currently pursuing a Master's degree at the University of Ibadan. Skilled in data analysis, dashboard development, and business intelligence, with a passion for transforming data into actionable insights that drive informed decision-making."
		]
	}
]

export function ManagementTeam() {
	const [selectedMember, setSelectedMember] = useState<Member | null>(null)

	// Proprietor and Proprietress come first
	const leaders = managementTeam.slice(0, 2)
	// Remaining members
	const members = managementTeam.slice(2)

	return (
		<section className="bg-slate-50 py-16 lg:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
				<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
					Our Leadership
				</span>
				<h2 className="mt-4 text-3xl font-bold text-foreground lg:text-4xl">Management Team</h2>
				<p className="mx-auto mt-4 max-w-2xl text-muted-foreground mb-16">
					The visionary leaders driving Trailblazer Academy & Edukonsult's commitment to academic success.
				</p>

				{/* Primary Leaders (Proprietor and Proprietress) */}
				<div className="grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto mb-16 justify-center">
					{leaders.map((member, i) => (
						<div
							key={i}
							onClick={() => setSelectedMember(member)}
							className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md cursor-pointer"
						>
							<div>
								{/* Photo */}
								<div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-slate-100 shadow-inner">
									<Image
										src={member.image}
										alt={member.name}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
								<h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
									{member.name}
								</h3>
								<p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
									{member.title}
								</p>
								<p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
									{member.excerpt}
								</p>
							</div>
							<div className="mt-6 text-xs font-bold text-primary group-hover:underline flex items-center justify-center gap-1">
								Read Full Bio <ChevronRight className="h-3 w-3" />
							</div>
						</div>
					))}
				</div>

				{/* Remaining Academic and Educational Management Members */}
				<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-5xl mx-auto justify-center mb-16">
					{members.map((member, i) => (
						<div
							key={i}
							onClick={() => setSelectedMember(member)}
							className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md cursor-pointer"
						>
							<div>
								{/* Photo */}
								<div className="relative mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-2 border-slate-100 shadow-inner">
									<Image
										src={member.image}
										alt={member.name}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
								<h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
									{member.name}
								</h3>
								<p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground line-clamp-1">
									{member.title}
								</p>
								<p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
									{member.excerpt}
								</p>
							</div>
							<div className="mt-6 text-xs font-bold text-primary group-hover:underline flex items-center justify-center gap-1">
								Read Full Bio <ChevronRight className="h-3 w-3" />
							</div>
						</div>
					))}
				</div>

				{/* Gallery Redirection Button */}
				<div className="flex flex-col items-center justify-center pt-8 border-t border-slate-200">
					<p className="text-muted-foreground text-sm mb-4">Want to see our modern campus and facilities?</p>
					<Link href="/gallery" className="group">
						<Button className="bg-primary hover:bg-orange-600 text-white font-semibold text-base px-8 py-5 rounded-md shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer">
							<Users className="h-5 w-5" />
							<span>View Campus Gallery</span>
							<ChevronRight className="h-5 w-5 md:opacity-0 md:-translate-x-1 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-300" />
						</Button>
					</Link>
				</div>
			</div>

			<Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
				<DialogContent className="max-w-3xl w-[90%] p-0 overflow-hidden border-none rounded-2xl shadow-2xl bg-card">
					{selectedMember && (
						<div className="flex flex-col md:flex-row w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden">

							{/* Left Column: Full-bleed portrait cover */}
							<div className="relative w-full md:w-2/5 min-h-65 md:min-h-0 shrink-0 self-stretch">
								<Image
									src={selectedMember.image}
									alt={selectedMember.name}
									fill
									className="object-cover object-top"
									priority
								/>
								{/* Gradient overlay for readability */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
								{/* Name + role badge at bottom of photo */}
								<div className="absolute bottom-0 left-0 right-0 p-5">
									<p className="text-white font-extrabold text-xl leading-tight drop-shadow-sm">
										{selectedMember.name}
									</p>
									<span className="mt-1.5 inline-block text-[11px] font-bold uppercase tracking-widest text-orange-300">
										{selectedMember.title}
									</span>
								</div>
							</div>

							{/* Right Column: Biography + Close */}
							<div className="flex-1 flex flex-col min-h-0">
								{/* Hidden header for accessibility (visible info is in photo overlay) */}
								<DialogHeader className="sr-only">
									<DialogTitle>{selectedMember.name}</DialogTitle>
									<DialogDescription>{selectedMember.title}</DialogDescription>
								</DialogHeader>

								{/* Scrollable bio text */}
								<div className="flex-1 overflow-y-auto p-6 md:p-8">
									<div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
										{selectedMember.paragraphs.map((paragraph, index) => (
											<p key={index}>{paragraph}</p>
										))}
									</div>
								</div>

								{/* Static footer with Close button */}
								<div className="shrink-0 px-6 md:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-card">
									<Button
										onClick={() => setSelectedMember(null)}
										className="bg-primary hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-all duration-300 cursor-pointer shadow-md text-sm"
									>
										Close Biography
									</Button>
								</div>
							</div>

						</div>
					)}
				</DialogContent>
			</Dialog>
		</section>
	)
}
