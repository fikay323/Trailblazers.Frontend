import { Metadata } from 'next';
import { getSiteAssets } from '@/core/services/siteAssetService';

export async function generateMetadata(): Promise<Metadata> {
	let ogImageUrl = '/trailblazer.jpeg';
	let ogAlt = 'Register at Trailblazer Academy';
	try {
		const assets = await getSiteAssets('seo');
		const match = assets.find((a) => a.key === 'seo.og.register' || a.key === 'seo.og.default');
		if (match?.imageUrl) {
			ogImageUrl = match.imageUrl;
			if (match.altText) ogAlt = match.altText;
		}
	} catch {
		ogImageUrl = '/trailblazer.jpeg';
	}

	return {
		title: 'Register \u2013 Enroll in JAMB, WAEC, NECO & GCE Programs',
		description:
			'Ready to secure your university admission? Register now at Trailblazer Academy & Edukonsult in Ibadan. Select your program, fill in your details, and begin your exam prep journey.',
		alternates: {
			canonical: 'https://trailblazer-academy.com/register',
		},
		openGraph: {
			title: 'Register at Trailblazer Academy \u2013 Enroll Today',
			description:
				'Sign up for JAMB/UTME, WAEC, NECO, or GCE exam preparation at Trailblazer Academy & Edukonsult. Limited spaces \u2014 enroll now.',
			url: 'https://trailblazer-academy.com/register',
			images: [{ url: ogImageUrl, alt: ogAlt }],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Register at Trailblazer Academy \u2013 Enroll Today',
			description: 'Sign up for JAMB/UTME, WAEC, NECO, or GCE exam prep at Trailblazer Academy.',
			images: [ogImageUrl]
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
