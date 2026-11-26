'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils';

export interface HeroSlideItem {
  id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  image?: {
    url: string;
    publicId?: string;
    alt?: string;
  };
  isActive?: boolean;
}

interface HeroProps {
  sectionData?: {
    title?: string;
    subtitle?: string;
    badgeText?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    images?: Array<{ url: string; alt?: string }>;
    contentData?: {
      slides?: HeroSlideItem[];
    };
  };
}

// Fallback high-luxury default slides (ensures minimum 3 slides always render)
const DEFAULT_SLIDES: HeroSlideItem[] = [
  {
    id: 'default-slide-1',
    title: 'Wear your identity.',
    subtitle: 'AUTUMN / WINTER 2026',
    badgeText: 'New season · AW26 Capsule',
    description: 'Handcrafted Italian leather sneakers, tailored overcoats, and niche extrait de parfum for men and boys. Cash on delivery nationwide.',
    ctaText: 'Shop the Collection',
    ctaLink: '/shop',
    secondaryCtaText: 'Explore Lookbook',
    secondaryCtaLink: '/look/wear-your-identity-aw26',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1800',
      alt: 'Vantero Autumn Winter 2026 Editorial'
    },
    isActive: true
  },
  {
    id: 'default-slide-2',
    title: 'The Architectural Silhouette.',
    subtitle: 'MENSWEAR TAILORING',
    badgeText: 'Limited Atelier Edition',
    description: 'Double-breasted wool overcoats and pleated trousers tailored for the modern Bangladeshi gentleman.',
    ctaText: 'Discover Clothing',
    ctaLink: '/shop?category=clothing',
    secondaryCtaText: 'View Outerwear',
    secondaryCtaLink: '/shop?category=clothing',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1800',
      alt: 'Tailored Luxury Menswear'
    },
    isActive: true
  },
  {
    id: 'default-slide-3',
    title: 'Vulcanized Mastery.',
    subtitle: 'FOOTWEAR SERIES',
    badgeText: 'Bestseller · Court Low',
    description: 'Italian calfskin low-tops designed with reinforced cushioning, durable rubber cupsoles, and hand-finished edges.',
    ctaText: 'Shop Footwear',
    ctaLink: '/shop?category=sneakers',
    secondaryCtaText: 'Inspect Sizing',
    secondaryCtaLink: '/shop?category=sneakers',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1800',
      alt: 'Handcrafted Luxury Sneakers'
    },
    isActive: true
  },
  {
    id: 'default-slide-4',
    title: 'Nocturne Extrait de Parfum.',
    subtitle: 'NICHE ARTISANAL FRAGRANCES',
    badgeText: 'Pure Extrait · 35% Concentration',
    description: 'Rare aged Cambodian oud, smoked birchwood, and dark amber blended for tropical evening longevity.',
    ctaText: 'Explore Fragrances',
    ctaLink: '/shop?category=fragrance',
    secondaryCtaText: 'Olfactory Notes',
    secondaryCtaLink: '/shop?category=fragrance',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1800',
      alt: 'Nocturne Artisanal Extrait de Parfum'
    },
    isActive: true
  }
];

export const isSlideVideo = (slide?: HeroSlideItem): boolean => {
  if (!slide) return false;
  if (slide.mediaType === 'video') return true;
  const url = slide.mediaUrl || slide.image?.url || '';
  return /\.(mp4|webm|mov|ogg)$/i.test(url);
};

export const getSlideMediaUrl = (slide?: HeroSlideItem): string => {
  if (!slide) return '';
  return slide.mediaUrl || slide.image?.url || '';
};

