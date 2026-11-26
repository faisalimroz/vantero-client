import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { resolveImageUrl, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Clock, Calendar, Tag, Share2, ArrowRight } from 'lucide-react';

interface Props {
  params: { slug: string };
}

async function getBlog(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.blog;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) {
    return {
      title: 'Article Not Found | Vantero Bangladesh',
    };
  }

  const title = blog.metaTitle || `${blog.title} | Vantero Bangladesh`;
  const description =
    blog.metaDescription || blog.excerpt || 'Editorial journal article from Vantero Bangladesh Atelier.';
  const canonicalUrl = `https://vanterobd.com/blogs/${blog.slug}`;
  const imageUrl = blog.coverImage ? resolveImageUrl(blog.coverImage) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Vantero Bangladesh',
      locale: 'en_BD',
      type: 'article',
      publishedTime: blog.publishedAt || blog.createdAt,
      authors: [blog.author || 'Vantero Atelier'],
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  const imageUrl = blog.coverImage ? resolveImageUrl(blog.coverImage) : 'https://vanterobd.com/og-cover.jpg';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    image: [imageUrl],
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
    author: [
      {
        '@type': 'Person',
        name: blog.author || 'Vantero Atelier',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Vantero Bangladesh',
      url: 'https://vanterobd.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vanterobd.com/Frame.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://vanterobd.com/blogs/${blog.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-12">
      {/* Inject Article JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between border-b border-line pb-4 text-xs">
          <Link
            href="/blogs"
            className="inline-flex items-center font-semibold text-ink-700 hover:text-gold-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to All Articles
          </Link>
          <span className="font-mono text-ink-400">
            {formatDateTime(blog.publishedAt || blog.createdAt)}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 bg-cream border border-line rounded-xs text-[11px] font-mono uppercase tracking-wider text-gold-600 font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center space-x-4 text-xs text-ink-500 font-mono pt-2">
            <span>By <strong className="text-ink-900 font-sans">{blog.author || 'Vantero Atelier'}</strong></span>
            <span>·</span>
            <span>Published {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {blog.excerpt && (
            <p className="text-base sm:text-lg text-ink-700 font-serif italic border-l-2 border-gold-500 pl-4 py-1 leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-line shadow-card bg-stone/20">
            <img
              src={resolveImageUrl(blog.coverImage)}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-stone max-w-none text-ink-800 leading-relaxed text-sm sm:text-base space-y-4 font-sans py-4">
          {blog.content ? (
            blog.content.split('\n\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl font-serif font-bold text-ink-900 mt-6 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-2xl font-serif font-bold text-ink-900 mt-8 mb-3">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter((l: string) => l.startsWith('- '));
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 my-3 text-ink-700">
                    {items.map((it: string, i: number) => (
                      <li key={i}>{it.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-ink-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="text-ink-500">Content loading...</p>
          )}
        </article>

        {/* Author & Atelier Footer Card */}
        <div className="p-6 bg-cream border border-line rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600">
              Vantero Editorial & Atelier
            </span>
            <h4 className="text-sm font-bold text-ink-900">
              Crafted in Italy, Curated for Bangladesh
            </h4>
            <p className="text-xs text-ink-600">
              Handmade sneakers, tailored garments, and fine fragrances designed with uncompromising precision.
            </p>
          </div>
          <Link
            href="/shop"
            className="px-4 py-2 bg-ink-900 text-white rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-ink-800 whitespace-nowrap transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
