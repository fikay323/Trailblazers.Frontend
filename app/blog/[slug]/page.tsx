import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/core/services/blogService';
import { ArticleClient } from './ArticleClient';

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	try {
		const post = await getPostBySlug(slug);
		if (!post) {
			return {
				title: 'Article Not Found | Trailblazers Academy',
				description: 'The requested article could not be found.'
			};
		}

		const ogImages = post.coverImageUrl
			? [
					{
						url: post.coverImageUrl,
						width: 1200,
						height: 630,
						alt: post.title
					}
			  ]
			: [
					{
						url: '/trailblazer.jpeg',
						width: 800,
						height: 800,
						alt: post.title
					}
			  ];

		return {
			title: `${post.title} | Trailblazers Academy`,
			description: post.excerpt,
			keywords: post.tags,
			authors: [{ name: post.authorName }],
			openGraph: {
				title: post.title,
				description: post.excerpt,
				url: `https://trailblazer-academy.com/blog/${post.slug}`,
				siteName: 'Trailblazers Academy & Edukonsult',
				images: ogImages,
				locale: 'en_NG',
				type: 'article',
				publishedTime: post.publishedAt || post.createdAt,
				modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
				authors: [post.authorName]
			},
			twitter: {
				card: 'summary_large_image',
				title: post.title,
				description: post.excerpt,
				images: post.coverImageUrl ? [post.coverImageUrl] : ['/trailblazer.jpeg']
			}
		};
	} catch {
		return {
			title: 'Blog Article | Trailblazers Academy',
			description: 'Educational insights and study advice from Trailblazers Academy.'
		};
	}
}

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;

	let post = null;
	try {
		post = await getPostBySlug(slug);
	} catch {
		post = null;
	}

	// Structured Data for Google Rich Results (Article Schema)
	const jsonLd = post
		? {
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: post.title,
				description: post.excerpt,
				image: post.coverImageUrl
					? [post.coverImageUrl]
					: ['https://trailblazer-academy.com/trailblazer.jpeg'],
				author: {
					'@type': 'Person',
					name: post.authorName
				},
				publisher: {
					'@type': 'Organization',
					name: 'Trailblazers Academy & Edukonsult',
					logo: {
						'@type': 'ImageObject',
						url: 'https://trailblazer-academy.com/trailblazer.jpeg'
					}
				},
				datePublished: post.publishedAt || post.createdAt,
				dateModified: post.updatedAt || post.publishedAt || post.createdAt,
				mainEntityOfPage: {
					'@type': 'WebPage',
					'@id': `https://trailblazer-academy.com/blog/${post.slug}`
				}
		  }
		: null;

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			{/* JSON-LD Structured Data */}
			{jsonLd && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			)}
			<main className="flex-1">
				<ArticleClient initialPost={post} slug={slug} />
			</main>
		</div>
	);
}
