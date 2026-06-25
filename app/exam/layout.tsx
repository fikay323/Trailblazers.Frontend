import { Metadata } from 'next';

/**
 * Co-located layout for the Exam route.
 *
 * The page itself uses "use client" so it cannot export metadata directly.
 * This Server Component layout exports metadata for the /exam route.
 */
export const metadata: Metadata = {
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
		images: [{ url: '/trailblazer.jpeg', alt: 'UTME CBT Mock Exam at Trailblazer Academy' }],
	},
	// The exam/testing portal should be indexable to attract organic search for CBT practice
	robots: {
		index: true,
		follow: true,
	},
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
