const exams = [
  { name: "JAMB", icon: 'menu_book' },
  { name: "WAEC", icon: 'school' },
  { name: "NECO", icon: 'history_edu' },
  { name: "GCE", icon: 'workspace_premium' },
]

export function ExamPreparation() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-semibold text-foreground md:text-h3 md:font-h3">
          Expert Preparation For
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {exams.map((exam) => (
            <div
              key={exam.name}
              className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md sm:p-8"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white text-3xl" style={{ fontVariationSettings: 'FILL' }}>{exam.icon}</span>
              </div>
              <span className="text-sm font-semibold text-foreground sm:text-base">
                {exam.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
