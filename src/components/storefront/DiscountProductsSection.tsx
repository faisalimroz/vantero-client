'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles, Tag, Flame } from 'lucide-react';

interface Props {
  products?: any[];
  title?: string;
  subtitle?: string;
}

export const DiscountProductsSection: React.FC<Props> = ({
  products = [],
  title = 'Privilege Offers & Seasonal Markdowns',
  subtitle = 'Curated luxury designs available at limited-time promotional pricing',
}) => {
  // Filter only products that have an active discount
  const discountedProducts = products.filter((p) => {
    if (p.priceCalculation?.hasDiscount) return true;
    if (
      p.discount &&
      p.discount.discountType &&
      p.discount.discountType !== 'none' &&
      Number(p.discount.discountValue) > 0
    ) {
      return true;
    }
    return false;
  });

  // If no products have an active discount, hide the section cleanly
  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 lg:py-20 bg-cream/50 border-t border-line text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="p-1 rounded-xs bg-rose-100 text-rose-700">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs uppercase tracking-overline text-rose-700 font-bold">
                Limited Time Markdowns
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              {subtitle}
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs font-semibold text-ink-900 uppercase tracking-wider hover:text-gold-600 transition-colors inline-flex items-center"
          >
            Explore All Offers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {discountedProducts.slice(0, 4).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
