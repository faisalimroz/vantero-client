'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';

interface LinkedProduct {
  _id: string;
  product: {
    _id: string;
    title: string;
    slug: string;
    basePrice: number;
    priceCalculation?: {
      finalPrice: number;
      basePrice: number;
      hasDiscount: boolean;
    };
    images?: Array<{ url: string }>;
    variants?: Array<{ size: string; color?: string; stock: number }>;
  };
  hotspot?: {
    top: number;
    left: number;
  };
  customNote?: string;
}

interface ShopTheLookSectionProps {
  look?: {
    _id: string;
    title: string;
    subtitle?: string;
    slug: string;
    description?: string;
    coverImage?: { url: string };
    products?: LinkedProduct[];
  };
}

export const ShopTheLookSection: React.FC<ShopTheLookSectionProps> = ({ look }) => {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedAll, setAddedAll] = useState(false);

  if (!look || !look.products || look.products.length === 0) return null;

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddSingleItem = (lp: LinkedProduct) => {
    const prod = lp.product;
    const size =
      selectedSizes[prod._id] ||
      prod.variants?.find((v) => v.stock > 0)?.size ||
      'One Size';

    const price = prod.priceCalculation?.finalPrice ?? prod.basePrice;

    addToCart({
      productId: prod._id,
      title: prod.title,
      slug: prod.slug,
      image: prod.images?.[0]?.url || '',
      price,
      originalPrice: prod.basePrice,
      size,
      color: prod.variants?.find((v) => v.size === size)?.color || prod.variants?.[0]?.color || '',
      quantity: 1,
    });
  };

  const handleAddAllToBag = () => {
    look.products?.forEach((lp) => {
      handleAddSingleItem(lp);
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2500);
  };

  const totalBundlePrice = look.products.reduce((acc, lp) => {
    const p = lp.product;
    return acc + (p?.priceCalculation?.finalPrice ?? p?.basePrice ?? 0);
  }, 0);

  return (
    <section className="w-full py-16 lg:py-24 bg-pepper border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-left">
          <div>
            <p className="text-xs uppercase tracking-overline text-gold-500 font-semibold mb-1">
              {look.subtitle || 'Shop The Look'}
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-900">
              {look.title}
            </h2>
            {look.description && (
              <p className="text-xs sm:text-sm text-ink-600 max-w-xl mt-2">
                {look.description}
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-ink-500">Complete Ensemble</span>
              <p className="text-lg font-bold text-ink-900 font-mono">
                {formatBDT(totalBundlePrice)}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddAllToBag}
              className="flex items-center space-x-2"
            >
              {addedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 mr-1" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  <span>Add All Pieces</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Lookbook Layout: Visual Lookbook + Item Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lookbook Visual Cover with Hotspot Markers */}
          <div className="lg:col-span-5 relative aspect-[3/4] bg-stone/40 rounded-sm overflow-hidden border border-line shadow-sm">
            <img
              src={resolveImageUrl(look.coverImage?.url) || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200'}
              alt={look.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />

            {/* Hotspots */}
            {look.products.map((lp, idx) => {
              const top = lp.hotspot?.top ?? 30 + idx * 20;
              const left = lp.hotspot?.left ?? 40 + (idx % 2) * 15;
              return (
                <div
                  key={lp._id || idx}
                  className="absolute z-10 group"
                  style={{ top: `${top}%`, left: `${left}%` }}
                >
                  <button className="w-6 h-6 rounded-full bg-white/95 text-ink-900 font-mono text-[10px] font-bold shadow-lg flex items-center justify-center hover:scale-125 transition-transform">
                    {idx + 1}
                  </button>
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-paper/95 border border-line rounded-sm px-2.5 py-1 text-[11px] font-medium text-ink-900 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {lp.product.title}
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
              <span className="font-semibold">{look.products.length} Curated Pieces</span> in this look
            </div>
          </div>

          {/* Linked Products List & Size Pickers */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {look.products.map((lp, idx) => {
              const p = lp.product;
              if (!p) return null;
              const price = p.priceCalculation?.finalPrice ?? p.basePrice;
              const hasDiscount = p.priceCalculation?.hasDiscount ?? false;
              const selectedSize = selectedSizes[p._id] || p.variants?.[0]?.size || '';

              return (
                <div
                  key={p._id || idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-paper border border-line rounded-sm hover:border-ink-500 transition-colors gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Index badge */}
                    <span className="w-5 h-5 rounded-full bg-stone text-ink-700 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Image */}
                    <div className="w-16 h-20 bg-stone/40 rounded-sm overflow-hidden flex-shrink-0">
                      <img
                        src={resolveImageUrl(p.images?.[0]?.url) || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200'}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div>
                      <Link
                        href={`/product/${p.slug}`}
                        className="text-sm font-semibold text-ink-900 hover:text-gold-500 transition-colors line-clamp-1"
                      >
                        {p.title}
                      </Link>
                      {lp.customNote && (
                        <p className="text-[11px] text-ink-500 line-clamp-1 mt-0.5">
                          {lp.customNote}
                        </p>
                      )}
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-xs font-bold text-ink-900 font-mono">
                          {formatBDT(price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-ink-400 line-through font-mono">
                            {formatBDT(p.basePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Selector & Add Single Button */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    {p.variants && p.variants.length > 0 && (
                      <select
                        value={selectedSize}
                        onChange={(e) => handleSizeChange(p._id, e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900 font-mono"
                      >
                        {p.variants.map((v) => (
                          <option key={v.size} value={v.size} disabled={v.stock <= 0}>
                            {v.size} {v.stock <= 0 ? '(Out of stock)' : ''}
                          </option>
                        ))}
                      </select>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSingleItem(lp)}
                      className="whitespace-nowrap"
                    >
                      Add Piece
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
