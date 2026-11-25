'use client';

import React from 'react';
import { formatDateTime } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, Package, Truck, Check, XCircle } from 'lucide-react';

interface TimelineEntry {
  status: string;
  title: string;
  note?: string;
  timestamp: string;
  updatedBy?: string;
}

interface OrderTrackingTimelineProps {
  currentStatus: string;
  timeline?: TimelineEntry[];
  courier?: {
    name?: string;
    trackingCode?: string;
    trackingUrl?: string;
  };
}

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Packed & Verified', icon: Package },
  { key: 'shipped', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
];

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  currentStatus,
  timeline = [],
  courier,
}) => {
  const isCancelled = currentStatus === 'cancelled';

  // Determine current step index
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="w-full bg-paper border border-line rounded-sm p-6 sm:p-8 text-left space-y-8">
      {/* Courier Banner if assigned */}
      {courier && (courier.name || courier.trackingCode) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cream border border-line rounded-sm gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Assigned Courier</span>
            <p className="text-sm font-bold text-ink-900">{courier.name || 'Express Logistics'}</p>
          </div>
          {courier.trackingCode && (
            <div className="sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Tracking Code</span>
              <p className="text-sm font-mono font-semibold text-ink-900">{courier.trackingCode}</p>
            </div>
          )}
          {courier.trackingUrl && (
            <a
              href={courier.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gold-500 underline hover:text-ink-900"
            >
              Track on Courier Site →
            </a>
          )}
        </div>
      )}

      {/* Visual Step-by-Step Progress Bar */}
      {!isCancelled ? (
        <div className="relative">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative group">
                  {/* Connector Line */}
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 transition-colors ${
                        idx < currentIndex ? 'bg-ink-900' : 'bg-line'
                      }`}
                    />
                  )}

                  {/* Step Bubble */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all ${
                      isPast
                        ? 'bg-ink-900 text-white'
                        : isCurrent
                        ? 'bg-gold-500 text-white ring-4 ring-gold-300/40 animate-pulse'
                        : 'bg-stone text-ink-400 border border-line'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[11px] sm:text-xs mt-2 text-center uppercase tracking-wider font-medium ${
                      isCurrent
                        ? 'text-gold-500 font-bold'
                        : isPast
                        ? 'text-ink-900'
                        : 'text-ink-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm flex items-center space-x-3 text-rose-700">
          <XCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">Order Cancelled</h4>
            <p className="text-xs mt-0.5">This Cash on Delivery order was cancelled. Please contact concierge if this was unexpected.</p>
          </div>
        </div>
      )}

      {/* Detailed Chronological Event Log */}
      <div className="pt-6 border-t border-line space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900">
          Tracking Timeline & Concierge Notes
        </h4>

        {timeline.length === 0 ? (
          <p className="text-xs text-ink-500">Order recorded. Timeline events will appear as status progresses.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-line">
            {timeline.slice().reverse().map((entry, idx) => (
              <div key={idx} className="relative group text-left">
                {/* Dot */}
                <div
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-paper ${
                    idx === 0 ? 'bg-gold-500 ring-2 ring-gold-300' : 'bg-ink-900'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <h5 className="text-xs font-bold text-ink-900 tracking-tight">
                    {entry.title}
                  </h5>
                  <span className="text-[11px] text-ink-500 font-mono">
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>

                {entry.note && (
                  <p className="text-xs text-ink-600 mt-1 leading-relaxed bg-cream/40 p-2 rounded-sm border border-line/60">
                    {entry.note}
                  </p>
                )}

                {entry.updatedBy && (
                  <span className="text-[10px] text-ink-400 italic block mt-0.5">
                    Updated by {entry.updatedBy}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
