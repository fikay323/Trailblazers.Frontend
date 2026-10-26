"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export interface HeroSlide {
	id: number
	label: string
	description: string
	image: string
}

export const defaultSlides: HeroSlide[] = [
	{
		id: 1,
		label: "JAMB/CBT Prep",
		description: "Complete JAMB CBT training with professional guidance.",
		image: "/images/image-7.jpeg",
	},
	{
		id: 2,
		label: "WAEC Classroom",
		description: "Comprehensive WAEC subject lectures and exam prep.",
		image: "/images/image-1.jpeg",
	},
	{
		id: 3,
		label: "NECO & GCE Tutoring",
		description: "Intensive GCE & NECO tutoring for excellent results.",
		image: "/images/image-2.jpeg",
	},
	{
		id: 4,
		label: "Our Classrooms",
		description: "Active, collaborative learning in a productive environment.",
		image: "/images/image-3.jpeg",
	},
	{
		id: 5,
		label: "Focused Study",
		description: "Quiet spaces dedicated to focused self-study.",
		image: "/images/image-5.jpeg",
	},
	{
		id: 6,
		label: "Expert Instructors",
		description: "Learn from experienced tutors dedicated to your academic success.",
		image: "/images/image-6.jpeg",
	},
	{
		id: 7,
		label: "Subject Counseling",
		description: "Guidance on choosing the right JAMB and WAEC subject combinations.",
		image: "/images/image-7.jpeg",
	},
	{
		id: 8,
		label: "Conducive Environment",
		description: "Comfortable, well-ventilated spaces designed to maximize your focus.",
		image: "/images/image-6.jpeg",
	}
]

export interface HeroProps {
	slides?: HeroSlide[]
}

export function Hero({ slides: propSlides }: HeroProps) {
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)
	const slides = propSlides && propSlides.length > 0 ? propSlides : defaultSlides

	useEffect(() => {
		if (!api) {
			return
		}

		setCurrent(api.selectedScrollSnap())

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap())
		})
	}, [api])

	return (
		<section className="relative w-full h-svh overflow-hidden bg-black font-sans">
			{/* Background Carousel */}
			<Carousel
				setApi={setApi}
				opts={{
					align: "start",
					loop: true,
				}}
				className="w-full h-full"
			>
				<CarouselContent className="h-full ml-0">
					{slides.map((slide, index) => (
						<CarouselItem
							key={slide.id}
							className="pl-0 basis-full h-full relative"
						>
							<Image
								src={slide.image}
								alt={slide.label}
								fill
								priority={index === 0}
								className="object-cover"
							/>
							{/* Dim Overlay */}
							<div className="absolute inset-0 bg-black/60 pointer-events-none" />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			{/* Centered Main Content Overlay */}
			<div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto pointer-events-none">
				<h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
					Empowering Leaders of Tomorrow
				</h1>
				<p className="mt-4 text-lg sm:text-xl text-neutral-200 max-w-2xl font-light">
					Join a community dedicated to academic distinction, innovative thinking, and personal growth.
				</p>
				<div className="mt-8 flex flex-wrap gap-4 justify-center pointer-events-auto">
					<Button
						asChild
						size="lg"
						className="bg-primary text-white hover:bg-primary/90 font-medium px-8 py-6 rounded-md shadow-lg transition-transform hover:scale-105"
					>
						<Link href="/programs">
							Explore Programs
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="border-neutral-400 bg-transparent text-white hover:bg-white/20 hover:text-white font-medium px-8 py-6 rounded-md backdrop-blur-xs transition-transform hover:scale-105"
					>
						<Link href="/about">
							Learn More
						</Link>
					</Button>
				</div>
			</div>

			{/* Bottom Left: Floating Slide Indicator & Info Card */}
			<div className="absolute bottom-6 left-4 sm:bottom-10 sm:left-10 z-20 pointer-events-auto max-w-xs sm:max-w-sm">
				<div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl text-white shadow-2xl">
					<div className="flex items-center gap-2 mb-1.5">
						<span className="text-xs font-semibold uppercase tracking-wider text-primary">
							Facility {current + 1} of {slides.length}
						</span>
					</div>
					<h3 className="text-base sm:text-lg font-bold leading-snug">
						{slides[current]?.label}
					</h3>
					<p className="text-xs sm:text-sm text-neutral-300 mt-1 line-clamp-2">
						{slides[current]?.description}
					</p>

					{/* Custom Navigation controls */}
					<div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
						<button
							onClick={() => api?.scrollPrev()}
							className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors"
						>
							Previous
						</button>
						<button
							onClick={() => api?.scrollNext()}
							className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded text-xs font-medium transition-colors"
						>
							Next
						</button>
					</div>
				</div>
			</div>

			{/* Bottom Right: Slide Indicator Dots */}
			<div className="absolute bottom-6 right-4 sm:bottom-10 sm:right-10 z-20 flex gap-2 pointer-events-auto">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => api?.scrollTo(index)}
						className={cn(
							"h-2 rounded-full transition-all duration-300",
							current === index
								? "w-8 bg-primary"
								: "w-2 bg-white/50 hover:bg-white/80"
						)}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</section>
	)
}
