import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'dark' | 'success' | 'outline' | 'discount';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'dark', children, ...props }) => {
  const variants = {
    dark: 'bg-ink-900 text-white',
    gold: 'bg-gold-500 text-white',
    success: 'bg-success text-white',
    outline: 'border border-line text-ink-600 bg-white/80',
    discount: 'bg-ink-900 text-white font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[11px] uppercase tracking-wider rounded-sm font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
