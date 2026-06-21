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
	title: 'Trailblazer Academy & Edukonsult - Secure Your Admission',
	description: 'Empowering future leaders through intensive preparation, state-of-the-art facilities, and experienced mentorship for JAMB, WAEC, NECO, and GCE exams.',
	icons: {
		icon: [
			{
				url: '/favicon.ico',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/favicon.ico',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/favicon.svg',
				type: 'image/svg+xml',
			},
		],
		apple: '/apple-touch-icon.png',
	},
}

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'EducationalOrganization', // or 'Organization'
		'name': 'Trailblazers Academy',
		'url': 'https://trailblazer-academy.com',
		'logo': 'https://trailblazer-academy.com/trailblazer.jpeg',
		'sameAs': [
			'https://twitter.com/trailblazers',
			'https://linkedin.com/company/trailblazers'
		]
	};

	return (
		<html lang="en" className={inter.className}>
			<head>
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
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