const advantages = [
  {
    icon: 'groups',
    color: 'text-on-secondary-container',
    bgColor: 'bg-secondary-container',
    title: "Intensive Classroom Tutoring",
    description:
      "Focused, small-group sessions designed to ensure no student is left behind, covering all core syllabus requirements comprehensively.",
  },
  {
    icon: 'desktop_windows',
    color: 'text-primary-container',
    bgColor: 'bg-primary-container/20',
    title: "Standard CBT Practice Lab",
    description:
      "State-of-the-art computer labs simulating exact exam conditions to build confidence and time-management skills.",
  },
  {
    icon: 'psychology',
    color: 'text-on-secondary-container',
    bgColor: 'bg-secondary-container',
    title: "Experienced Tutors",
    description:
      "Learn from seasoned educators with a proven track record of helping students achieve top percentiles.",
  },
]

export function Advantages() {
  return (
    <section className="lg:py-24 bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="text-center">
          <h2 className="text-2xl font-bold md:text-3xl lg:font-h2 lg:text-h2 text-on-background mb-4">
            The Trailblazers Advantage
          </h2>
          <p className="mt-3 font-body-md text-body-md text-tertiary">
            Why students consistently choose us for their crucial exam preparations.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {advantages.map((advantage, index) => (
            <div
              key={advantage.title}
              className="rounded-xl relative overflow-hidden bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {index === 1 && <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full z-0"></div>}
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${advantage.bgColor}`}>
                <span className={`material-symbols-outlined ${advantage.color}`} style={{ fontVariationSettings: 'FILL' }}>{advantage.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {advantage.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
