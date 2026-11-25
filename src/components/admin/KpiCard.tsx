import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'gold' | 'success' | 'alert';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  variant = 'default',
}) => {
  return (
    <div className="bg-paper border border-line rounded-sm p-5 text-left flex flex-col justify-between shadow-card hover:border-ink-500 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
            {title}
          </span>
          <h3 className="text-2xl font-bold font-mono text-ink-900 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className={cn(
            'p-2.5 rounded-sm border',
            variant === 'gold' && 'bg-gold-500/10 border-gold-300 text-gold-500',
            variant === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
            variant === 'alert' && 'bg-amber-50 border-amber-200 text-amber-700',
            variant === 'default' && 'bg-stone border-line text-ink-800'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-ink-500 text-[11px]">{subtitle}</span>}
          {badge && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-cream border border-line text-ink-700">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
