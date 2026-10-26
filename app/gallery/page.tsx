import Image from "next/image"
import { galleryImages, GalleryImage } from "@/lib/gallery-data"
import { cn } from "@/lib/utils"
import { Metadata } from 'next';
import { getSiteAssets, resolveAssetUrl } from '@/core/services/siteAssetService';

export async function generateMetadata(): Promise<Metadata> {
	let ogImageUrl = '/trailblazer.jpeg';
	let ogAlt = 'Trailblazer Academy campus facilities';
	try {
		const assets = await getSiteAssets('seo');
		const match = assets.find((a) => a.key === 'seo.og.gallery' || a.key === 'seo.og.default');
		if (match?.imageUrl) {
			ogImageUrl = match.imageUrl;
			if (match.altText) ogAlt = match.altText;
		}
	} catch {
		ogImageUrl = '/trailblazer.jpeg';
	}

	return {
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
			images: [{ url: ogImageUrl, alt: ogAlt }],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Campus Gallery – Trailblazer Academy & Edukonsult',
			description: 'Explore our CBT labs, modern classrooms, and vibrant campus life in Ibadan.',
			images: [ogImageUrl]
		}
	};
}

export default async function GalleryPage() {
	let images: GalleryImage[] = galleryImages;

	try {
		const galleryAssets = await getSiteAssets('gallery');
		if (galleryAssets && galleryAssets.length > 0) {
			images = galleryAssets.map((asset, index) => {
				let className = 'h-62.5';
				if (asset.metadataJson) {
					try {
						const parsed = JSON.parse(asset.metadataJson);
						if (parsed.className) className = parsed.className;
					} catch {
						className = 'h-62.5';
					}
				} else if (galleryImages[index]?.className) {
					className = galleryImages[index].className!;
				}

				return {
					src: asset.imageUrl,
					alt: asset.altText || asset.title || 'Trailblazer Academy campus',
					className
				};
			});
		}
	} catch {
		images = galleryImages;
	}

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
							{images.map((image, index) => (
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
