import { Metadata } from 'next';
import { BlogCatalogClient } from './BlogCatalogClient';

export const metadata: Metadata = {
	title: 'Blog & Knowledge Hub | Trailblazers Academy & Edukonsult',
	description:
		'Expert study guides, JAMB UTME tips, WAEC/NECO strategies, and university admissions advice from seasoned Nigerian educators.',
	openGraph: {
		title: 'Blog & Knowledge Hub | Trailblazers Academy',
		description:
			'Expert study guides, JAMB UTME tips, WAEC/NECO strategies, and university admissions advice.',
		url: 'https://trailblazer-academy.com/blog',
		siteName: 'Trailblazers Academy',
		images: [
			{
				url: '/trailblazer.jpeg',
				width: 800,
				height: 800,
				alt: 'Trailblazers Academy Blog'
			}
		],
		locale: 'en_NG',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Blog & Knowledge Hub | Trailblazers Academy',
		description:
			'Expert study guides, JAMB UTME tips, WAEC/NECO strategies, and university admissions advice.',
		images: ['/trailblazer.jpeg']
	}
};

export default function BlogPage() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<BlogCatalogClient />
		</main>
	);
}
