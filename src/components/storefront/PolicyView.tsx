'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Mail, Phone, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PolicyViewProps {
  policy: {
    key: string;
    title: string;
    subtitle?: string;
    summary?: string;
    content: string;
    lastUpdated?: string | Date;
  };
}

export const PolicyView: React.FC<PolicyViewProps> = ({ policy }) => {
  const formattedDate = policy.lastUpdated
    ? new Date(policy.lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  // Render markdown-like sections (### Headings, - Bullet lists, standard paragraphs)
  const renderFormattedContent = (content: string) => {
    const blocks = content.split('\n\n').filter(Boolean);

    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        const headingText = trimmed.replace('### ', '');
        return (
          <h2
            key={idx}
            className="text-lg sm:text-xl font-bold font-sans text-ink-900 tracking-tight mt-8 mb-3 pb-1 border-b border-line/60"
          >
            {headingText}
          </h2>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const headingText = trimmed.replace('## ', '');
        return (
          <h2
            key={idx}
            className="text-xl sm:text-2xl font-bold font-sans text-ink-900 tracking-tight mt-10 mb-4"
          >
            {headingText}
          </h2>
        );
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
        return (
          <ul key={idx} className="list-disc pl-5 space-y-2 text-ink-700 text-xs sm:text-sm my-3 leading-relaxed">
            {items.map((it, itemIdx) => {
              const text = it.replace(/^[-*]\s+/, '');
              // Bold parsing within bullet
              return (
                <li key={itemIdx} dangerouslySetInnerHTML={{
                  __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-ink-900 font-semibold">$1</strong>')
                }} />
              );
            })}
          </ul>
        );
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
        return (
          <ol key={idx} className="list-decimal pl-5 space-y-2 text-ink-700 text-xs sm:text-sm my-3 leading-relaxed">
            {items.map((it, itemIdx) => {
              const text = it.replace(/^\d+\.\s+/, '');
              return (
                <li key={itemIdx} dangerouslySetInnerHTML={{
                  __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-ink-900 font-semibold">$1</strong>')
                }} />
              );
            })}
          </ol>
        );
      }

      // Standard Paragraph with inline bold parsing
      return (
        <p
          key={idx}
          className="text-xs sm:text-sm text-ink-700 leading-relaxed my-3"
          dangerouslySetInnerHTML={{
            __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-ink-900 font-semibold">$1</strong>')
          }}
        />
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-left">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-line gap-4">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
        </Link>
        <span className="text-[11px] font-mono text-gold-500 uppercase tracking-widest font-semibold">
          Vantero Legal · Bangladesh
        </span>
      </div>

      {/* Header */}
      <div className="py-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream border border-line rounded-xs text-[11px] font-mono text-ink-700">
          <Clock className="w-3.5 h-3.5 text-gold-500" />
          <span>Last Updated: {formattedDate}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900 font-sans">
          {policy.title}
        </h1>

        {policy.subtitle && (
          <p className="text-sm sm:text-base text-ink-600 max-w-2xl leading-relaxed">
            {policy.subtitle}
          </p>
        )}
      </div>

      {/* Executive Summary Card */}
      {policy.summary && (
        <div className="p-4 sm:p-5 bg-cream/70 border-l-4 border-l-gold-500 border border-line rounded-sm mb-8 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-gold-600 block">
            Executive Summary
          </span>
          <p className="text-xs sm:text-sm text-ink-800 leading-relaxed font-medium">
            {policy.summary}
          </p>
        </div>
      )}

      {/* Formatted Legal Document Content */}
      <div className="bg-white border border-line rounded-sm p-6 sm:p-10 shadow-xs divide-y divide-line/40">
        <div className="prose prose-sm max-w-none text-ink-800">
          {renderFormattedContent(policy.content)}
        </div>
      </div>

      {/* Concierge & Support Footer Card */}
      <div className="mt-10 p-6 bg-cream/50 border border-line rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            Have questions regarding this document?
          </h3>
          <p className="text-xs text-ink-600 mt-1">
            Our Banani, Dhaka concierge team is available Saturday to Thursday, 10:00 AM – 8:00 PM BST.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-ink-700 mt-2">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold-500" /> +880 1674990904
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-500" /> info@vantero.com
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full inline-flex items-center justify-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Explore Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
