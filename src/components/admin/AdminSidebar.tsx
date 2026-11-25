'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  LogOut,
  ShieldCheck,
  RotateCcw,
  Star,
  Scale,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Analytics & Revenue', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Storefront CMS', href: '/admin/cms', icon: FileText },
    { name: 'Customer Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Legal Policies', href: '/admin/policies', icon: Scale },
    { name: 'Categories & Sub', href: '/admin/categories', icon: FolderTree },
    { name: 'Products & Discounts', href: '/admin/products', icon: Package },
    { name: 'Shop The Look', href: '/admin/shop-the-look', icon: Layers },
    { name: 'Orders & Tracking', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Returns & Exchanges', href: '/admin/returns', icon: RotateCcw },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="w-64 bg-ink-900 text-paper min-h-screen flex flex-col justify-between border-r border-ink-800 flex-shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-ink-800">
          <Link href="/admin" className="block text-left">
            <span className="text-xl font-bold tracking-[0.25em] text-white uppercase font-sans">
              VANTERO
            </span>
            <span className="block text-[10px] text-gold-500 uppercase tracking-widest font-mono mt-0.5">
              Control Panel · AW26
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 text-left">
          {navigation.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition-all ${
                  active
                    ? 'bg-gold-500 text-white font-semibold shadow-sm'
                    : 'text-ink-300 hover:text-white hover:bg-ink-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Exit */}
      <div className="p-4 border-t border-ink-800 space-y-3 text-left">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 text-xs text-ink-300 hover:text-white hover:bg-ink-800 rounded-sm transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> View Storefront
          </span>
          <span className="text-[10px] text-gold-500 font-mono">Live</span>
        </Link>

        <div className="px-3.5 py-2 bg-ink-800/80 rounded-sm flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-gold-500 font-mono uppercase tracking-wider">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-ink-400 hover:text-rose-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
