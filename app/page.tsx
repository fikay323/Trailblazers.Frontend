import { SummerLessonsBanner } from "@/components/summer-lessons-banner"
import { SummerLessonsSection } from "@/components/summer-lessons-section"
import { Hero } from "@/components/hero"
import { ExamPreparation } from "@/components/exam-preparation"
import { Advantages } from "@/components/advantages"
import { Testimonials } from "@/components/testimonials"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Summer Lessons Top Announcement Banner — Easily removable when campaign ends */}
        <SummerLessonsBanner />

        <Hero />

        {/* Summer Lessons Feature Section — Easily removable when campaign ends */}
        <SummerLessonsSection />

        <ExamPreparation />
        <Advantages />
        <Testimonials />
      </main>
    </div>
  )
}
