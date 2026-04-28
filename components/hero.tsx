import Image from "next/image"

export function Hero() {
  return (
    <section className="py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Secure Your Admission with{" "}
              <span className="text-primary">Trailblazers Academy</span>
            </h1>
            <p className="mt-6 text-pretty text-base leading-relaxed text-on-background font-medium sm:text-lg">
              Empowering future leaders through intensive preparation,
              state-of-the-art facilities, and experienced mentorship.
            </p>
            {/* <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Register for the Next Batch
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Learn More
              </Button>
            </div> */}
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/image-3.jpeg"
                alt="Students studying together at Trailblazers Academy"
                width={600}
                height={400}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
