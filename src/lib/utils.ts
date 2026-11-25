import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Bangladeshi Taka (BDT ৳)
 */
export function formatBDT(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '৳ 0';
  const num = Number(amount);
  return `৳ ${num.toLocaleString('en-US')}`;
}

/**
 * Format standard date
 */
export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Resolves relative Multer image paths (e.g. /uploads/products/123.jpg)
 * to absolute backend URLs, while preserving external URLs (Unsplash, etc.)
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const backendBase = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
}
