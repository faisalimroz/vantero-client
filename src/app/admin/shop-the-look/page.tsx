'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminShopTheLooks,
  getAdminProducts,
  createAdminShopTheLook,
  updateAdminShopTheLook,
  deleteAdminShopTheLook,
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { formatBDT } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, Check, Search, Layers } from 'lucide-react';

export default function AdminShopTheLookPage() {
  const [looks, setLooks] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Curated Ensemble');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<{ url: string; publicId: string } | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAdminShopTheLooks(), getAdminProducts({ limit: 100 })])
      .then(([looksRes, prodRes]) => {
        if (looksRes?.success) setLooks(looksRes.looks || []);
        if (prodRes?.success) setAvailableProducts(prodRes.products || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('Curated Ensemble');
    setSlug('');
    setDescription('');
    setCoverImage(null);
    setSelectedProductIds([]);
    setModalOpen(true);
  };

  const openEditModal = (look: any) => {
    setEditingId(look._id);
    setTitle(look.title || '');
    setSubtitle(look.subtitle || '');
    setSlug(look.slug || '');
    setDescription(look.description || '');
    setCoverImage(look.coverImage || null);
    setSelectedProductIds(look.products?.map((p: any) => p.product?._id || p.product) || []);
    setModalOpen(true);
  };

  const toggleSelectProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSaveLook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage) {
      alert('Title and cover image are required.');
      return;
    }
    if (selectedProductIds.length < 2) {
      alert('Please select at least 2 products across categories for a Shop the Look ensemble.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        subtitle,
        slug,
        description,
        coverImage,
        products: selectedProductIds.map((pid, idx) => ({
          product: pid,
          displayOrder: idx + 1,
          hotspot: { top: 30 + (idx * 20), left: 45 + (idx % 2 === 0 ? 0 : 10) }
        })),
      };

      if (editingId) {
        await updateAdminShopTheLook(editingId, payload);
      } else {
        await createAdminShopTheLook(payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving lookbook');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this curated look?')) return;
    try {
      await deleteAdminShopTheLook(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove look');
    }
  };

  const filteredCatalog = availableProducts.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Customized Product / Shop The Look Builder"
        subtitle="Curate multi-product outfits and editorial lookbooks with interactive add-to-bag bundles"
        actions={
          <Button variant="primary" size="sm" onClick={openAddModal} className="flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Create New Look</span>
          </Button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 flex-1 text-left">
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex justify-between items-center bg-cream/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Published Ensembles ({looks.length})
            </h3>
          </div>

          <div className="divide-y divide-line">
            {looks.map((look) => (
              <div
                key={look._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={look.coverImage?.url || ''}
                    alt=""
                    className="w-16 h-20 object-cover rounded-xs border border-line flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gold-500 font-bold">
                      {look.subtitle || 'Ensemble'}
                    </span>
                    <h4 className="text-sm font-bold text-ink-900">{look.title}</h4>
                    <p className="text-xs font-mono text-ink-500">/{look.slug}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {look.products?.map((item: any, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] bg-stone px-2 py-0.5 rounded-xs border border-line text-ink-800"
                        >
                          {item.product?.title || 'Product'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(look)}
                    className="p-2 text-ink-600 hover:text-ink-900 hover:bg-cream rounded-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(look._id)}
                    className="p-2 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Builder Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-paper border border-line rounded-md p-6 max-h-[92vh] overflow-y-auto shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink-900">
                {editingId ? 'Edit Shop The Look' : 'Curate Multi-Product Bundle'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-ink-500 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLook} className="space-y-4">
              <Input
                label="Look Title"
                placeholder="e.g. Wear Your Identity: The AW26 Tailored Edit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Subtitle Tag"
                  placeholder="Curated Ensemble"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
                <Input
                  label="SEO Slug"
                  placeholder="wear-your-identity-aw26"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Styling Narrative
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-line rounded-sm text-sm"
                />
              </div>

              {/* Cover Image */}
              <ImageUploadZone
                label="Lookbook Editorial Cover (Cloudinary)"
                folder="looks"
                currentImage={coverImage}
                onImageUploaded={(img) => setCoverImage(img)}
                onImageRemoved={() => setCoverImage(null)}
              />

              {/* Searchable Multi-Product Picker */}
              <div className="pt-2 border-t border-line space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900">
                    Select 2+ Linked Pieces ({selectedProductIds.length} Selected)
                  </label>
                  <span className="text-[11px] text-ink-500">Pick across categories</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search product title or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-line rounded-sm text-xs"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-line rounded-sm divide-y divide-line bg-white">
                  {filteredCatalog.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod._id);
                    return (
                      <div
                        key={prod._id}
                        onClick={() => toggleSelectProduct(prod._id)}
                        className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-gold-500/10 font-semibold' : 'hover:bg-cream'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <img
                            src={prod.images?.[0]?.url || ''}
                            alt=""
                            className="w-8 h-10 object-cover rounded-xs border border-line flex-shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-ink-900 truncate">{prod.title}</p>
                            <p className="text-[10px] text-ink-500 font-mono">{prod.sku} · {formatBDT(prod.basePrice)}</p>
                          </div>
                        </div>

                        <div className="w-5 h-5 rounded-xs border border-line flex items-center justify-center bg-white">
                          {isSelected && <Check className="w-3.5 h-3.5 text-gold-500 font-bold" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={saving}>
                  Publish Lookbook
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
