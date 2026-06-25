import { Metadata } from 'next';

/**
 * Co-located layout for the Register route.
 *
 * The page itself uses "use client" so it cannot export metadata directly.
 * This Server Component layout exports metadata for the /register route.
 */
export const metadata: Metadata = {
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
		images: [{ url: '/trailblazer.jpeg', alt: 'Register at Trailblazer Academy' }],
	},
	// Enrollment/registration pages should remain indexable to capture conversion traffic
	robots: {
		index: true,
		follow: true,
	},
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
