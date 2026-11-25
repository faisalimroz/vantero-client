import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-tight';

    const variants = {
      primary: 'bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.99] focus:ring-ink-900',
      secondary: 'bg-stone text-ink-900 hover:bg-line active:scale-[0.99] focus:ring-ink-500',
      outline: 'border border-line text-ink-900 bg-transparent hover:bg-cream active:scale-[0.99] focus:ring-ink-900',
      ghost: 'text-ink-900 hover:bg-cream active:scale-[0.99] focus:ring-ink-500',
      gold: 'bg-gold-500 text-white hover:bg-[#A3864F] active:scale-[0.99] focus:ring-gold-500',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99] focus:ring-rose-600',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 rounded-sm',
      md: 'text-sm px-5 py-2.5 rounded-sm',
      lg: 'text-base px-7 py-3.5 rounded-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
