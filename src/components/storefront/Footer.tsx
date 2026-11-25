'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, MapPin, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import footer from '../../public/footer.png'
interface FooterProps {
  footerData?: {
    description?: string;
    contentData?: {
      hotline?: string;
      email?: string;
      storeAddress?: string;
      codNotice?: string;
    };
  };
}

export const Footer: React.FC<FooterProps> = ({ footerData }) => {
  const description =
    footerData?.description ||
    'Vantero — Modern luxury menswear, handcrafted footwear, and niche artisanal fragrances in Bangladesh.';
  // const hotline = footerData?.contentData?.hotline || '+880 1674990904';
   const hotline =  '+880 1674990904';
  // const email = footerData?.contentData?.email || 'info@vantero.com';
  const email = 'info@vantero.com';
  const storeAddress =
    footerData?.contentData?.storeAddress || 'Road 11, Banani, Dhaka 1213, Bangladesh';
  const codNotice =
    footerData?.contentData?.codNotice ||
    'Cash on Delivery accepted nationwide. Every parcel inspected before dispatch.';

  return (
    <footer className="w-full bg-ink-900 text-paper border-t border-ink-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left mb-14">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-[0.25em] text-white uppercase font-sans inline-block"
            >
             <Image src={footer} alt="Vantero Logo" width={120} height={40} className="object-contain" />
            </Link>
            <p className="text-xs text-ink-300 max-w-sm leading-relaxed">
              {description}
            </p>

            <div className="pt-2 space-y-2 text-xs text-ink-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                <span>{storeAddress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                <span>{hotline}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Footwear & Clothing */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-500 mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-ink-300">
              <li>
                <Link href="/shop?category=sneakers" className="hover:text-white transition-colors">
                  Court Low Sneakers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=clothing" className="hover:text-white transition-colors">
                  Double-Breasted Overcoats
                </Link>
              </li>
              <li>
                <Link href="/shop?category=clothing" className="hover:text-white transition-colors">
                  Pleated Tailored Trousers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fragrance" className="hover:text-white transition-colors">
                  Nocturne Extrait de Parfum
                </Link>
              </li>
              <li>
                <Link href="/shop?category=lifestyle" className="hover:text-white transition-colors">
                  Artisanal Leather Bags
                </Link>
              </li>
              <li>
                <Link href="/shop?category=the-boys-edit" className="hover:text-white transition-colors">
                  The Boys Edit
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-500 mb-4">
              Client Service
            </h4>
            <ul className="space-y-2.5 text-xs text-ink-300">
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Live Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  7-Day Free Returns & Exchanges
                </Link>
              </li>
              <li>
                <span className="text-ink-400">Dhaka Next-Day Delivery</span>
              </li>
              <li>
                <span className="text-ink-400">Authenticity Guarantee</span>
              </li>
              <li>
                <span className="text-ink-400">Book a Private Fitting</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Strict Payment & Delivery Trust Badge */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-500 mb-4">
              Payment & Security
            </h4>
            <div className="p-4 bg-ink-800/80 border border-ink-600 rounded-sm space-y-2.5">
              <div className="flex items-center space-x-2 text-white font-medium text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Cash on Delivery</span>
              </div>
              <p className="text-[11px] text-ink-300 leading-snug">
                {codNotice}
              </p>
              <div className="text-[10px] uppercase font-mono text-gold-300 tracking-wider">
                COD Nationwide · No Advance Fee
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-400 gap-4">
          <p>© {new Date().getFullYear()} Vantero Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/terms-of-service" className="hover:text-gold-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-gold-400 transition-colors">
              Refund Policy
            </Link>
            <Link href="/admin/login" className="hover:text-gold-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
