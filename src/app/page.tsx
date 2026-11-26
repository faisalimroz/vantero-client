'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/storefront/TopBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Hero } from '@/components/storefront/Hero';
import { TrustStrip } from '@/components/storefront/TrustStrip';
import { CategoriesGrid } from '@/components/storefront/CategoriesGrid';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ShopTheLookSection } from '@/components/storefront/ShopTheLookSection';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils';

interface StorefrontData {
  cms: Record<string, any>;
  categories: any[];
  products: any[];
  looks: any[];
  reviews: any[];
}

async function getStorefrontData(): Promise<StorefrontData> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const [cmsRes, categoriesRes, productsRes, looksRes, reviewsRes] = await Promise.all([
      fetch(`${API_URL}/cms/sections`, { cache: 'no-store' }).catch(() => null),
      fetch(`${API_URL}/categories`, { cache: 'no-store' }).catch(() => null),
      fetch(`${API_URL}/products?limit=8`, { cache: 'no-store' }).catch(() => null),
      fetch(`${API_URL}/shop-the-look`, { cache: 'no-store' }).catch(() => null),
      fetch(`${API_URL}/reviews`, { cache: 'no-store' }).catch(() => null),
    ]);

    const cmsData = cmsRes?.ok ? await cmsRes.json() : { sectionMap: {} };
    const categoriesData = categoriesRes?.ok ? await categoriesRes.json() : { categories: [] };
    const productsData = productsRes?.ok ? await productsRes.json() : { products: [] };
    const looksData = looksRes?.ok ? await looksRes.json() : { looks: [] };
    const reviewsData = reviewsRes?.ok ? await reviewsRes.json() : { reviews: [] };

    return {
      cms: cmsData?.sectionMap || {},
      categories: categoriesData?.categories || [],
      products: productsData?.products || [],
      looks: looksData?.looks || [],
      reviews: reviewsData?.reviews || [],
    };
  } catch (error) {
    console.error('Error fetching storefront data:', error);
    return { cms: {}, categories: [], products: [], looks: [], reviews: [] };
  }
}

