import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { PolicyView } from '@/components/storefront/PolicyView';

export const metadata: Metadata = {
  title: 'Privacy Policy | VANTERO Bangladesh',
  description: 'How Vantero securely collects, processes, and protects your personal identification and delivery information in Bangladesh.'
};

async function getPolicyData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/policies/privacy-policy`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.policy;
  } catch (err) {
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const policy = await getPolicyData();

  const fallback = {
    key: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'Our commitment to safeguarding client information and transactional privacy.',
    summary: 'How Vantero securely collects, processes, and protects your personal identification and delivery information in Bangladesh.',
    content: `### 1. Information Collection
Vantero collects Google authentication details and delivery addresses for courier fulfillment. We do not sell or monetize client data.

### 2. Data Protection
All records are safeguarded with industry-standard encryption at rest and in transit.`,
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
