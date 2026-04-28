import { Hero } from "@/components/hero"
import { ExamPreparation } from "@/components/exam-preparation"
import { Advantages } from "@/components/advantages"
import { Testimonials } from "@/components/testimonials"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />
        <ExamPreparation />
        <Advantages />
        <Testimonials />
      </main>
    </div>
  )
}
