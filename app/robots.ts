import { MetadataRoute } from 'next';

/**
 * Native Next.js robots.ts — generates /robots.txt at build time.
 *
 * Rules:
 * - All legitimate bots may crawl all public pages.
 * - The /admin/ sub-tree is disallowed for ALL bots to prevent indexing of
 *   internal dashboard pages and sensitive submission data.
 * - The sitemap URL is declared so crawlers can discover all public routes.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				// Allow all well-behaved crawlers on the public site
				userAgent: '*',
				allow: '/',
				disallow: [
					'/admin/',       // Internal dashboard — never index
					'/admin/submissions/', // Belt-and-suspenders for nested paths
				],
			},
		],
		// Explicitly declare the sitemap so Googlebot and others discover it
		// even if they don't follow the standard /sitemap.xml discovery path.
		sitemap: 'https://trailblazer-academy.com/sitemap.xml',
		host: 'https://trailblazer-academy.com',
	};
}
