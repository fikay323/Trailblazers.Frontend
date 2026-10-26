import { Metadata } from 'next';
import { getSiteAssets } from '@/core/services/siteAssetService';

export async function generateMetadata(): Promise<Metadata> {
	let ogImageUrl = '/trailblazer.jpeg';
	let ogAlt = 'UTME CBT Mock Exam at Trailblazer Academy';
	try {
		const assets = await getSiteAssets('seo');
		const match = assets.find((a) => a.key === 'seo.og.exam' || a.key === 'seo.og.default');
		if (match?.imageUrl) {
			ogImageUrl = match.imageUrl;
			if (match.altText) ogAlt = match.altText;
		}
	} catch {
		ogImageUrl = '/trailblazer.jpeg';
	}

	return {
		title: 'UTME Mock Exam \u2013 Full CBT Practice Test',
		description:
			'Take a full-length JAMB/UTME CBT mock exam at Trailblazer Academy. Sharpen speed, accuracy, and confidence with our official-standard practice test \u2014 free for enrolled students.',
		alternates: {
			canonical: 'https://trailblazer-academy.com/exam',
		},
		openGraph: {
			title: 'UTME CBT Mock Exam \u2013 Trailblazer Academy Testing Grounds',
			description:
				'Full-length JAMB/UTME CBT simulation built to official exam standards. Practice with real-time scoring and subject breakdowns.',
			url: 'https://trailblazer-academy.com/exam',
			images: [{ url: ogImageUrl, alt: ogAlt }],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'UTME CBT Mock Exam \u2013 Trailblazer Academy Testing Grounds',
			description: 'Full-length JAMB/UTME CBT simulation built to official exam standards.',
			images: [ogImageUrl]
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
