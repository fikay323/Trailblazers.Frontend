import { SummerLessonsBanner } from "@/components/summer-lessons-banner"
import { SummerLessonsSection } from "@/components/summer-lessons-section"
import { Hero, HeroSlide, defaultSlides } from "@/components/hero"
import { ExamPreparation } from "@/components/exam-preparation"
import { Advantages } from "@/components/advantages"
import { Testimonials } from "@/components/testimonials"
import { getSiteAssets } from "@/core/services/siteAssetService"

export default async function HomePage() {
	let heroSlides: HeroSlide[] = defaultSlides;
	try {
		const assets = await getSiteAssets('home');
		if (assets && assets.length > 0) {
			heroSlides = assets.map((a, i) => ({
				id: a.sortOrder || i + 1,
				label: a.title || defaultSlides[i]?.label || `Facility ${i + 1}`,
				description: a.caption || defaultSlides[i]?.description || '',
				image: a.imageUrl || defaultSlides[i]?.image || '/images/image-1.jpeg'
			}));
		}
	} catch {
		heroSlides = defaultSlides;
	}

	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				{/* Summer Lessons Top Announcement Banner */}
				<SummerLessonsBanner />

				<Hero slides={heroSlides} />

				{/* Summer Lessons Feature Section */}
				<SummerLessonsSection />

				<ExamPreparation />
				<Advantages />
				<Testimonials />
			</main>
		</div>
	);
}
