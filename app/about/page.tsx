import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Monitor } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Who We Are
                </span>
                <h1 className="mt-6 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
                  Empowering the next generation of{" "}
                  <span className="text-primary">trailblazer.</span>
                </h1>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  Trailblazer Academy, a proud initiative of Edukonsult, stands as a beacon of academic excellence. We are dedicated to providing a nurturing environment where ambition meets expert guidance, preparing students not just for exams, but for lifelong success.
                </p>
                {/* <div className="mt-8 flex gap-4">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Our Mission
                  </Button>
                  <Button variant="outline">Meet Edukonsult</Button>
                </div> */}
              </div>

              <div className="relative">
                <div className="relative h-100 w-full lg:h-125">
                  {/* Background image */}
                  <div className="absolute right-0 top-0 h-87.5 w-[80%] overflow-hidden rounded-2xl">
                    <Image
                      src="/images/image-5.jpeg"
                      alt="Student illustration"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Foreground image */}
                  <div className="absolute bottom-0 left-0 h-62.5 w-[60%] overflow-hidden rounded-2xl border-4 border-background shadow-xl">
                    <Image
                      src="/images/image-3.jpeg"
                      alt="Teacher explaining"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Environment Section */}
        <section className="bg-[#f0f4f8] py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                A Conducive Learning Environment
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Our facilities are intentionally designed to foster focus, collaboration, and technological fluency, ensuring every student has the tools they need to excel.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {/* Large CBT Lab Card */}
              <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
                <div className="relative h-75 w-full">
                  <Image
                    src="/images/image-10.jpeg"
                    alt="Dedicated CBT Lab"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 right-4 rounded-full bg-card p-3 shadow-lg">
                    <Monitor className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground">
                    Dedicated CBT Lab
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Experience the real deal before exam day. Our state-of-the-art Computer-Based Testing (CBT) lab is meticulously designed to mirror standard JAMB environments. Students gain invaluable hands-on practice, reducing test anxiety and improving navigation speed on our modern, lag-free systems.
                  </p>
                </div>
              </div>

              {/* Right column with two cards */}
              <div className="flex flex-col gap-6">
                {/* Modern Classrooms Card */}
                <div className="flex-1 rounded-2xl bg-[#1a2234] p-6 text-white">
                  <div className="mb-4 inline-flex rounded-lg bg-white/10 p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Modern Classrooms</h3>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                    Spacious, air-conditioned rooms designed to minimize distractions and maximize comfort during intensive study sessions.
                  </p>
                </div>

                {/* Focused Quiet Zones Card */}
                <div className="flex-1 rounded-2xl bg-card p-6 shadow-sm">
                  <div className="mb-4 inline-flex rounded-lg bg-muted p-2">
                    <BookOpen className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Focused Quiet Zones
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Dedicated areas equipped with individual study carrels, providing a serene atmosphere essential for deep concentration and review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
