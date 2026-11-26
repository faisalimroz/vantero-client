import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { PolicyView } from '@/components/storefront/PolicyView';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy | VANTERO Bangladesh',
  description: 'Official 7-day post-delivery returns, doorstep size exchanges, and Cash on Delivery refunds at Vantero Bangladesh.'
};

async function getPolicyData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/policies/refund-policy`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.policy;
  } catch (err) {
    return null;
  }
}

export default async function RefundPolicyPage() {
  const policy = await getPolicyData();

  const fallback = {
    key: 'refund-policy',
    title: 'Returns & Refund Policy',
    subtitle: 'Transparent 7-day post-delivery returns and seamless doorstep exchanges.',
    summary: 'Clear, client-first guidelines for size exchanges, defect settlements, and Cash on Delivery refunds.',
    content: `### 1. 7-Day Return Guarantee
Clients may request a return or size exchange within 7 days of delivery. Items must be unworn and in original packaging.

### 2. Doorstep Exchange
Our courier collects the item directly from your address and provides the replacement piece without hassle.`,
    lastUpdated: new Date()
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col mt-12">
      <Navbar transparentOnTop={false} />
      <main className="flex-1">
        <PolicyView policy={policy || fallback} />
      </main>
      <Footer />
    </div>
  );
}
