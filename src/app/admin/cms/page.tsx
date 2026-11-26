'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAdminCMSSections,
  updateCMSSection,
  getSiteSettings,
  updateSiteSettings,
  SiteSettingsData,
  getAdminFAQs,
  createAdminFAQ,
  updateAdminFAQ,
  deleteAdminFAQ,
  FAQItem
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { HeroMediaUploadZone } from '@/components/admin/HeroMediaUploadZone';
import { resolveImageUrl } from '@/lib/utils';
import {
  Edit2,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Sliders,
  Layers,
  Image as ImageIcon,
  Star,
  ShieldCheck,
  Truck,
  Film,
  Building2,
  Package,
  Clock,
  Award,
  HelpCircle
} from 'lucide-react';

interface HeroSlideData {
  id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  image: {
    url: string;
    publicId?: string;
    alt?: string;
  };
  isActive?: boolean;
}

interface TrustItemData {
  title: string;
  subtitle: string;
  icon: string;
}

const DEFAULT_HERO_SLIDES: HeroSlideData[] = [
  {
    id: 'slide-1',
    title: 'Wear your identity.',
    subtitle: 'AUTUMN / WINTER 2026',
    badgeText: 'New season · AW26 Capsule',
    description: 'Handcrafted Italian leather sneakers, tailored overcoats, and niche extrait de parfum for men and boys. Cash on delivery nationwide.',
    ctaText: 'Shop the Collection',
    ctaLink: '/shop',
    secondaryCtaText: 'Explore Lookbook',
    secondaryCtaLink: '/look/wear-your-identity-aw26',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1800',
      publicId: 'hero/seed-hero-1.jpg',
      alt: 'Vantero Autumn Winter 2026 Editorial'
    },
    isActive: true
  },
  {
    id: 'slide-2',
    title: 'The Architectural Silhouette.',
    subtitle: 'MENSWEAR TAILORING',
    badgeText: 'Limited Atelier Edition',
    description: 'Double-breasted wool overcoats and pleated trousers tailored for the modern Bangladeshi gentleman.',
    ctaText: 'Discover Clothing',
    ctaLink: '/shop?category=clothing',
    secondaryCtaText: 'View Outerwear',
    secondaryCtaLink: '/shop?category=clothing',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1800',
      publicId: 'hero/seed-hero-2.jpg',
      alt: 'Tailored Luxury Menswear'
    },
    isActive: true
  },
  {
    id: 'slide-3',
    title: 'Vulcanized Mastery.',
    subtitle: 'FOOTWEAR SERIES',
    badgeText: 'Bestseller · Court Low',
    description: 'Italian calfskin low-tops designed with reinforced cushioning, durable rubber cupsoles, and hand-finished edges.',
    ctaText: 'Shop Footwear',
    ctaLink: '/shop?category=sneakers',
    secondaryCtaText: 'Inspect Sizing',
    secondaryCtaLink: '/shop?category=sneakers',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1800',
      publicId: 'hero/seed-hero-3.jpg',
      alt: 'Handcrafted Luxury Sneakers'
    },
    isActive: true
  },
  {
    id: 'slide-4',
    title: 'Nocturne Extrait de Parfum.',
    subtitle: 'NICHE ARTISANAL FRAGRANCES',
    badgeText: 'Pure Extrait · 35% Concentration',
    description: 'Rare aged Cambodian oud, smoked birchwood, and dark amber blended for tropical evening longevity.',
    ctaText: 'Explore Fragrances',
    ctaLink: '/shop?category=fragrance',
    secondaryCtaText: 'Olfactory Notes',
    secondaryCtaLink: '/shop?category=fragrance',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1800',
    image: {
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1800',
      publicId: 'hero/seed-hero-4.jpg',
      alt: 'Nocturne Artisanal Extrait de Parfum'
    },
    isActive: true
  }
];

