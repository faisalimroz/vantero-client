'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Play,
  Film
} from 'lucide-react';

interface MediaItem {
  _id?: string;
  url: string;
  type: 'image' | 'video';
  order?: number;
  publicId?: string;
}

interface ProductDetailClientProps {
  product: any;
}

// Color Swatch Hex Map for Bangladeshi & Luxury Menswear Tones
const COLOR_HEX_MAP: Record<string, string> = {
  black: '#1a1a1a',
  charcoal: '#333333',
  'chalk white': '#f5f5f0',
  chalk: '#f5f5f0',
  white: '#ffffff',
  navy: '#1a2b4c',
  blue: '#204080',
  red: '#9e2a2b',
  burgundy: '#6b1d2f',
  brown: '#5e3a24',
  chocolate: '#3d2314',
  tan: '#c29b62',
  beige: '#d9cdb8',
  oatmeal: '#d8cfc4',
  grey: '#7a7a7a',
  gray: '#7a7a7a',
  silver: '#c0c0c0',
  gold: '#b89130',
  olive: '#556b2f',
  green: '#2d5a27',
  khaki: '#b4a682',
  gum: '#b5834b',
  standard: '#8c8c8c'
};

const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] || '#737373';
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart, openCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  /* =========================================================
     1. MEDIA GALLERY STATE (MAX 5 PHOTOS & VIDEOS)
     ========================================================= */
  const mediaItems: MediaItem[] = useMemo(() => {
    const raw = (product.media && product.media.length > 0)
      ? product.media
      : (product.images || []).map((img: any, idx: number) => ({
        url: typeof img === 'string' ? img : img.url,
        type: 'image' as const,
        publicId: img.publicId || '',
        order: idx
      }));

    if (raw.length > 0) {
      return raw.slice(0, 5);
    }

    return [{
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200',
      type: 'image',
      order: 0
    }];
  }, [product.media, product.images]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const handlePrevMedia = () => {
    setActiveMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handleNextMedia = () => {
    setActiveMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0];

  // Primary still image for Cart thumbnail (first 'image' in media)
  const primaryStillImage = useMemo(() => {
    const imgItem = mediaItems.find((m) => m.type === 'image');
    return imgItem?.url || mediaItems[0]?.url;
  }, [mediaItems]);

  /* =========================================================
     2. COLOR + SIZE VARIANT SELECTION LOGIC
     ========================================================= */
  const variants: any[] = product.variants || [];

  // Extract unique colors deduplicated case-insensitively while preserving display case
  const availableColors: string[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variants) {
      const c = (v.color || '').trim();
      if (c) {
        const key = c.toLowerCase();
        if (!map.has(key)) map.set(key, c);
      }
    }
    return Array.from(map.values());
  }, [variants]);

  // Determine initial color: first color that has an in-stock variant
  const initialColor = useMemo(() => {
    if (availableColors.length === 0) return '';
    const inStockVariant = variants.find((v) => v.stock > 0 && (v.color || '').trim());
    if (inStockVariant && inStockVariant.color) {
      const matched = availableColors.find(
        (c) => c.toLowerCase() === inStockVariant.color.trim().toLowerCase()
      );
      if (matched) return matched;
    }
    return availableColors[0];
  }, [availableColors, variants]);

  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  // Filter variants by currently selected color
  const variantsForColor = useMemo(() => {
    if (availableColors.length === 0 || !selectedColor) {
      return variants;
    }
    return variants.filter(
      (v) => (v.color || '').trim().toLowerCase() === selectedColor.toLowerCase()
    );
  }, [variants, availableColors, selectedColor]);

  // Initial size for active color
  const initialSize = useMemo(() => {
    const inStock = variantsForColor.find((v) => v.stock > 0);
    return (inStock || variantsForColor[0])?.size || '';
  }, [variantsForColor]);

  const [selectedSize, setSelectedSize] = useState<string>(initialSize);

  // When color changes, ensure selectedSize exists and prefers an in-stock variant
  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    const newVariants = variants.filter(
      (v) => (v.color || '').trim().toLowerCase() === newColor.toLowerCase()
    );

    // Keep current size if it exists with stock > 0 in the new color
    const currentSizeVariant = newVariants.find((v) => v.size === selectedSize);
    if (currentSizeVariant && currentSizeVariant.stock > 0) {
      return;
    }

    // Otherwise automatically switch to first in-stock size for this color
    const firstInStock = newVariants.find((v) => v.stock > 0);
    const fallbackSize = (firstInStock || newVariants[0])?.size || '';
    setSelectedSize(fallbackSize);
  };

  // Find exact active variant
  const currentVariant = useMemo(() => {
    return (
      variantsForColor.find((v) => v.size === selectedSize) ||
      variantsForColor[0] ||
      null
    );
  }, [variantsForColor, selectedSize]);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Accordions
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  /* =========================================================
     3. DYNAMIC PRICING (WITH VARIANT OVERRIDES)
     ========================================================= */
  let basePrice = product.basePrice || 0;
  let finalPrice = basePrice;
  let hasDiscount = false;
  let discountBadge = '';

  if (product.priceCalculation) {
    basePrice = product.priceCalculation.basePrice;
    finalPrice = product.priceCalculation.finalPrice;
    hasDiscount = product.priceCalculation.hasDiscount;
    discountBadge = product.priceCalculation.discountBadge;
  } else if (product.discount && product.discount.discountType !== 'none') {
    if (product.discount.discountType === 'percentage') {
      const pct = product.discount.discountValue;
      finalPrice = Math.round(basePrice - (basePrice * pct) / 100);
      hasDiscount = true;
      discountBadge = `-${pct}%`;
    } else if (product.discount.discountType === 'flat') {
      const flat = product.discount.discountValue;
      finalPrice = Math.max(0, basePrice - flat);
      hasDiscount = true;
      discountBadge = `৳${flat.toLocaleString()} OFF`;
    }
  }

  // Apply variant-level price adjustment if present
  if (currentVariant?.additionalPrice) {
    finalPrice += currentVariant.additionalPrice;
    basePrice += currentVariant.additionalPrice;
  }

  // Stock check
  const inStock = currentVariant ? currentVariant.stock > 0 : true;

  const handleAddToCart = () => {
    if (!currentVariant && variants.length > 0) return;

    addToCart({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      image: primaryStillImage,
      price: finalPrice,
      originalPrice: basePrice,
      size: selectedSize || currentVariant?.size || 'Free Size',
      color: selectedColor || currentVariant?.color || '',
      quantity,
      sku: currentVariant?.sku || product.sku,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!user) {
      openAuthModal('/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
      {/* =========================================================
          LEFT COLUMN: MULTI-IMAGE & VIDEO GALLERY
          ========================================================= */}
      <div className="lg:col-span-7">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full">
          {/* Desktop Left Vertical Thumbnail Strip (md and up: 76px–84px wide) */}
          {mediaItems.length > 1 && (
            <div className="hidden md:flex flex-col w-[76px] lg:w-[84px] shrink-0 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {mediaItems.map((item, idx) => {
                const isActive = activeMediaIndex === idx;
                return (
                  <button
                    key={item._id || idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-full aspect-[3/4] rounded-sm overflow-hidden transition-all text-left group ${isActive
                        ? 'border-2 border-ink-900 shadow-sm ring-1 ring-ink-900/15 scale-[1.02]'
                        : 'border border-line opacity-75 hover:opacity-100 hover:border-ink-400'
                      }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video
                          src={resolveImageUrl(item.url)}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-ink-900 shadow-xs">
                            <Play className="w-3 h-3 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={resolveImageUrl(item.url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Media Stage (Right Side on Desktop / Top on Mobile) */}
          <div className="relative flex-1 aspect-[4/5] bg-stone-100 rounded-sm overflow-hidden border border-line flex items-center justify-center">
            {currentMedia.type === 'video' ? (
              <video
                key={currentMedia.url}
                src={resolveImageUrl(currentMedia.url)}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                src={resolveImageUrl(currentMedia.url)}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="discount" className="bg-ink-900 text-white font-mono text-xs px-2.5 py-1 shadow-sm">
                  {discountBadge}
                </Badge>
              </div>
            )}

            {/* Circular Prev/Next Arrow Buttons (< and >) */}
            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  aria-label="Previous media slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 shadow-sm hover:bg-white flex items-center justify-center text-ink-900 transition-all z-10 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 -translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  aria-label="Next media slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 shadow-sm hover:bg-white flex items-center justify-center text-ink-900 transition-all z-10 hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 translate-x-0.5" />
                </button>
              </>
            )}

            {/* Media Item Counter Indicator */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-full bg-ink-900/65 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider">
                {activeMediaIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Thumbnail Strip (< md) */}
        {mediaItems.length > 1 && (
          <div className="flex md:hidden space-x-2.5 overflow-x-auto pb-1 mt-3">
            {mediaItems.map((item, idx) => {
              const isActive = activeMediaIndex === idx;
              return (
                <button
                  key={item._id || idx}
                  type="button"
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative w-16 h-20 rounded-sm overflow-hidden flex-shrink-0 transition-all text-left ${isActive
                      ? 'border-2 border-ink-900 shadow-sm'
                      : 'border border-line opacity-75 hover:opacity-100'
                    }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full relative bg-black flex items-center justify-center">
                      <video
                        src={resolveImageUrl(item.url)}
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-ink-900">
                          <Play className="w-2.5 h-2.5 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={resolveImageUrl(item.url)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          RIGHT COLUMN: PRODUCT DETAILS, COLOR + SIZE SELECTORS & ACTIONS
          ========================================================= */}
      <div className="lg:col-span-5 space-y-6">
        {/* Breadcrumb & SKU */}
        <div className="flex items-center space-x-2 text-xs text-ink-500 uppercase tracking-overline">
          <Link href="/" className="hover:text-ink-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-ink-900 transition-colors"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gold-500 font-semibold">{product.sku}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 font-sans">
          {product.title}
        </h1>

        {/* Dynamic Pricing Box */}
        <div className="flex items-baseline space-x-3 p-3.5 bg-cream/70 border border-line rounded-sm">
          <span className="text-2xl font-bold font-mono text-ink-900">
            {formatBDT(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-mono text-ink-400 line-through">
              {formatBDT(basePrice)}
            </span>
          )}
          <span className="text-xs text-ink-500 font-normal ml-auto">
            Cash on Delivery nationwide
          </span>
        </div>

        {/* COLOR VARIANT SELECTOR */}
        {availableColors.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                Color:
                <span className="font-semibold text-ink-800 normal-case">{selectedColor}</span>
              </span>
              <span className="text-ink-400 font-mono text-[11px]">
                {availableColors.length} color{availableColors.length === 1 ? '' : 's'} available
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableColors.map((colorName) => {
                const isSelected = selectedColor.toLowerCase() === colorName.toLowerCase();
                const colorHex = getColorHex(colorName);

                return (
                  <button
                    key={colorName}
                    type="button"
                    onClick={() => handleColorChange(colorName)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-sm border text-xs transition-all ${isSelected
                        ? 'border-ink-900 ring-2 ring-ink-900/10 font-bold bg-white text-ink-900 shadow-xs'
                        : 'border-line hover:border-ink-500 bg-white text-ink-700'
                      }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span>{colorName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SIZE VARIANT SELECTOR (FILTERED BY SELECTED COLOR) */}
        {variantsForColor.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-ink-900">
                Select Size:
              </span>
              <span className="text-ink-500 font-mono text-[11px]">
                {currentVariant?.stock > 0
                  ? `${currentVariant.stock} item(s) in stock`
                  : 'Out of Stock'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {variantsForColor.map((v: any) => {
                const isSelected = selectedSize === v.size;
                const isOut = v.stock <= 0;

                return (
                  <button
                    key={v.size}
                    disabled={isOut}
                    onClick={() => setSelectedSize(v.size)}
                    className={`min-w-[56px] px-3.5 py-2 text-xs font-mono font-medium rounded-sm border transition-all ${isSelected
                        ? 'bg-ink-900 text-white border-ink-900 shadow-sm'
                        : isOut
                          ? 'bg-stone/50 border-line text-ink-300 line-through cursor-not-allowed'
                          : 'bg-white border-line text-ink-900 hover:border-ink-600'
                      }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Adjuster */}
        <div className="flex items-center space-x-4 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-900">
            Quantity:
          </span>
          <div className="flex items-center border border-line rounded-sm bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-ink-600 hover:text-ink-900"
              disabled={quantity <= 1}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-mono font-semibold text-ink-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-ink-600 hover:text-ink-900"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
           <div className="border border-line rounded-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('details')}
              className="w-full p-4 bg-paper flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-900 text-left hover:bg-cream transition-colors"
            >
              <span>Product Details & Craft</span>
              {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordion === 'details' && (
              <div className="p-4 bg-white border-t border-line text-xs text-ink-700 space-y-2">
                <p className="leading-relaxed">{product.description}</p>
                {product.details && product.details.length > 0 && (
                  <ul className="list-disc pl-4 space-y-1 pt-1 text-ink-600">
                    {product.details.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        {/* Action CTAs */}
        <div className="space-y-2.5 pt-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center space-x-2"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 mr-1.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                <span>Add to Bag — {formatBDT(finalPrice * quantity)}</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full border-ink-900 text-ink-900 hover:bg-cream"
            onClick={handleBuyNow}
            disabled={!inStock}
          >
            Order with Cash on Delivery
          </Button>

          <p className="text-[11px] text-center text-ink-500 pt-1">
            Pay upon doorstep inspection · Free next-day delivery in Dhaka over ৳5,000
          </p>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-line text-xs text-ink-800">
          <div className="flex items-center space-x-2 p-2 bg-cream/50 rounded-sm border border-line/60">
            <Truck className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <span>Dhaka Next-Day</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-cream/50 rounded-sm border border-line/60">
            <RotateCcw className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <span>7-Day Free Returns</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-cream/50 rounded-sm border border-line/60">
            <CreditCard className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <span>100% Cash on Delivery</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-cream/50 rounded-sm border border-line/60">
            <ShieldCheck className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <span>Authentic & Verified</span>
          </div>
        </div>

        {/* Accordions */}
        <div className="pt-6 border-t border-line space-y-2">
          {/* Details */}
        

          {/* Delivery & Exchanges */}
          <div className="border border-line rounded-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('shipping')}
              className="w-full p-4 bg-paper flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-900 text-left hover:bg-cream transition-colors"
            >
              <span>Delivery & Free Exchanges</span>
              {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openAccordion === 'shipping' && (
              <div className="p-4 bg-white border-t border-line text-xs text-ink-700 space-y-2">
                <p>
                  <strong>Dhaka Delivery:</strong> Next-day courier dispatch. Free for orders above ৳5,000 (standard fee ৳80).
                </p>
                <p>
                  <strong>Outside Dhaka:</strong> 48 to 72 hours standard courier nationwide (flat fee ৳150).
                </p>
                <p>
                  <strong>7-Day Free Exchanges:</strong> If your size is not perfect, our courier collects the unworn item directly from your address and exchanges it free of charge.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
