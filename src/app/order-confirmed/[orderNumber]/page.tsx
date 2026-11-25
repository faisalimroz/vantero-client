import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/storefront/TopBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';
import { formatBDT, formatDateTime, resolveImageUrl } from '@/lib/utils';
import { CheckCircle2, Truck, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

interface Props {
  params: { orderNumber: string };
}

async function getOrder(orderNumber: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/orders/track/${orderNumber}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.order;
  } catch (e) {
    return null;
  }
}

export default async function OrderConfirmedPage({ params }: Props) {
  const order = await getOrder(params.orderNumber);
  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <TopBar />
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-14 w-full text-center space-y-8">
        {/* Success Icon & Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-xs uppercase tracking-overline text-gold-500 font-bold">
            Order Confirmed
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
            Thank You for Choosing Vantero
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto">
            Your Cash on Delivery order <strong>{order.orderNumber}</strong> has been registered. Our concierge team is preparing your package.
          </p>
        </div>

        {/* Live Tracking Link Card */}
        <div className="p-6 bg-cream border border-line rounded-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gold-500 font-bold">
              Dispatch & Progress
            </span>
            <h3 className="text-base font-bold text-ink-900">
              Live Order Tracking Available
            </h3>
            <p className="text-xs text-ink-600 mt-0.5">
              Follow every step of your parcel from packaging to doorstep delivery.
            </p>
          </div>
          <Link href={`/account/orders/${order.orderNumber}`}>
            <Button variant="primary" size="md" className="flex items-center space-x-1.5 whitespace-nowrap">
              <span>Track Order Live</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-line rounded-sm p-6 text-left space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-line text-xs">
            <div>
              <span className="text-ink-400">Order Number</span>
              <p className="font-mono font-bold text-ink-900 text-sm mt-0.5">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-ink-400">Order Placed</span>
              <p className="text-ink-900 mt-0.5">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-ink-400">Payment Status</span>
              <p className="font-semibold text-amber-700 mt-0.5">Due on Delivery (Cash)</p>
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="text-xs space-y-1">
            <span className="text-ink-400 font-medium uppercase tracking-wider">
              Shipping Destination
            </span>
            <p className="font-semibold text-ink-900">
              {order.shippingAddress?.recipientName} ({order.shippingAddress?.phone})
            </p>
            <p className="text-ink-600">
              {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.district}
            </p>
          </div>

          {/* Items Purchased */}
          <div className="space-y-3 pt-4 border-t border-line">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Items in Package
            </span>
            <div className="divide-y divide-line/60">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={resolveImageUrl(item.image)} alt="" className="w-12 h-14 object-cover rounded-xs border border-line flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-ink-900">{item.title}</p>
                      <p className="text-[11px] text-ink-500 font-mono">
                        Size: {item.size} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-ink-900">
                    {formatBDT(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-line space-y-1.5 text-xs text-ink-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-ink-900">{formatBDT(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-mono font-semibold text-ink-900">
                {order.deliveryFee === 0 ? 'FREE' : formatBDT(order.deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-line flex justify-between text-base font-bold text-ink-900">
              <span>Total Payable in Cash</span>
              <span className="font-mono text-lg">{formatBDT(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Home Link */}
        <div className="pt-4">
          <Link href="/shop">
            <Button variant="outline" size="md">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
