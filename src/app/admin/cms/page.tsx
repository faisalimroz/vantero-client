'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminCMSSections, updateCMSSection } from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
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
  ShieldCheck
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
  image: {
    url: string;
    publicId?: string;
    alt?: string;
  };
  isActive?: boolean;
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
    image: {
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1800',
      publicId: 'hero/seed-hero-4.jpg',
      alt: 'Nocturne Artisanal Extrait de Parfum'
    },
    isActive: true
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

  const fetchSections = () => {
    setLoading(true);
    getAdminCMSSections()
      .then((res) => {
        if (res?.success) setSections(res.sections || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Storefront Dynamic CMS Manager"
        subtitle="Control 100% of storefront titles, descriptions, Hero carousel slides, and banners dynamically"
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

      <div className="p-6 sm:p-8 space-y-6 flex-1 text-left">
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex justify-between items-center bg-cream/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Configured Storefront Sections ({sections.length})
            </h3>
            <span className="text-[11px] text-ink-500">Live Changes Auto-Propagate</span>
          </div>

          <div className="divide-y divide-line">
            {sections.map((sec) => (
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
                        Dynamic Carousel (3–5 Slides)
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
                  {sec.sectionKey !== 'hero' && sec.images?.[0]?.url && (
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
                    <span>{sec.sectionKey === 'hero' ? 'Manage Carousel Slides' : 'Edit Content'}</span>
                  </Button>
                </div>
              </div>
            ))}
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
              {/* DYNAMIC HERO CAROUSEL MANAGER (3 to 5 Slides) */}
              {editingSection.sectionKey === 'hero' ? (
                <div className="space-y-6">
                  <div className="bg-cream/60 border border-line rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-gold-500" />
                        Hero Carousel Slides ({heroSlides.length} / 5 configured)
                      </h4>
                      <p className="text-[11px] text-ink-600 mt-0.5">
                        Minimum 3 and maximum 5 slides allowed. Each slide updates its image, titles, and CTAs dynamically.
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
                    {heroSlides.map((slide, idx) => (
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

                          {/* Slide Background Image Upload */}
                          <div className="space-y-2">
                            <ImageUploadZone
                              label="Slide Background Image (Multer Disk Storage)"
                              folder="hero"
                              currentImage={slide.image?.url ? { url: slide.image.url, publicId: slide.image.publicId || '' } : null}
                              onImageUploaded={(img) =>
                                handleSlideChange(idx, 'image', {
                                  url: img.url,
                                  publicId: img.publicId,
                                  alt: slide.title
                                })
                              }
                              onImageRemoved={() =>
                                handleSlideChange(idx, 'image', {
                                  url: '',
                                  publicId: '',
                                  alt: ''
                                })
                              }
                            />
                            {slide.image?.url && (
                              <p className="text-[10px] text-ink-500 font-mono truncate">
                                Path: {slide.image.url}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* STANDARD CMS SECTION EDITOR (For all other non-hero sections) */
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
    </div>
  );
}
