import Image from "next/image"
import { galleryImages } from "@/lib/gallery-data"
import { cn } from "@/lib/utils"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Gallery – Our Facilities & Learning Environment',
  description:
    'Browse Trailblazer Academy’s campus gallery — state-of-the-art CBT labs, modern classrooms, quiet study zones, and vibrant student life in Ibadan, Oyo State.',
  alternates: {
    canonical: 'https://trailblazer-academy.com/gallery',
  },
  openGraph: {
    title: 'Campus Gallery – Trailblazer Academy & Edukonsult',
    description:
      'Explore our CBT labs, modern classrooms, and vibrant campus life. See why students choose Trailblazer Academy for exam preparation in Ibadan.',
    url: 'https://trailblazer-academy.com/gallery',
    images: [{ url: '/trailblazer.jpeg', alt: 'Trailblazer Academy campus facilities' }],
  },
};

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
              {galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "relative overflow-hidden rounded-2xl",
                    image.className || "h-62.5"
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
