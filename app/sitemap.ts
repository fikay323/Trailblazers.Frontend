import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://trailblazer-academy.com';

    // Use a stable date — update this when content changes significantly
    const lastModified = new Date('2026-06-25');

    return [
        // Core pages — highest priority
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        // Primary landing pages — high priority (drive most conversions)
        {
            url: `${baseUrl}/programs`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/register`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // Secondary landing pages
        {
            url: `${baseUrl}/about`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/exam`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // Supporting content pages
        {
            url: `${baseUrl}/gallery`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        // NOTE: /admin/* routes are intentionally excluded from the sitemap.
        // They are blocked in robots.ts as well.
    ];
}