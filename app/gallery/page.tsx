import Image from "next/image"

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-foreground lg:text-5xl">
              Campus Gallery
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Explore the vibrant environment where future leaders are shaped. From our state-of-the-art facilities to dynamic classroom interactions.
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="bg-background pb-16 lg:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {/* First column - large building image */}
              <div className="relative h-125 overflow-hidden rounded-2xl md:row-span-2">
                <Image
                  src="/images/image-5.jpeg"
                  alt="Trailblazers Academy building exterior"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Second column - classroom */}
              <div className="relative h-62.5 overflow-hidden rounded-2xl">
                <Image
                  src="/images/image-1.jpeg"
                  alt="Students in classroom"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Third column - coding */}
              <div className="relative h-62.5 overflow-hidden rounded-2xl">
                <Image
                  src="/images/image-2.jpeg"
                  alt="Students learning to code"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Library - spans 2 columns */}
              <div className="relative h-62.5 overflow-hidden rounded-2xl md:col-span-2">
                <Image
                  src="/images/image-3.jpeg"
                  alt="Student studying in library"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Science lab - tall image */}
              <div className="relative h-75 overflow-hidden rounded-2xl md:row-span-2">
                <Image
                  src="/images/image-4.jpeg"
                  alt="Science laboratory equipment"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Campus */}
              <div className="relative h-62.5 overflow-hidden rounded-2xl">
                <Image
                  src="/images/image-6.jpeg"
                  alt="Students on campus grounds"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Art supplies */}
              <div className="relative h-62.5 overflow-hidden rounded-2xl">
                <Image
                  src="/images/image-1.jpeg"
                  alt="Art supplies and creative workspace"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
