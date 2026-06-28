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

const slides = [
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

export function Hero() {
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)

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
								className="object-cover"
								priority={index === 0}
							/>
							{/* Overlay for readability */}
							<div className="absolute inset-0 bg-black/60" />

							{/* Right-Middle Slide Specific Content */}
							<div className="absolute top-1/2 -translate-y-1/2 text-center z-10 flex flex-col items-center justify-center w-full px-4">
								<h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 drop-shadow-xl tracking-tight">
									{slide.label}
								</h2>
								<p className="text-xl md:text-2xl text-white/90 drop-shadow-md font-medium leading-snug mb-8 max-w-3xl mx-auto">
									{slide.description}
								</p>
								<Link href="/register">
									<Button className="bg-primary hover:bg-orange-600 text-white font-semibold text-lg px-8 py-6 rounded-md shadow-lg transition-all duration-300">
										Register Now
									</Button>
								</Link>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Side Edges (Overlay): Navigation Arrows */}
				<CarouselPrevious className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 border-white/20 text-white h-12 w-12 md:h-16 md:w-16 backdrop-blur-sm z-20" />
				<CarouselNext className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 border-white/20 text-white h-12 w-12 md:h-16 md:w-16 backdrop-blur-sm z-20" />
			</Carousel>

			{/* Bottom-Center (Overlay): Pagination Dots */}
			<div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => api?.scrollTo(index)}
						className={cn(
							"h-3 w-3 rounded-full transition-all duration-500 ease-out",
							current === index
								? "bg-white w-12 shadow-lg shadow-white/40"
								: "bg-white/40 hover:bg-white/80"
						)}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</section>
	)
}
