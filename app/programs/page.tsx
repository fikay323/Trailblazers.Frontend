import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookOpen, Monitor, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ProgramsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#f8f9fb] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Academic Pathways
                </span>
                <h1 className="mt-4 text-4xl font-bold text-foreground lg:text-5xl">
                  Our Programs
                </h1>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  Structured, intensive, and strategic preparation designed to guarantee academic excellence and secure your admission into top universities.
                </p>
              </div>

              <div className="relative h-75 w-full overflow-hidden rounded-2xl lg:h-87.5">
                <Image
                  src="/images/image-2.jpeg"
                  alt="Classroom setting"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* O-Level Preparation Card */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <BookOpen className="h-5 w-5 text-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    O-Level Preparation
                  </h2>
                </div>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Comprehensive foundational coaching designed to ensure outstanding performance across all major West African secondary school certificate examinations. We focus on deep subject mastery rather than rote memorization.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <h3 className="text-lg font-bold text-primary">WAEC</h3>
                    <p className="mt-1 text-xs text-muted-foreground uppercase">
                      May/June & Nov/Dec
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <h3 className="text-lg font-bold text-foreground">NECO</h3>
                    <p className="mt-1 text-xs text-muted-foreground uppercase">
                      June/July & Nov/Dec
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <h3 className="text-lg font-bold text-foreground">GCE</h3>
                    <p className="mt-1 text-xs text-muted-foreground uppercase">
                      Private Candidates
                    </p>
                  </div>
                </div>
              </div>

              {/* UTME/JAMB Card */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary p-2">
                    <Monitor className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    UTME/JAMB
                  </h2>
                </div>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Intensive preparation focused on maximizing your score. We combine rigorous syllabus coverage with advanced test-taking strategies.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Intensive subject reviews</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Weekly mock exams</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Monitor className="h-5 w-5 text-foreground" />
                    <span className="text-foreground font-medium">
                      Computer Practice (CBT) Facility
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guidance Section */}
        <section className="bg-[#e8f4fc] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Guidance & Support
                </span>
                <h2 className="mt-6 text-3xl font-bold text-foreground lg:text-4xl">
                  Exam Strategy & Subject Counseling
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {"Success is not just about hard work; it's about direction. Our expert counselors work one-on-one with students to navigate the complexities of university admissions."}
                </p>
              </div>

              <div className="rounded-2xl bg-[#1a2234] p-8 text-white">
                <h3 className="text-xl font-bold">
                  University Course Combinations
                </h3>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  We ensure you select the exact UTME and O-Level subjects required for your dream course, preventing costly mistakes.
                </p>
                <Link href='/contact'>
                  <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                    Book a Counseling Session
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
