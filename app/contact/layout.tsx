import { Metadata } from 'next';
import { getSiteAssets } from '@/core/services/siteAssetService';

export async function generateMetadata(): Promise<Metadata> {
	let ogImageUrl = '/trailblazer.jpeg';
	let ogAlt = 'Trailblazer Academy campus \u2014 contact us';
	try {
		const assets = await getSiteAssets('seo');
		const match = assets.find((a) => a.key === 'seo.og.contact' || a.key === 'seo.og.default');
		if (match?.imageUrl) {
			ogImageUrl = match.imageUrl;
			if (match.altText) ogAlt = match.altText;
		}
	} catch {
		ogImageUrl = '/trailblazer.jpeg';
	}

	return {
		title: 'Contact Us \u2013 Admissions Enquiries & Campus Location',
		description:
			'Get in touch with Trailblazer Academy & Edukonsult. Visit our campus in Moniya, Ibadan, call our admissions office, or send an online inquiry. We respond within 24 hours.',
		alternates: {
			canonical: 'https://trailblazer-academy.com/contact',
		},
		openGraph: {
			title: 'Contact Trailblazer Academy \u2013 Admissions & Enquiries',
			description:
				'Reach our admissions team by phone, email, or visit us in Moniya, Ibadan. Online inquiry form available \u2014 response within 24 hours.',
			url: 'https://trailblazer-academy.com/contact',
			images: [{ url: ogImageUrl, alt: ogAlt }],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Contact Trailblazer Academy \u2013 Admissions & Enquiries',
			description: 'Reach our admissions team in Moniya, Ibadan. We respond within 24 hours.',
			images: [ogImageUrl]
		}
	};
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
