'use client';

import React from 'react';
import { CreditCard, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

interface TrustItem {
  icon?: string;
  title: string;
  subtitle: string;
}

interface TrustStripProps {
  contentData?: {
    items?: TrustItem[];
  };
}

export const TrustStrip: React.FC<TrustStripProps> = ({ contentData }) => {
  const defaultItems = [
    {
      title: 'Cash on delivery',
      subtitle: 'Nationwide · Inspect package at your doorstep',
      icon: 'card',
    },
    {
      title: 'Free delivery in Dhaka',
      subtitle: 'Next day on orders over ৳5,000',
      icon: 'truck',
    },
    {
      title: '7-day free exchanges',
      subtitle: 'Unworn items · our courier collects from you',
      icon: 'return',
    },
    {
      title: 'Authentic, or refunded',
      subtitle: 'Every pair checked by hand in Dhaka',
      icon: 'shield',
    },
  ];

  const items = contentData?.items || defaultItems;

  const renderIcon = (index: number) => {
    switch (index) {
      case 0:
        return <CreditCard className="w-5 h-5 text-gold-500" />;
      case 1:
        return <Truck className="w-5 h-5 text-gold-500" />;
      case 2:
        return <RotateCcw className="w-5 h-5 text-gold-500" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-gold-500" />;
    }
  };

  return (
    <div className="w-full bg-cream border-y border-line py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-3.5 text-left">
            <div className="p-2 bg-paper rounded-sm border border-line flex-shrink-0 mt-0.5">
              {renderIcon(idx)}
            </div>
            <div className="mt-1">
              <h4 className="text-xs font-bold text-ink-900 tracking-tight">{item.title}</h4>
              <p className="text-[11px] text-ink-600 mt-0.5 leading-snug">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
