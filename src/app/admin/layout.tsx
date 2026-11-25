'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isLoginPage = pathname === '/admin/login';

  // If on /admin/login, bypass sidebar & layout restriction checks
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center text-paper">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest font-mono">Authenticating Vantero Administrator...</span>
        </div>
      </div>
    );
  }

  // Guard: Admin role required
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-ink-900 text-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-ink-800 border border-ink-600 rounded-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-900/40 text-rose-400 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
            Restricted Administrator Zone
          </h1>
          <p className="text-xs text-ink-300 leading-relaxed">
            {user
              ? `Your account (${user.email || user.phone}) is not authorized as an administrator.`
              : 'Administrative login required. Please authenticate with your admin email and password.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/admin/login" className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="md"
                className="w-full"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Admin Login
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="border-ink-500 text-ink-300 hover:text-white w-full">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Storefront
              </Button>
            </Link>
          </div>

          <p className="text-[10px] text-ink-400 font-mono pt-2">
            Seed Credentials: admin@vantero.com / Admin@123456
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col bg-paper min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
