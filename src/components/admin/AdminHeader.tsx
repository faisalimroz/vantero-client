'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, actions }) => {
  const { user } = useAuth();

  return (
    <header className="w-full bg-paper border-b border-line px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {actions}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-cream border border-line hover:border-ink-500 rounded-sm text-ink-900 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Storefront
        </Link>
      </div>
    </header>
  );
};
