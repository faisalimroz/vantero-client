'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Bell,
  CheckCheck,
  ShoppingBag,
  RotateCcw,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, actions }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await getAdminNotifications({ limit: 15 });
      if (res?.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // Ignore polling errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 25000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await markAdminNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error(e);
      }
    }
    setIsOpen(false);
    if (notif.orderNumber) {
      router.push(`/admin/orders?q=${encodeURIComponent(notif.orderNumber)}`);
    } else {
      router.push('/admin/orders');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'RETURN_DELIVERY':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case 'NEW_ORDER':
      default:
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <header className="w-full bg-paper border-b border-line px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {actions}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 bg-cream hover:bg-stone/60 border border-line rounded-sm text-ink-800 hover:text-ink-900 transition-colors"
            title="Admin Notifications"
            aria-label="Admin Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white font-mono shadow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-line rounded-md shadow-2xl z-50 overflow-hidden animate-fadeIn text-left">
              <div className="px-4 py-3 bg-paper border-b border-line flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-ink-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-gold-100 text-gold-800 text-[10px] font-mono font-bold rounded-xs">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center text-[11px] text-ink-500 hover:text-gold-600 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-line/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                        item.isRead ? 'hover:bg-cream/40 bg-white' : 'bg-gold-50/40 hover:bg-gold-50'
                      }`}
                    >
                      <div className="p-2 rounded-xs bg-cream border border-line flex-shrink-0 mt-0.5">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              item.isRead ? 'font-medium text-ink-800' : 'font-bold text-ink-900'
                            }`}
                          >
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-ink-600 mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-ink-400 font-mono mt-1 block">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-paper border-t border-line text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 uppercase tracking-wider"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          )}
        </div>

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