const DEFAULT_TRUST_ITEMS: TrustItemData[] = [
  {
    title: 'Cash on delivery',
    subtitle: 'Nationwide · Inspect package at your doorstep',
    icon: 'card'
  },
  {
    title: 'Free delivery in Dhaka',
    subtitle: 'Next day on orders over ৳5,000',
    icon: 'truck'
  },
  {
    title: '7-day free exchanges',
    subtitle: 'Unworn items · our courier collects from you',
    icon: 'return'
  },
  {
    title: 'Authentic, or refunded',
    subtitle: 'Every pair checked by hand in Dhaka',
    icon: 'shield'
  }
];

export default function AdminCMSPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlideData[]>([]);
  const [heroSlideError, setHeroSlideError] = useState<string | null>(null);

  // Trust Strip Editor State
  const [trustItems, setTrustItems] = useState<TrustItemData[]>([]);

  // Site Shipping & Delivery Settings State
  const [shippingSettings, setShippingSettings] = useState<SiteSettingsData>({
    freeDeliveryThreshold: 5000,
    insideDhakaCharge: 100,
    outsideDhakaCharge: 150,
    freeDeliveryMessage: 'Add ৳5,000 more for Free Delivery in Dhaka'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const fetchSections = () => {
    setLoading(true);
    getAdminCMSSections()
      .then((res) => {
        if (res?.success) setSections(res.sections || []);
      })
      .finally(() => setLoading(false));
  };

  // FAQ Management State
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('Ordering & Delivery');
  const [faqOrder, setFaqOrder] = useState<number>(0);
  const [faqIsActive, setFaqIsActive] = useState(true);
  const [faqSaving, setFaqSaving] = useState(false);

  const fetchFaqs = () => {
    getAdminFAQs()
      .then((res) => {
        if (res?.success) {
          setFaqs(res.faqs || []);
        }
      })
      .catch(() => {});
  };

  const fetchSettings = () => {
    getSiteSettings()
      .then((res) => {
        if (res?.success && res.settings) {
          setShippingSettings({
            freeDeliveryThreshold: res.settings.freeDeliveryThreshold ?? 5000,
            insideDhakaCharge: res.settings.insideDhakaCharge ?? 100,
            outsideDhakaCharge: res.settings.outsideDhakaCharge ?? 150,
            freeDeliveryMessage: res.settings.freeDeliveryMessage || 'Add ৳5,000 more for Free Delivery in Dhaka'
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSections();
    fetchSettings();
    fetchFaqs();
  }, []);

  const handleOpenAddFaq = () => {
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('Ordering & Delivery');
    setFaqOrder(faqs.length);
    setFaqIsActive(true);
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq._id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category || 'General');
    setFaqOrder(faq.order || 0);
    setFaqIsActive(faq.isActive);
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert('Question and Answer are required');
      return;
    }
    setFaqSaving(true);
    try {
      const payload = {
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory.trim(),
        order: Number(faqOrder) || 0,
        isActive: faqIsActive,
      };
      if (editingFaqId) {
        await updateAdminFAQ(editingFaqId, payload);
      } else {
        await createAdminFAQ(payload);
      }
      setFaqModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving FAQ');
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await deleteAdminFAQ(id);
      fetchFaqs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting FAQ');
    }
  };

  const handleToggleFaqActive = async (faq: FAQItem) => {
    try {
      await updateAdminFAQ(faq._id, { isActive: !faq.isActive });
      fetchFaqs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error toggling FAQ status');
    }
  };

  const handleEditClick = (section: any) => {
    setEditingSection({ ...section });
    setSaveSuccess(false);
    setHeroSlideError(null);

    if (section.sectionKey === 'hero') {
      const existing = section.contentData?.slides;
      if (Array.isArray(existing) && existing.length >= 3) {
        setHeroSlides(existing);
      } else {
        setHeroSlides(DEFAULT_HERO_SLIDES);
      }
    } else if (section.sectionKey === 'trust_strip') {
      const existing = section.contentData?.items;
      if (Array.isArray(existing) && existing.length > 0) {
        setTrustItems(existing);
      } else {
        setTrustItems(DEFAULT_TRUST_ITEMS);
      }
    }
  };

  const handleToggleActive = async (section: any) => {
    try {
      await updateCMSSection(section.sectionKey, { isActive: !section.isActive });
      fetchSections();
    } catch (e: any) {
      alert(e.message || 'Failed to update section status');
    }
  };

  // Hero Slide Management Handlers
  const handleAddHeroSlide = () => {
    if (heroSlides.length >= 5) {
      setHeroSlideError('Maximum 5 Hero slides allowed. Edit or remove an existing slide.');
      return;
    }
    setHeroSlideError(null);
    const newSlide: HeroSlideData = {
      id: `slide-${Date.now()}`,
      title: 'New Editorial Showcase',
      subtitle: 'SEASONAL CAPSULE',
      badgeText: 'New Arrival',
      description: 'Handcrafted luxury pieces designed for effortless elegance and timeless distinction.',
      ctaText: 'Shop New Arrivals',
      ctaLink: '/shop',
      secondaryCtaText: 'Explore Lookbook',
      secondaryCtaLink: '/look/wear-your-identity-aw26',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1800',
      image: {
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1800',
        publicId: 'hero/default.jpg'
      },
      isActive: true
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const handleRemoveHeroSlide = (index: number) => {
    if (heroSlides.length <= 3) {
      setHeroSlideError('Minimum 3 Hero slides required. You cannot delete below 3 slides.');
      return;
    }
    setHeroSlideError(null);
    setHeroSlides(heroSlides.filter((_, idx) => idx !== index));
  };

  const handleToggleSlideActive = (index: number) => {
    const slide = heroSlides[index];
    const activeCount = heroSlides.filter((s) => s.isActive !== false).length;

    if (slide.isActive !== false && activeCount <= 3) {
      setHeroSlideError('Minimum 3 active Hero slides required. Enable another slide before disabling this one.');
      return;
    }

    setHeroSlideError(null);
    const updated = [...heroSlides];
    updated[index].isActive = !updated[index].isActive;
    setHeroSlides(updated);
  };

  const handleSlideChange = (index: number, field: keyof HeroSlideData, value: any) => {
    setHeroSlideError(null);
    const updated = [...heroSlides];
    (updated[index] as any)[field] = value;
    setHeroSlides(updated);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === heroSlides.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...heroSlides];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setHeroSlides(updated);
  };

  // Trust Strip Handlers
  const handleAddTrustItem = () => {
    setTrustItems([
      ...trustItems,
      {
        title: 'New Service Promise',
        subtitle: 'Fast and reliable assistance in Dhaka',
        icon: 'truck'
      }
    ]);
  };

  const handleRemoveTrustItem = (index: number) => {
    setTrustItems(trustItems.filter((_, i) => i !== index));
  };

  const handleTrustItemChange = (index: number, field: keyof TrustItemData, value: string) => {
    const copy = [...trustItems];
    copy[index] = { ...copy[index], [field]: value };
    setTrustItems(copy);
  };

  // Save Modal Changes
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    // Validate Hero Carousel rule
    if (editingSection.sectionKey === 'hero') {
      const activeCount = heroSlides.filter((s) => s.isActive !== false).length;
      if (heroSlides.length < 3) {
        setHeroSlideError('Hero carousel requires at least 3 slides configured.');
        return;
      }
      if (heroSlides.length > 5) {
        setHeroSlideError('Hero carousel cannot exceed 5 slides.');
        return;
      }
      if (activeCount < 3) {
        setHeroSlideError('At least 3 Hero slides must be set to Active.');
        return;
      }

      editingSection.contentData = {
        ...(editingSection.contentData || {}),
        slides: heroSlides
      };

      // Sync root title and image with slide 1 for backward compatibility
      if (heroSlides[0]) {
        editingSection.title = heroSlides[0].title;
        editingSection.subtitle = heroSlides[0].subtitle || '';
        editingSection.badgeText = heroSlides[0].badgeText || '';
        editingSection.description = heroSlides[0].description || '';
        editingSection.ctaText = heroSlides[0].ctaText || '';
        editingSection.ctaLink = heroSlides[0].ctaLink || '';
        if (heroSlides[0].image) {
          editingSection.images = [heroSlides[0].image];
        }
      }
    } else if (editingSection.sectionKey === 'trust_strip') {
      editingSection.contentData = {
        ...(editingSection.contentData || {}),
        items: trustItems
      };
    }

    setSaving(true);
    try {
      await updateCMSSection(editingSection.sectionKey, editingSection);
      setSaveSuccess(true);
      fetchSections();
      setTimeout(() => {
        setEditingSection(null);
        setSaveSuccess(false);
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating section');
    } finally {
      setSaving(false);
    }
  };

  // Save Site Shipping & Delivery Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess(false);
    setSettingsError(null);

    try {
      await updateSiteSettings(shippingSettings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setSettingsError(err.response?.data?.message || 'Failed to save delivery settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Filter out top_bar so it is completely removed from admin
  const visibleSections = sections.filter((s) => s.sectionKey !== 'top_bar');

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Storefront Dynamic CMS Manager"
        subtitle="Control 100% of storefront titles, descriptions, Hero carousel slides, trust promises, and delivery rates"
      />

      {/* Sub-Navigation Quick Tabs */}
      <div className="px-6 sm:px-8 pt-6 flex flex-wrap gap-2 text-xs text-left">
        <span className="px-3.5 py-1.5 bg-ink-900 text-white font-semibold rounded-sm shadow-xs">
          Homepage Sections & Carousel
        </span>
        <Link
          href="/admin/reviews"
          className="px-3.5 py-1.5 bg-white border border-line text-ink-700 hover:text-ink-900 font-medium rounded-sm transition-colors flex items-center gap-1.5 hover:border-ink-400"
        >
          <Star className="w-3.5 h-3.5 text-gold-500" /> Customer Reviews Manager
        </Link>
        <Link
          href="/admin/policies"
          className="px-3.5 py-1.5 bg-white border border-line text-ink-700 hover:text-ink-900 font-medium rounded-sm transition-colors flex items-center gap-1.5 hover:border-ink-400"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" /> Legal Policies (Terms, Privacy, Refund)
        </Link>
      </div>

      <div className="p-6 sm:p-8 space-y-8 flex-1 text-left">
        {/* SECTION 1: Configured Storefront Sections */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex justify-between items-center bg-cream/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Configured Storefront Sections ({visibleSections.length})
            </h3>
            <span className="text-[11px] text-ink-500">Live Changes Auto-Propagate</span>
          </div>

          <div className="divide-y divide-line">
            {visibleSections.map((sec) => (
              <div
                key={sec.sectionKey}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] bg-stone px-2 py-0.5 rounded-xs font-bold text-ink-700">
                      {sec.sectionKey}
                    </span>
                    <h4 className="text-sm font-bold text-ink-900">{sec.sectionName}</h4>
                    {sec.sectionKey === 'hero' && (
                      <span className="text-[10px] bg-gold-500 text-white px-2 py-0.5 rounded-xs uppercase tracking-wider font-mono font-semibold">
                        Dynamic Carousel (3–5 Slides · Photos & Videos)
                      </span>
                    )}
                    {sec.sectionKey === 'trust_strip' && (
                      <span className="text-[10px] bg-ink-800 text-white px-2 py-0.5 rounded-xs uppercase tracking-wider font-mono font-semibold">
                        Trust Strip ({sec.contentData?.items?.length || 4} Promises)
                      </span>
                    )}
                    {sec.badgeText && sec.sectionKey !== 'hero' && (
                      <span className="text-[10px] bg-gold-500 text-white px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                        {sec.badgeText}
                      </span>
                    )}
                  </div>
                  {sec.title && (
                    <p className="text-xs font-semibold text-ink-800">
                      Title: "{sec.title}"
                    </p>
                  )}
                  {sec.description && (
                    <p className="text-xs text-ink-500 line-clamp-1 max-w-xl">
                      {sec.description}
                    </p>
                  )}
                  {sec.sectionKey === 'hero' && sec.contentData?.slides && (
                    <p className="text-[11px] text-emerald-700 font-mono">
                      ✓ {sec.contentData.slides.length} Slides configured ({sec.contentData.slides.filter((s: any) => s.isActive !== false).length} active)
                    </p>
                  )}
                  {sec.sectionKey === 'trust_strip' && (
                    <p className="text-[11px] text-emerald-700 font-mono">
                      ✓ Dynamic storefront trust badges active
                    </p>
                  )}
                  {sec.sectionKey !== 'hero' && sec.sectionKey !== 'trust_strip' && sec.images?.[0]?.url && (
                    <span className="inline-block text-[10px] text-emerald-600 font-mono">
                      ✓ Local Image Linked
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => handleToggleActive(sec)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                      sec.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone text-ink-500 border border-line'
                    }`}
                  >
                    {sec.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.isActive ? 'Active' : 'Hidden'}</span>
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(sec)}
                    className="flex items-center space-x-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>
                      {sec.sectionKey === 'hero'
                        ? 'Manage Carousel Slides'
                        : sec.sectionKey === 'trust_strip'
                        ? 'Manage Trust Promises'
                        : 'Edit Content'}
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Shipping & Delivery Controls (Inside/Outside Dhaka + Free Shipping Threshold) */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex justify-between items-center bg-cream/30">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold-500" />
                Shipping & Delivery Rates Controls
              </h3>
              <p className="text-[11px] text-ink-500 mt-0.5">
                Controls checkout delivery charges and dynamic Bag Drawer free-delivery calculation nationwide
              </p>
            </div>
            {settingsSuccess && (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
            {settingsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm">
                {settingsError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Input
                  label="Inside Dhaka Delivery Charge (BDT)"
                  type="number"
                  min="0"
                  value={shippingSettings.insideDhakaCharge}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      insideDhakaCharge: Number(e.target.value) || 0
                    })
                  }
                  required
                />
                <p className="text-[11px] text-ink-500">Standard rate: ৳100 (applied when under threshold)</p>
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Outside Dhaka Delivery Charge (BDT)"
                  type="number"
                  min="0"
                  value={shippingSettings.outsideDhakaCharge}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      outsideDhakaCharge: Number(e.target.value) || 0
                    })
                  }
                  required
                />
                <p className="text-[11px] text-ink-500">Standard nationwide courier rate: ৳150</p>
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Free Delivery Threshold in Dhaka (BDT)"
                  type="number"
                  min="0"
                  value={shippingSettings.freeDeliveryThreshold}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      freeDeliveryThreshold: Number(e.target.value) || 0
                    })
                  }
                />
                <p className="text-[11px] text-ink-500">
                  Default ৳5,000. <strong>Set to 0 to completely hide free delivery</strong> line in Bag Drawer.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Input
                label="Free Delivery Banner Label (Storefront Bag Drawer)"
                value={shippingSettings.freeDeliveryMessage}
                onChange={(e) =>
                  setShippingSettings({
                    ...shippingSettings,
                    freeDeliveryMessage: e.target.value
                  })
                }
                placeholder="Add ৳5,000 more for Free Delivery in Dhaka"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={settingsLoading}>
                Update Delivery & Shipping Settings
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 3: Homepage FAQ Management */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream/30">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-gold-500" />
                Homepage Frequently Asked Questions ({faqs.length})
              </h3>
              <p className="text-[11px] text-ink-500 mt-0.5">
                Manage accordion inquiries on homepage with live FAQPage JSON-LD schema injection
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenAddFaq}
              className="flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New FAQ</span>
            </Button>
          </div>

          <div className="divide-y divide-line">
            {faqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-400">
                No FAQs created yet. Click &quot;Add New FAQ&quot; to add your first customer question.
              </div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-cream/20 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold bg-cream px-2 py-0.5 rounded-xs border border-line text-gold-700">
                        #{faq.order} · {faq.category || 'General'}
                      </span>
                      <h4 className="text-sm font-bold text-ink-900">{faq.question}</h4>
                    </div>
                    <p className="text-xs text-ink-600 leading-relaxed max-w-3xl">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFaqActive(faq)}
                      className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold border transition-colors ${
                        faq.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone text-ink-500 border-line'
                      }`}
                    >
                      {faq.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditFaq(faq)}
                      className="p-1.5 text-ink-600 hover:text-gold-600 border border-line rounded-xs"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 border border-line rounded-xs"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-paper border border-line rounded-md p-6 max-h-[92vh] overflow-y-auto shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-mono text-gold-500 uppercase tracking-wider font-bold">
                  Editing Section: {editingSection.sectionKey}
                </span>
                <h2 className="text-lg font-bold text-ink-900">{editingSection.sectionName}</h2>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="p-1.5 text-ink-400 hover:text-ink-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-sm flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> Section updated and storefront cache revalidated!
              </div>
            )}

            {heroSlideError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{heroSlideError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-6">
              {/* 1. DYNAMIC HERO CAROUSEL MANAGER (3 to 5 Slides, Images & Videos) */}
              {editingSection.sectionKey === 'hero' ? (
                <div className="space-y-6">
                  <div className="bg-cream/60 border border-line rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-gold-500" />
                        Hero Carousel Slides ({heroSlides.length} / 5 configured)
                      </h4>
                      <p className="text-[11px] text-ink-600 mt-0.5">
                        Minimum 3 and maximum 5 slides allowed. Support both images (3s auto-advance) and videos (plays until ended).
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddHeroSlide}
                      disabled={heroSlides.length >= 5}
                      className="flex items-center space-x-1.5 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slide</span>
                    </Button>
                  </div>

                  {/* Slides List */}
                  <div className="space-y-4">
                    {heroSlides.map((slide, idx) => {
                      const isVid =
                        slide.mediaType === 'video' ||
                        Boolean(slide.mediaUrl && /\.(mp4|webm|mov)$/i.test(slide.mediaUrl));

                      return (
                        <div
                          key={slide.id || idx}
                          className={`border rounded-sm p-4 bg-white transition-all ${
                            slide.isActive !== false ? 'border-line' : 'border-dashed border-ink-300 opacity-75'
                          }`}
                        >
                          {/* Slide Card Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone rounded-xs text-ink-800">
                                Slide {idx + 1}
                              </span>
                              {isVid ? (
                                <span className="text-[10px] bg-purple-100 text-purple-800 font-mono font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                                  <Film className="w-3 h-3" /> VIDEO
                                </span>
                              ) : (
                                <span className="text-[10px] bg-blue-50 text-blue-800 font-mono font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> IMAGE
                                </span>
                              )}
                              <span className="text-xs font-semibold text-ink-900 truncate max-w-xs">
                                {slide.title || 'Untitled Slide'}
                              </span>
                              {slide.isActive === false && (
                                <span className="text-[10px] text-rose-600 font-mono font-bold bg-rose-50 px-1.5 py-0.5 rounded-xs">
                                  Disabled
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Reorder Up / Down */}
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-ink-400 hover:text-ink-900 disabled:opacity-30"
                                title="Move Slide Up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, 'down')}
                                disabled={idx === heroSlides.length - 1}
                                className="p-1 text-ink-400 hover:text-ink-900 disabled:opacity-30"
                                title="Move Slide Down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>

                              {/* Active Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleSlideActive(idx)}
                                className={`px-2 py-1 text-[11px] font-semibold rounded-xs border transition-colors ${
                                  slide.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-stone text-ink-500 border-line'
                                }`}
                              >
                                {slide.isActive !== false ? 'Active' : 'Disabled'}
                              </button>

                              {/* Delete Slide */}
                              <button
                                type="button"
                                onClick={() => handleRemoveHeroSlide(idx)}
                                disabled={heroSlides.length <= 3}
                                className="p-1 text-ink-400 hover:text-rose-600 disabled:opacity-30"
                                title={heroSlides.length <= 3 ? 'Minimum 3 slides required' : 'Delete Slide'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Slide Content Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Input
                                label="Slide Headline / Main Title"
                                value={slide.title}
                                onChange={(e) => handleSlideChange(idx, 'title', e.target.value)}
                                placeholder="e.g. Wear your identity."
                                required
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  label="Subtitle / Season"
                                  value={slide.subtitle || ''}
                                  onChange={(e) => handleSlideChange(idx, 'subtitle', e.target.value)}
                                  placeholder="AUTUMN / WINTER 2026"
                                />
                                <Input
                                  label="Overline Badge"
                                  value={slide.badgeText || ''}
                                  onChange={(e) => handleSlideChange(idx, 'badgeText', e.target.value)}
                                  placeholder="New season · AW26"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-700">
                                  Description
                                </label>
                                <textarea
                                  rows={2}
                                  value={slide.description || ''}
                                  onChange={(e) => handleSlideChange(idx, 'description', e.target.value)}
                                  placeholder="Editorial marketing copy..."
                                  className="w-full px-3 py-1.5 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  label="Primary CTA Label"
                                  value={slide.ctaText || ''}
                                  onChange={(e) => handleSlideChange(idx, 'ctaText', e.target.value)}
                                  placeholder="Shop the Collection"
                                />
                                <Input
                                  label="Primary CTA Link"
                                  value={slide.ctaLink || ''}
                                  onChange={(e) => handleSlideChange(idx, 'ctaLink', e.target.value)}
                                  placeholder="/shop"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  label="Secondary CTA Label"
                                  value={slide.secondaryCtaText || ''}
                                  onChange={(e) => handleSlideChange(idx, 'secondaryCtaText', e.target.value)}
                                  placeholder="Explore Lookbook"
                                />
                                <Input
                                  label="Secondary CTA Link"
                                  value={slide.secondaryCtaLink || ''}
                                  onChange={(e) => handleSlideChange(idx, 'secondaryCtaLink', e.target.value)}
                                  placeholder="/look/wear-your-identity-aw26"
                                />
                              </div>
                            </div>

                            {/* Slide Media Upload Zone (Image & Video) */}
                            <div className="space-y-2">
                              <HeroMediaUploadZone
                                label="Slide Media (Image or Video via Multer)"
                                folder="hero"
                                mediaUrl={slide.mediaUrl || slide.image?.url || ''}
                                mediaType={slide.mediaType || (isVid ? 'video' : 'image')}
                                publicId={slide.image?.publicId || ''}
                                onMediaUploaded={(uploaded) => {
                                  const updated = [...heroSlides];
                                  updated[idx] = {
                                    ...updated[idx],
                                    mediaType: uploaded.type,
                                    mediaUrl: uploaded.url,
                                    image: {
                                      url: uploaded.url,
                                      publicId: uploaded.publicId,
                                      alt: slide.title
                                    }
                                  };
                                  setHeroSlides(updated);
                                }}
                                onMediaRemoved={() => {
                                  const updated = [...heroSlides];
                                  updated[idx] = {
                                    ...updated[idx],
                                    mediaType: 'image',
                                    mediaUrl: '',
                                    image: {
                                      url: '',
                                      publicId: '',
                                      alt: ''
                                    }
                                  };
                                  setHeroSlides(updated);
                                }}
                              />
                              {(slide.mediaUrl || slide.image?.url) && (
                                <p className="text-[10px] text-ink-500 font-mono truncate">
                                  Path: {slide.mediaUrl || slide.image?.url}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : editingSection.sectionKey === 'trust_strip' ? (
                /* 2. DYNAMIC TRUST STRIP ITEMS EDITOR */
                <div className="space-y-5">
                  <div className="bg-cream/60 border border-line rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-gold-500" />
                        Trust Strip Service Promises ({trustItems.length})
                      </h4>
                      <p className="text-[11px] text-ink-600 mt-0.5">
                        These items appear under the hero section on the homepage and revalidate live.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddTrustItem}
                      className="flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {trustItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-line rounded-sm p-4 bg-white space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-line">
                          <span className="font-mono text-xs font-bold text-ink-700">
                            Promise #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTrustItem(idx)}
                            className="text-ink-400 hover:text-rose-600 p-1"
                            title="Remove Promise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            label="Title"
                            value={item.title}
                            onChange={(e) => handleTrustItemChange(idx, 'title', e.target.value)}
                            placeholder="e.g. Cash on delivery"
                            required
                          />

                          <Input
                            label="Subtitle / Description"
                            value={item.subtitle}
                            onChange={(e) => handleTrustItemChange(idx, 'subtitle', e.target.value)}
                            placeholder="e.g. Nationwide delivery"
                            required
                          />

                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Icon Type
                            </label>
                            <select
                              value={item.icon || 'shield'}
                              onChange={(e) => handleTrustItemChange(idx, 'icon', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                            >
                              <option value="card">CreditCard / Cash on Delivery</option>
                              <option value="truck">Truck / Shipping / Delivery</option>
                              <option value="return">RotateCcw / Free Returns & Exchanges</option>
                              <option value="shield">ShieldCheck / Authenticity Guaranteed</option>
                              <option value="package">Package / Doorstep Inspection</option>
                              <option value="clock">Clock / Next-Day Delivery</option>
                              <option value="award">Award / Premium Atelier Quality</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* 3. STANDARD CMS SECTION EDITOR (For all other non-hero sections) */
                <div className="space-y-4">
                  <Input
                    label="Section Headline / Title"
                    value={editingSection.title || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  />

                  <Input
                    label="Badge / Overline Tag"
                    placeholder="New season · Autumn / Winter 2026"
                    value={editingSection.badgeText || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, badgeText: e.target.value })}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description / Marketing Copy
                    </label>
                    <textarea
                      rows={3}
                      value={editingSection.description || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-line rounded-sm text-sm text-ink-900 focus:outline-none focus:border-ink-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Primary CTA Label"
                      placeholder="Shop the Collection"
                      value={editingSection.ctaText || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, ctaText: e.target.value })}
                    />
                    <Input
                      label="Primary CTA Link"
                      placeholder="/shop"
                      value={editingSection.ctaLink || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, ctaLink: e.target.value })}
                    />
                  </div>

                  {/* Banner Image Upload via Multer */}
                  <div className="pt-2 border-t border-line">
                    <ImageUploadZone
                      label="Editorial Banner Image (Multer Disk Storage)"
                      folder="cms"
                      currentImage={editingSection.images?.[0] || null}
                      onImageUploaded={(img) =>
                        setEditingSection({
                          ...editingSection,
                          images: [img],
                        })
                      }
                      onImageRemoved={() =>
                        setEditingSection({
                          ...editingSection,
                          images: [],
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-line flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={saving}>
                  Save & Publish Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-paper border border-line rounded-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-500 font-bold">
                  Knowledge Base
                </span>
                <h3 className="text-base font-bold text-ink-900">
                  {editingFaqId ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                </h3>
              </div>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="text-ink-500 hover:text-ink-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              <Input
                label="Question *"
                placeholder="e.g. Can I inspect the leather sneakers before paying the courier?"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  placeholder="Comprehensive answer explaining Vantero policy..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-line rounded-sm text-xs leading-relaxed focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Category"
                  placeholder="e.g. Ordering & Payment, Shipping"
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                />
                <Input
                  label="Display Order"
                  type="number"
                  min="0"
                  value={faqOrder}
                  onChange={(e) => setFaqOrder(Number(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="faqIsActive"
                  checked={faqIsActive}
                  onChange={(e) => setFaqIsActive(e.target.checked)}
                  className="rounded border-line text-ink-900 focus:ring-ink-900"
                />
                <label htmlFor="faqIsActive" className="font-semibold text-ink-900 cursor-pointer">
                  Display this FAQ publicly on the homepage
                </label>
              </div>

              <div className="pt-3 border-t border-line flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFaqModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={faqSaving}>
                  {editingFaqId ? 'Update FAQ' : 'Save FAQ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