export default function HomePage() {
  const [storefront, setStorefront] = useState<StorefrontData>({
    cms: {},
    categories: [],
    products: [],
    looks: [],
    reviews: [],
  });
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    let active = true;
    getStorefrontData().then((data) => {
      if (active) {
        setStorefront(data);
        setReviewIndex(0);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const { cms, categories, products, looks, reviews } = storefront;

  const visibleReviewCount = 3;
  const canSlideReviews = reviews.length > visibleReviewCount;

  const handlePrevReview = () => {
    if (!reviews.length) return;
    setReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNextReview = () => {
    if (!reviews.length) return;
    setReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const displayedReviews =
    reviews.length > 0
      ? Array.from(
          { length: Math.min(visibleReviewCount, reviews.length) },
          (_, offset) => reviews[(reviewIndex + offset) % reviews.length]
        )
      : [];

  const heroData = cms['hero'] || {
    title: 'Wear your identity.',
    badgeText: 'New season · Autumn / Winter 2026',
    description: 'Authentic sneakers, shoes, clothing and fragrance for men and boys. Cash on delivery, 7-day exchanges.',
    ctaText: 'Shop the Collection',
    ctaLink: '/shop',
    secondaryCtaText: 'Explore Lookbook',
    secondaryCtaLink: '/look/wear-your-identity-aw26',
  };

  const topBarText =
    cms['top_bar']?.title ||
    'Cash on delivery nationwide · Free delivery in Dhaka over ৳5,000 · 7-day free exchanges';

  const trustStripData = cms['trust_strip']?.contentData;
  const primaryLook = looks[0];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Announcement Bar */}
      {/* <TopBar text={topBarText} /> */}

      {/* Main Navbar */}
      <Navbar transparentOnTop={true} />

      {/* Hero Section */}
   <main className="pt-[68px]">
    <Hero sectionData={heroData} />
    {/* other sections... */}
  </main>

      {/* Trust Strip */}
      <TrustStrip contentData={trustStripData} />

      {/* Featured Categories Grid */}
      <CategoriesGrid
        categories={categories}
        title={cms['featured_categories']?.title || 'Curated Categories'}
        subtitle={cms['featured_categories']?.subtitle || 'Explore the Vantero universe'}
      />

      {/* New Arrivals Shelf */}
      <section className="w-full py-16 lg:py-20 bg-paper border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 text-left">
            <div>
              <p className="text-xs uppercase tracking-overline text-gold-500 font-semibold mb-1">
                {cms['new_arrivals']?.subtitle || 'Fresh drop from AW26'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
                {cms['new_arrivals']?.title || 'New In: Autumn / Winter 2026'}
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="mt-3 sm:mt-0 text-xs font-semibold text-ink-900 uppercase tracking-wider hover:text-gold-500 transition-colors inline-flex items-center"
            >
              View Full Collection <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop the Look Section (Curated Ensemble Bundle) */}
      {primaryLook && <ShopTheLookSection look={primaryLook} />}

      {/* Collector's Edit Editorial Banner */}
      <section className="w-full py-16 lg:py-24 bg-ink-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1600"
            alt="Artisanal Leather"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-sm text-xs uppercase tracking-overline text-gold-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {cms['collectors_edit']?.badgeText || 'Numbered Artisanal Editions'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-sans text-white">
            {cms['collectors_edit']?.title || 'The Collector’s Edit'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-300 max-w-2xl mx-auto leading-relaxed">
            {cms['collectors_edit']?.description ||
              'Hand-dyed hides, rare botanical extraits, and limited batch runs crafted for connoisseurs of understated luxury in Bangladesh.'}
          </p>
          <div className="pt-4">
            <Link href="/shop?category=lifestyle">
              <Button variant="primary" size="lg" className="bg-paper text-ink-900 hover:bg-white px-8">
                {cms['collectors_edit']?.ctaText || 'Discover The Edit'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footwear Shelf */}
      <section className="w-full py-16 lg:py-20 bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 text-left">
            <div>
              <p className="text-xs uppercase tracking-overline text-gold-500 font-semibold mb-1">
                {cms['footwear_shelf']?.subtitle || 'Italian Margom Soles'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
                {cms['footwear_shelf']?.title || 'Essential Footwear'}
              </h2>
            </div>
            <Link
              href="/shop?category=sneakers"
              className="mt-3 sm:mt-0 text-xs font-semibold text-ink-900 uppercase tracking-wider hover:text-gold-500 transition-colors inline-flex items-center"
            >
              All Footwear <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products
              .filter((p: any) => p.category?.slug === 'sneakers' || p.tags?.includes('Sneakers'))
              .slice(0, 4)
              .map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* Verified Reviews / Testimonials (Admin-Controlled & Real-Time) */}
      {displayedReviews.length > 0 && (
        <section className="w-full py-16 lg:py-20 bg-cream/60 border-t border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-center sm:text-left">
              <div>
                <p className="text-xs uppercase tracking-overline text-gold-500 font-semibold mb-1">
                  {cms['reviews_section']?.subtitle || 'Our Clients'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
                  {cms['reviews_section']?.title || 'Client Voices & Editorial Reviews'}
                </h2>
              </div>

              {canSlideReviews && (
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={handlePrevReview}
                    aria-label="Previous review"
                    className="w-10 h-10 rounded-full bg-paper border border-line text-ink-900 hover:bg-ink-900 hover:text-paper hover:border-ink-900 flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextReview}
                    aria-label="Next review"
                    className="w-10 h-10 rounded-full bg-paper border border-line text-ink-900 hover:bg-ink-900 hover:text-paper hover:border-ink-900 flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {displayedReviews.map((review: any, i: number) => {
                const initials = (review.customerName || 'V')
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={`${review._id || i}-${reviewIndex}`}
                    className="p-6 bg-paper border border-line rounded-sm space-y-4 shadow-card flex flex-col justify-between transition-all hover:border-ink-400"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-gold-500">
                          {[...Array(review.rating || 5)].map((_, s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        {review.categoryLabel && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 font-semibold px-2 py-0.5 bg-stone/40 rounded-xs border border-line">
                            {review.categoryLabel}
                          </span>
                        )}
                      </div>

                      {review.title && (
                        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 line-clamp-1">
                          {review.title}
                        </h3>
                      )}

                      <p className="text-xs text-ink-800 leading-relaxed italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-line/60 flex items-center space-x-3">
                      {review.avatarUrl ? (
                        <img
                          src={resolveImageUrl(review.avatarUrl)}
                          alt={review.customerName}
                          className="w-9 h-9 rounded-full object-cover border border-line shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-cream text-gold-600 font-mono font-bold text-xs flex items-center justify-center border border-line shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-ink-900 truncate">
                          {review.customerName}
                        </p>
                        <p className="text-[11px] text-ink-500 truncate">
                          {review.customerLocation}
                          {review.productName && (
                            <> · <span className="text-ink-700 italic">{review.productName}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {canSlideReviews && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                {reviews.map((_: any, dotIdx: number) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setReviewIndex(dotIdx)}
                    aria-label={`Go to review ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dotIdx === reviewIndex
                        ? 'w-6 bg-ink-900'
                        : 'w-1.5 bg-ink-300 hover:bg-ink-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Global Storefront Footer */}
      <Footer footerData={cms['footer']} />
    </div>
  );
}