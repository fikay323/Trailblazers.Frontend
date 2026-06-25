import { Metadata } from 'next';

/**
 * Co-located layout for the Contact route.
 *
 * The page itself uses "use client" so it cannot export metadata directly.
 * Next.js App Router allows a route-level layout.tsx (which is a Server Component)
 * to export metadata — this is the idiomatic workaround.
 */
export const metadata: Metadata = {
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
		images: [{ url: '/trailblazer.jpeg', alt: 'Trailblazer Academy campus \u2014 contact us' }],
	},
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
