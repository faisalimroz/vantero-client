import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/storefront/TopBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { OrderTrackingTimeline } from '@/components/storefront/OrderTrackingTimeline';
import { OrderReturnSection } from '@/components/storefront/OrderReturnSection';
import { Button } from '@/components/ui/Button';
import { formatBDT, formatDateTime } from '@/lib/utils';
import { ArrowLeft, MapPin, Package, ShieldCheck } from 'lucide-react';

interface Props {
  params: { orderNumber: string };
}

async function getOrderDetails(orderNumber: string) {
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

export default async function OrderTrackingPage({ params }: Props) {
  const order = await getOrderDetails(params.orderNumber);
  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <TopBar />
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full text-left space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center text-xs font-semibold text-ink-900 hover:text-gold-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Orders
          </Link>
          <span className="font-mono text-xs text-ink-500">
            Registered: {formatDateTime(order.createdAt)}
          </span>
        </div>

        {/* Order Status Header */}
        <div>
          <span className="text-xs uppercase tracking-overline text-gold-500 font-bold">
            Live Package Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 mt-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-ink-600 mt-0.5">
            Payment Method: <strong>Cash on Delivery (COD)</strong> · Amount: <strong>{formatBDT(order.totalAmount)}</strong>
          </p>
        </div>

        {/* Interactive Visual Progress Timeline */}
        <OrderTrackingTimeline
          currentStatus={order.orderStatus}
          timeline={order.trackingTimeline}
          courier={order.courier}
        />

        {/* Post-Delivery Return & Exchange Workflow (Active when Delivered) */}
        <OrderReturnSection order={order} />

        {/* Order Items & Address Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination */}
          <div className="p-5 bg-white border border-line rounded-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-500" /> Delivery Destination
            </h3>
            <p className="text-xs font-bold text-ink-900">{order.shippingAddress?.recipientName}</p>
            <p className="text-xs text-ink-600">{order.shippingAddress?.phone}</p>
            <p className="text-xs text-ink-700">
              {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.district}
            </p>
          </div>

          {/* Items Summary */}
          <div className="p-5 bg-white border border-line rounded-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gold-500" /> Items in Parcel
            </h3>
            <div className="divide-y divide-line/60">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="truncate">
                    <p className="font-semibold text-ink-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-ink-500">
                      Size: {item.size} {item.color && `· ${item.color}`} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-ink-900 ml-2">
                    {formatBDT(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
