'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyOrders } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { TopBar } from '@/components/storefront/TopBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';
import { formatBDT, formatDateTime } from '@/lib/utils';
import { ShoppingBag, ArrowRight, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function MyOrdersPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyOrders()
        .then((res) => {
          if (res?.success) setOrders(res.orders || []);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <TopBar />
        <Navbar transparentOnTop={false} />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-ink-900">Sign In to View Orders</h1>
          <p className="text-xs text-ink-500">View real-time delivery timelines and past Cash on Delivery orders.</p>
          <Button variant="primary" size="lg" className="w-full" onClick={() => openAuthModal('/account/orders')}>
            Sign In with Google
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Delivered</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Out for Delivery</span>;
      case 'processing':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Packed</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 bg-stone text-ink-700 border border-line rounded-xs text-[10px] font-bold uppercase tracking-wider">Under Review</span>;
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <TopBar />
      <Navbar transparentOnTop={false} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left">
        <div className="border-b border-line pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Orders & Live Tracking
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              Review order history, download receipts, and follow active dispatches.
            </p>
          </div>
          <Link href="/shop">
            <Button variant="outline" size="sm">Continue Shopping</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-white border border-line rounded-sm animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center bg-white border border-line rounded-sm space-y-4">
            <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center mx-auto text-ink-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink-900">No Orders Placed Yet</p>
              <p className="text-xs text-ink-500 mt-0.5">Explore our footwear and tailoring collections.</p>
            </div>
            <Link href="/shop">
              <Button variant="primary" size="md" className="mt-2">
                Explore Storefront
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-5 bg-white border border-line rounded-sm shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-ink-900">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-[11px] text-ink-400 font-mono">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-ink-600">
                    Destination: {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items?.map((item: any, idx: number) => (
                      <span key={idx} className="text-[11px] text-ink-800 bg-cream px-2 py-0.5 rounded-xs border border-line">
                        {item.title} ({item.size}) × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-6 pt-3 md:pt-0 border-t md:border-t-0 border-line">
                  <div className="text-right">
                    <span className="text-[10px] text-ink-500 uppercase tracking-wider block">
                      Total Payable (COD)
                    </span>
                    <span className="text-base font-bold font-mono text-ink-900">
                      {formatBDT(order.totalAmount)}
                    </span>
                  </div>

                  <Link href={`/account/orders/${order.orderNumber}`}>
                    <Button variant="primary" size="sm" className="flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Live</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
