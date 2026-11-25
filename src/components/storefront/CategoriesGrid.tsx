'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string };
  productCount?: number;
}

interface CategoriesGridProps {
  categories?: CategoryItem[];
  title?: string;
  subtitle?: string;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories = [],
  title = 'Curated Categories',
  subtitle = 'Explore the Vantero universe',
}) => {
  if (categories.length === 0) return null;

  return (
    <section className="w-full py-16 lg:py-20 bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 text-left">
          <div>
            <p className="text-xs uppercase tracking-overline text-gold-500 font-semibold mb-1">
              {subtitle}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              {title}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-ink-900 uppercase tracking-wider hover:text-gold-500 transition-colors inline-flex items-center"
          >
            All Products <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* 5-Column Responsive Grid matching Figma */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-[3/4] bg-stone/50 rounded-sm overflow-hidden border border-line flex flex-col justify-end p-4 text-left transition-all duration-300 hover:shadow-card"
            >
              <img
                src={resolveImageUrl(cat.image?.url) || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/25 to-transparent transition-opacity group-hover:from-ink-900/90" />

              <div className="relative z-10 text-white">
                <h3 className="text-sm font-semibold tracking-tight text-white group-hover:text-gold-300 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-[11px] text-white/70 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
