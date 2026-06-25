import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
});

export const metadata: Metadata = {
	// metadataBase is REQUIRED for Next.js to resolve relative canonical URLs
	// and for OpenGraph images. Without it, canonical tags emit as relative paths.
	metadataBase: new URL('https://trailblazer-academy.com'),

	title: {
		default: 'Trailblazer Academy & Edukonsult – Secure Your University Admission',
		template: '%s | Trailblazer Academy',
	},
	description:
		'Trailblazer Academy offers intensive JAMB, WAEC, NECO & GCE exam coaching in Ibadan. Expert tutors, dedicated CBT labs, and proven results. Enroll today.',

	alternates: {
		canonical: 'https://trailblazer-academy.com/',
	},

	openGraph: {
		type: 'website',
		locale: 'en_NG',
		url: 'https://trailblazer-academy.com/',
		siteName: 'Trailblazer Academy & Edukonsult',
		title: 'Trailblazer Academy & Edukonsult – Secure Your University Admission',
		description:
			'Trailblazer Academy offers intensive JAMB, WAEC, NECO & GCE exam coaching in Ibadan. Expert tutors, dedicated CBT labs, and proven results.',
		images: [
			{
				url: '/trailblazer.jpeg',
				width: 1200,
				height: 630,
				alt: 'Trailblazer Academy & Edukonsult campus',
			},
		],
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Trailblazer Academy & Edukonsult – Secure Your University Admission',
		description:
			'Intensive JAMB, WAEC, NECO & GCE prep in Ibadan. Expert tutors, CBT labs, proven results.',
		images: ['/trailblazer.jpeg'],
	},

	icons: {
		icon: [
			// 96×96 PNG — meets Google's minimum 48×48 recommendation with headroom
			{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
			// SVG favicon — scales perfectly at any resolution
			{ url: '/favicon.svg', type: 'image/svg+xml' },
			// ICO fallback for legacy browsers
			{ url: '/favicon.ico', sizes: '32x32' },
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
		],
		other: [
			{ rel: 'manifest', url: '/site.webmanifest' },
		],
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	// EducationalOrganization JSON-LD — establishes brand authority with Google
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'EducationalOrganization',
		'name': 'Trailblazer Academy & Edukonsult',
		'alternateName': 'Trailblazers Academy',
		'url': 'https://trailblazer-academy.com',
		'logo': {
			'@type': 'ImageObject',
			'url': 'https://trailblazer-academy.com/favicon-96x96.png',
			'width': 96,
			'height': 96,
		},
		'image': 'https://trailblazer-academy.com/trailblazer.jpeg',
		'description':
			'Trailblazer Academy offers intensive JAMB, WAEC, NECO & GCE exam coaching in Ibadan. Expert tutors, dedicated CBT labs, and proven results.',
		'telephone': '+2348165999425',
		'email': 'trailblazeredukonsult@gmail.com',
		'address': {
			'@type': 'PostalAddress',
			'streetAddress': '5 Odo Oba Rd, beside Odo-Oba Mosque, Moniya',
			'addressLocality': 'Ibadan',
			'addressRegion': 'Oyo State',
			'postalCode': '200132',
			'addressCountry': 'NG',
		},
		'contactPoint': {
			'@type': 'ContactPoint',
			'telephone': '+2348165999425',
			'contactType': 'admissions',
			'availableLanguage': 'English',
		},
		'sameAs': [
			'https://www.facebook.com/trailblazeracademy',
			'https://twitter.com/trailblazers',
			'https://linkedin.com/company/trailblazers',
			'https://maps.app.goo.gl/7LV1258gCkycPC1y9',
		],
		'hasOfferCatalog': {
			'@type': 'OfferCatalog',
			'name': 'Exam Preparation Programs',
			'itemListElement': [
				{ '@type': 'Offer', 'itemOffered': { '@type': 'Course', 'name': 'JAMB/UTME Preparation' } },
				{ '@type': 'Offer', 'itemOffered': { '@type': 'Course', 'name': 'WAEC Preparation' } },
				{ '@type': 'Offer', 'itemOffered': { '@type': 'Course', 'name': 'NECO Preparation' } },
				{ '@type': 'Offer', 'itemOffered': { '@type': 'Course', 'name': 'GCE Preparation' } },
			],
		},
	};

	return (
		<html lang="en" className={inter.className}>
			<head>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
				/>
			</head>
			<body>
				<Header />
				{children}
				<Footer />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</body>
		</html>
	);
}