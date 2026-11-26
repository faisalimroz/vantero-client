import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { PolicyView } from '@/components/storefront/PolicyView';

export const metadata: Metadata = {
  title: 'Terms of Service | VANTERO Bangladesh',
  description: 'Official Terms of Service for Vantero luxury footwear, tailored apparel, and Cash on Delivery acquisitions in Bangladesh.'
};

async function getPolicyData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/policies/terms-of-service`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.policy;
  } catch (err) {
    return null;
  }
}

export default async function TermsOfServicePage() {
  const policy = await getPolicyData();

  const fallback = {
    key: 'terms-of-service',
    title: 'Terms of Service',
    subtitle: 'Standard client agreement for luxury acquisitions and nationwide deliveries in Bangladesh.',
    summary: 'Governing the purchase of handcrafted footwear, tailored menswear, and bespoke fragrances through Vantero Bangladesh.',
    content: `### 1. Introduction & Acceptance
Welcome to Vantero. By accessing our platform or purchasing any item, you agree to comply with our Terms of Service. Vantero operates from Banani, Dhaka, Bangladesh.

### 2. Cash on Delivery (COD) Guarantee
All orders nationwide are delivered with 100% Cash on Delivery. No advance prepayment is required. Customers inspect parcels before payment.

### 3. Governing Law
These terms are governed by the laws of the People's Republic of Bangladesh.`,
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
