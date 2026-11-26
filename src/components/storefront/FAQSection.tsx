'use client';

import React, { useState, useEffect } from 'react';
import { getPublicFAQs } from '@/lib/api';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface Props {
  initialFaqs?: any[];
}

export const FAQSection: React.FC<Props> = ({ initialFaqs = [] }) => {
  const [faqs, setFaqs] = useState<any[]>(initialFaqs);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFaqs.length === 0) {
      setLoading(true);
      getPublicFAQs()
        .then((res) => {
          if (res?.success) {
            setFaqs(res.faqs || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialFaqs]);

  const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category || 'General')))];

  const filteredFaqs = faqs.filter((f) => {
    if (selectedCategory === 'all') return true;
    return (f.category || 'General') === selectedCategory;
  });

  if (faqs.length === 0 && !loading) {
    return null;
  }

  // Generate valid FAQPage JSON-LD schema
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <section className="w-full py-16 lg:py-24 bg-paper border-t border-line text-left">
      {/* Inject FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-cream border border-line rounded-sm">
            <HelpCircle className="w-3.5 h-3.5 text-gold-600" />
            <span className="text-[11px] uppercase tracking-wider text-gold-600 font-bold">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-ink-900 tracking-tight">
            Client Inquiries & Ordering Guidance
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-xl mx-auto">
            Everything you need to know about our Cash on Delivery terms, nationwide courier dispatch, Italian craftsmanship, and 7-day exchange policy.
          </p>
        </div>

        {/* Category Pills (if more than 1 category) */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(0);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm transition-colors uppercase tracking-wider capitalize ${
                  selectedCategory === cat
                    ? 'bg-ink-900 text-white'
                    : 'bg-cream text-ink-700 hover:bg-stone/60 border border-line'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Accordion */}
        <div className="divide-y divide-line border border-line rounded-sm bg-white overflow-hidden shadow-xs">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq._id || idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-cream/40 transition-colors focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-semibold text-ink-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-gold-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-ink-600 leading-relaxed bg-cream/20 animate-fadeIn">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concierge Help Callout */}
        <div className="p-6 bg-cream border border-line rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Have a tailored inquiry or sizing question?
            </h4>
            <p className="text-xs text-ink-600 mt-0.5">
              Our Dhaka atelier concierge is available on WhatsApp and email: <span className="font-semibold text-ink-900">info@vanterobd.com</span>
            </p>
          </div>
          <a
            href="mailto:info@vanterobd.com"
            className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-white rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap"
          >
            Contact Concierge
          </a>
        </div>
      </div>
    </section>
  );
};
