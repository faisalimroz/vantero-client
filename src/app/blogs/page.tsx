import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { resolveImageUrl, formatDateTime } from '@/lib/utils';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Editorial Journal & Menswear Guides | Vantero Bangladesh',
  description:
    'Discover curated articles on Italian leather craftsmanship, contemporary tailoring, sneaker styling, and artisanal menswear from Vantero Atelier Dhaka.',
  alternates: {
    canonical: 'https://vanterobd.com/blogs',
  },
  openGraph: {
    title: 'Editorial Journal & Menswear Guides | Vantero Bangladesh',
    description:
      'Curated articles on Italian leather craftsmanship, styling guides, and artisanal menswear from Vantero Atelier Dhaka.',
    url: 'https://vanterobd.com/blogs',
    siteName: 'Vantero Bangladesh',
    locale: 'en_BD',
    type: 'website',
  },
};

async function getBlogs(): Promise<any[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.blogs || [];
  } catch (e) {
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-12">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
        {/* Header Hero */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-[1px] bg-gold-500" />
            <span className="text-xs uppercase tracking-overline text-gold-500 font-bold">
              The Vantero Journal
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-900 tracking-tight">
            Craftsmanship, Style & Satorial Culture
          </h1>
          <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
            Explorations into Italian leather heritage, wardrobe curation, minimalist design philosophy, and contemporary menswear crafted for Dhaka and beyond.
          </p>
        </div>

        {/* Featured / Articles Grid */}
        {blogs.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-line rounded-sm bg-cream/40 space-y-3">
            <BookOpen className="w-8 h-8 text-ink-400 mx-auto" />
            <h3 className="text-base font-bold text-ink-900">Articles Coming Soon</h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              Our editorial team is crafting new sartorial guides and leather care insights. Check back shortly.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-700"
              >
                Explore Footwear & Apparel <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, idx) => (
              <article
                key={blog._id || idx}
                className="group flex flex-col bg-white border border-line rounded-sm overflow-hidden hover:shadow-card hover:border-gold-300 transition-all duration-300"
              >
                <Link href={`/blogs/${blog.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-cream">
                  {blog.coverImage ? (
                    <img
                      src={resolveImageUrl(blog.coverImage)}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-300">
                      <BookOpen className="w-12 h-12 stroke-[1]" />
                    </div>
                  )}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-ink-900/80 backdrop-blur-sm text-paper text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs">
                        {blog.tags[0]}
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[11px] text-ink-400 font-mono">
                      <span>{blog.author || 'Vantero Editorial'}</span>
                      <span>·</span>
                      <span>{formatDateTime(blog.publishedAt || blog.createdAt)}</span>
                    </div>
                    <Link href={`/blogs/${blog.slug}`} className="block">
                      <h2 className="text-lg font-serif font-bold text-ink-900 group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug">
                        {blog.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-ink-600 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-line/60 flex items-center justify-between">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center text-xs font-semibold text-ink-900 group-hover:text-gold-600 uppercase tracking-wider transition-colors"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                    {blog.tags && blog.tags.length > 1 && (
                      <span className="text-[10px] font-mono text-ink-400">
                        +{blog.tags.length - 1} more tags
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
