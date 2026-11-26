'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import { getSiteSettings } from '@/lib/api';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const BagDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, subtotal, itemsCount } = useCart();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    getSiteSettings()
      .then((res) => {
        if (isMounted && res?.success && res.settings) {
          setFreeDeliveryThreshold(res.settings.freeDeliveryThreshold ?? null);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isCartOpen) return null;

  // Free shipping in Dhaka threshold calculation:
  // If threshold is not set, empty, or <= 0, hide/render nothing (blank)
  const hasThreshold = freeDeliveryThreshold !== null && freeDeliveryThreshold > 0;
  const progressPercent = hasThreshold
    ? Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))
    : 0;
  const remainingForFreeShipping = hasThreshold
    ? Math.max(0, freeDeliveryThreshold - subtotal)
    : 0;

  const handleCheckoutClick = () => {
    closeCart();
    if (!user) {
      // Mandatory login: Open auth modal with redirect target to checkout
      openAuthModal('/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-paper border-l border-line shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-line flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold tracking-tight uppercase text-ink-900">
                Shopping Bag
              </h2>
              <span className="text-xs text-ink-500 font-mono">({itemsCount})</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-ink-500 hover:text-ink-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator (Only rendered if threshold > 0) */}
          {hasThreshold && (
            <div className="bg-cream/70 px-5 py-3 border-b border-line text-xs">
              <div className="flex items-center justify-between text-ink-800 mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Truck className="w-3.5 h-3.5 text-gold-500" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-success font-semibold">You unlocked Free Delivery in Dhaka!</span>
                  ) : (
                    <span>
                      Add <strong>{formatBDT(remainingForFreeShipping)}</strong> more for Free Delivery in Dhaka
                    </span>
                  )}
                </span>
                <span className="text-ink-500 font-mono text-[11px]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-stone h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gold-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center text-ink-400">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-medium text-ink-900">Your bag is empty</p>
                  <p className="text-xs text-ink-500 mt-1">Discover handcrafted footwear and luxury tailoring</p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    closeCart();
                    router.push('/shop');
                  }}
                >
                  Explore Collection
                </Button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex space-x-3.5 p-3 bg-white border border-line rounded-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-stone/40 relative rounded-sm overflow-hidden flex-shrink-0">
                    <img
                      src={resolveImageUrl(item.image) || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-semibold text-ink-900 tracking-tight line-clamp-1">
                          {item.title}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-ink-400 hover:text-rose-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-ink-500 mt-1">
                        <span>Size: <strong className="text-ink-800">{item.size}</strong></span>
                        {item.color && (
                          <span>· Color: <strong className="text-ink-800">{item.color}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity Adjuster */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-line/40">
                      <div className="flex items-center border border-line rounded-sm bg-paper">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)}
                          className="p-1 text-ink-600 hover:text-ink-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-ink-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)}
                          className="p-1 text-ink-600 hover:text-ink-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-ink-900 font-mono">
                          {formatBDT(item.price * item.quantity)}
                        </p>
                        {item.originalPrice > item.price && (
                          <p className="text-[10px] text-ink-400 line-through font-mono">
                            {formatBDT(item.originalPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with COD Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-line bg-paper space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-ink-900 font-semibold">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Estimated Delivery</span>
                  <span className="font-mono text-ink-900">
                    {remainingForFreeShipping === 0 ? 'FREE in Dhaka' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-ink-900 pt-2 border-t border-line">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base">{formatBDT(subtotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleCheckoutClick}
              >
                <span>Proceed to Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-ink-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                <span>Strictly Cash on Delivery · No pre-payment required</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
