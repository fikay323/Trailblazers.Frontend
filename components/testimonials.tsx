import { TrendingUp } from "lucide-react"

const testimonials = [
  {
    name: "Adebayo O.",
    achievement: "Scored 315 in JAMB",
    initial: "A",
    color: "text-on-secondary-container bg-secondary-container",
    quote:
      "The CBT practice sessions were a game-changer. I walked into the exam hall completely familiar with the system.",
  },
  {
    name: "Chioma E.",
    achievement: "Straight A's in WAEC",
    initial: "C",
    color: "bg-primary-container text-white",
    quote:
      "The tutors really took their time to explain difficult concepts. I couldn't have achieved my results without their intensive classes.",
  },
  {
    name: "Musa I.",
    achievement: "Admitted to UNILAG",
    initial: "M",
    color: "text-on-secondary-container bg-secondary-container",
    quote:
      "Trailblazer Academy provided the right environment. The mock exams prepared me for the actual pressure of the day.",
  },
]

export function Testimonials() {
  return (
    <section className="bg-[#1a2234] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-h2 md:text-h2 text-white">
              Proven Success Stories
            </h2>
            <p className="mt-2 text-tertiary-fixed font-body-md text-body-md">
              Our methodology delivers results. Join the ranks of our successful
              alumni.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#252d3d] px-5 py-4">
            <TrendingUp className="h-6 w-6 text-primary-fixed" />
            <div>
              <span className="block text-2xl font-h2 lg:text-h2 font-bold text-primary-fixed">
                Over 250+
              </span>
              <span className="text-sm md:font-label-md md:text-label-md text-tertiary-fixed">JAMB Scores Average</span>
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl bg-[#252d3d] p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${testimonial.color} text-sm font-h3`}
                >
                  {testimonial.initial}
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-tertiary-fixed lg:font-body-md lg:text-body-md">
                    {testimonial.achievement}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed md:font-body-md md:text-body-md text-tertiary-fixed-dim italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
