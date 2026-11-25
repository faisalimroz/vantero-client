'use client';

import React from 'react';
import Link from 'next/link';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    sku: string;
    basePrice: number;
    discount?: {
      discountType?: string;
      discountValue?: number;
      discountStart?: string;
      discountEnd?: string;
    };
    priceCalculation?: {
      basePrice: number;
      finalPrice: number;
      hasDiscount: boolean;
      discountBadge: string;
      totalStock: number;
      inStock: boolean;
    };
    category?: {
      name: string;
      slug: string;
    };
    images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    variants?: Array<{ size: string; color?: string; stock: number }>;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  // Dynamic price calculation
  let basePrice = product.basePrice || 0;
  let finalPrice = basePrice;
  let hasDiscount = false;
  let discountBadge = '';

  if (product.priceCalculation) {
    basePrice = product.priceCalculation.basePrice;
    finalPrice = product.priceCalculation.finalPrice;
    hasDiscount = product.priceCalculation.hasDiscount;
    discountBadge = product.priceCalculation.discountBadge;
  } else if (
    product.discount &&
    product.discount.discountType !== 'none' &&
    (product.discount.discountValue || 0) > 0
  ) {
    if (product.discount.discountType === 'percentage') {
      const pct = product.discount.discountValue || 0;
      finalPrice = Math.round(basePrice - (basePrice * pct) / 100);
      hasDiscount = true;
      discountBadge = `-${pct}%`;
    } else if (product.discount.discountType === 'flat') {
      const flat = product.discount.discountValue || 0;
      finalPrice = Math.max(0, basePrice - flat);
      hasDiscount = true;
      discountBadge = `৳${flat.toLocaleString()} OFF`;
    }
  }

  const mediaImages = (product as any).media?.filter((m: any) => m.type === 'image') || [];
  const rawPrimary =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    mediaImages[0]?.url ||
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800';

  const rawSecondary = product.images?.[1]?.url || mediaImages[1]?.url || rawPrimary;

  const primaryImage = resolveImageUrl(rawPrimary);
  const secondaryImage = resolveImageUrl(rawSecondary);

  const totalStock =
    product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? 10;
  const inStock = totalStock > 0;

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: finalPrice,
      originalPrice: basePrice,
      size,
      color: product.variants?.find((v) => v.size === size)?.color || product.variants?.[0]?.color || '',
      quantity: 1,
      sku: product.sku
    });
  };

  return (
    <div className="group relative flex flex-col bg-paper text-left transition-all duration-200">
      {/* Product Media Box */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-stone/40 rounded-sm">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Secondary image crossfade on hover */}
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* Dynamic Discount Badge (Top Left) */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="discount" className="bg-ink-900 text-white font-mono text-[10px] px-2 py-0.5 shadow-sm">
              {discountBadge}
            </Badge>
          </div>
        )}

        {/* Out of Stock Ribbon */}
        {!inStock && (
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="px-3 py-1 bg-ink-900 text-paper text-xs uppercase tracking-wider font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add Sizes Hover Bar */}
        {inStock && product.variants && product.variants.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-ink-900/70 via-ink-900/30 to-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10 hidden sm:block">
            <div className="text-[10px] text-white/80 font-medium uppercase tracking-wider mb-1 text-center">
              Quick Add Size
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {product.variants.slice(0, 5).map((v) => (
                <button
                  key={v.size}
                  disabled={v.stock <= 0}
                  onClick={(e) => handleQuickAdd(e, v.size)}
                  className="px-2 py-1 text-[11px] font-mono bg-paper/90 hover:bg-white text-ink-900 rounded-sm disabled:opacity-40 disabled:line-through transition-colors"
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="pt-3.5 pb-1 flex flex-col justify-between flex-1">
        <div>
          {/* Category Tag */}
          {product.category && (
            <p className="text-[11px] font-medium uppercase tracking-overline text-ink-500 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-semibold text-ink-900 tracking-tight hover:text-gold-500 transition-colors line-clamp-1"
          >
            {product.title}
          </Link>
        </div>

        {/* Dynamic Price Display */}
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-sm font-bold text-ink-900 font-mono tracking-tight">
            {formatBDT(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-ink-400 line-through font-mono">
              {formatBDT(basePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
