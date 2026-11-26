'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, itemsCount, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const freeThreshold = 5000;
  const remainingFree = Math.max(0, freeThreshold - subtotal);
  const percent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleCheckout = () => {
    if (!user) {
      openAuthModal('/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-12">
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 mb-2">
          Your Shopping Bag
        </h1>
        <p className="text-xs text-ink-500 mb-8">
          {itemsCount} item{itemsCount === 1 ? '' : 's'} selected for Cash on Delivery checkout
        </p>

        {cart.length === 0 ? (
          <div className="p-16 text-center bg-white border border-line rounded-sm space-y-4">
            <p className="text-base font-semibold text-ink-900">Your bag is empty</p>
            <p className="text-xs text-ink-500">Discover handcrafted Italian footwear and tailored wool coats</p>
            <Link href="/shop">
              <Button variant="primary" size="lg" className="mt-2">
                Explore Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free delivery prompt */}
              <div className="p-4 bg-cream border border-line rounded-sm text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-ink-800">
                    <Truck className="w-4 h-4 text-gold-500" />
                    {remainingFree === 0 ? (
                      <span className="text-success font-semibold">Free Delivery unlocked in Dhaka!</span>
                    ) : (
                      <span>
                        Add <strong>{formatBDT(remainingFree)}</strong> more to receive Free Next-Day Delivery in Dhaka
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-ink-500 text-[11px]">{percent}%</span>
                </div>
                <div className="w-full bg-stone h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gold-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                </div>
              </div>

              {/* Items List */}
              <div className="border border-line rounded-sm bg-white divide-y divide-line">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-24 bg-stone/40 rounded-sm overflow-hidden flex-shrink-0">
                        <img src={resolveImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                        <p className="text-xs text-ink-500 mt-0.5">
                          Size: <strong>{item.size}</strong> {item.color && `· Color: ${item.color}`}
                        </p>
                        <p className="text-xs font-mono font-bold text-ink-900 mt-1">
                          {formatBDT(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
                      <div className="flex items-center border border-line rounded-sm bg-paper">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)}
                          className="p-1.5 text-ink-600 hover:text-ink-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono font-semibold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)}
                          className="p-1.5 text-ink-600 hover:text-ink-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <p className="text-sm font-bold font-mono text-ink-900">
                          {formatBDT(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-ink-400 hover:text-rose-500 p-1"
                        title="Remove piece"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-4 bg-white border border-line rounded-sm p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-900 border-b border-line pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs text-ink-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-ink-900 font-semibold">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery in Dhaka</span>
                  <span className="font-mono text-ink-900">
                    {remainingFree === 0 ? 'FREE' : '৳80'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-bold text-ink-900">Cash on Delivery (COD)</span>
                </div>
                <div className="pt-3 border-t border-line flex justify-between text-base font-bold text-ink-900">
                  <span>Estimated Total</span>
                  <span className="font-mono">{formatBDT(subtotal)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center space-x-2 mt-4"
                onClick={handleCheckout}
              >
                <span>Proceed to Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-ink-500 text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                <span>Login required before order placement</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