export const Hero: React.FC<HeroProps> = ({ sectionData }) => {
  // Extract slides from contentData, filtering active ones
  const rawSlides = sectionData?.contentData?.slides;
  let activeSlides: HeroSlideItem[] = [];

  if (Array.isArray(rawSlides) && rawSlides.length > 0) {
    activeSlides = rawSlides.filter((s) => s.isActive !== false);
  }

  // Enforce 3 to 5 slides rule on storefront: if fewer than 3, fallback / backfill
  if (activeSlides.length < 3) {
    const combined = [...activeSlides];
    for (const def of DEFAULT_SLIDES) {
      if (combined.length >= 3) break;
      if (!combined.some((s) => s.id === def.id || s.title === def.title)) {
        combined.push(def);
      }
    }
    activeSlides = combined.slice(0, 5);
  } else if (activeSlides.length > 5) {
    activeSlides = activeSlides.slice(0, 5);
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const totalSlides = activeSlides.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Smart Slide Timing:
  // - Images: display for exactly 3 seconds (3000ms), then auto-advance
  // - Videos: play until video onEnded event before auto-advancing
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const current = activeSlides[currentIndex];
    const isVideo = isSlideVideo(current);

    if (isVideo) {
      // Ensure the video plays when slide becomes active
      const vid = videoRefs.current[currentIndex];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }

      // Safety timeout (60s) in case a video cannot fire onEnded
      const safetyTimer = setTimeout(() => {
        nextSlide();
      }, 60000);

      return () => clearTimeout(safetyTimer);
    } else {
      // Image slide: exactly 3 seconds
      const timer = setTimeout(() => {
        nextSlide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isPaused, totalSlides, activeSlides]);

  // Pause / Resume active video on hover
  useEffect(() => {
    const activeVid = videoRefs.current[currentIndex];
    if (activeVid) {
      if (isPaused) {
        activeVid.pause();
      } else {
        activeVid.play().catch(() => {});
      }
    }
  }, [isPaused, currentIndex]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section
      className="relative w-full h-[88vh] min-h-[640px] max-h-[920px] bg-ink-900 overflow-hidden flex items-end select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Carousel"
    >
      {/* Background Slides with Smooth Crossfade */}
      {activeSlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        const isVideo = isSlideVideo(slide);
        const rawUrl = getSlideMediaUrl(slide);
        const resolvedUrl = resolveImageUrl(rawUrl) || DEFAULT_SLIDES[0].image?.url || '';

        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {isVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={resolvedUrl}
                muted
                playsInline
                autoPlay={isCurrent}
                loop={false}
                onEnded={() => {
                  if (isCurrent && !isPaused) {
                    nextSlide();
                  }
                }}
                onError={() => {
                  if (isCurrent) {
                    setTimeout(nextSlide, 3000);
                  }
                }}
                className={`w-full h-full object-cover object-center brightness-[0.90] transition-transform duration-[6000ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              <img
                src={resolvedUrl}
                alt={slide.image?.alt || slide.title}
                className={`w-full h-full object-cover object-center brightness-[0.90] transition-transform duration-[6000ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
              />
            )}
            {/* Scrim Gradients matching Figma */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/40 to-ink-900/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-transparent to-transparent hidden lg:block" />
          </div>
        );
      })}

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 w-full">
        <div className="max-w-2xl text-left space-y-4">
          {/* Overline Badge & Subtitle */}
          <div className="flex flex-wrap items-center gap-2">
            {currentSlide.badgeText && (
              <span className="inline-block px-3 py-1 bg-paper/20 backdrop-blur-md border border-paper/30 text-paper text-xs uppercase tracking-overline font-medium rounded-sm">
                {currentSlide.badgeText}
              </span>
            )}
            {currentSlide.subtitle && (
              <span className="text-[11px] font-mono tracking-widest uppercase text-white font-semibold">
                {currentSlide.subtitle}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-sans leading-[1.05] transition-all duration-500">
            {currentSlide.title}
          </h1>

          {/* Description */}
          {currentSlide.description && (
            <p className="text-sm sm:text-base text-paper/85 max-w-xl font-normal leading-relaxed">
              {currentSlide.description}
            </p>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-4">
            <Link href={currentSlide.ctaLink || '/shop'}>
              <Button variant="primary" size="lg" className="bg-paper text-ink-900 hover:bg-white px-8">
                {currentSlide.ctaText || 'Shop the Collection'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {currentSlide.secondaryCtaText && (
              <Link href={currentSlide.secondaryCtaLink || '/shop'}>
                <Button variant="outline" size="lg" className="border-paper/40 text-paper hover:bg-paper/15 px-7">
                  {currentSlide.secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {/* 1. Left / Right Arrows */}
      <div className="absolute inset-y-0 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={prevSlide}
          className="pointer-events-auto p-2.5 rounded-full bg-ink-900/40 hover:bg-ink-900/80 text-white/80 hover:text-white backdrop-blur border border-white/10 transition-all hover:scale-110 focus:outline-none"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="pointer-events-auto p-2.5 rounded-full bg-ink-900/40 hover:bg-ink-900/80 text-white/80 hover:text-white backdrop-blur border border-white/10 transition-all hover:scale-110 focus:outline-none"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Bottom Right — Dots Navigation */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-30 flex items-center bg-ink-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
        <div className="flex items-center space-x-1.5">
          {activeSlides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => goToSlide(dotIdx)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                dotIdx === currentIndex
                  ? 'w-6 bg-gold-400'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
