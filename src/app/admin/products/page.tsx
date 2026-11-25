'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminProducts,
  getAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadMedia,
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatBDT, resolveImageUrl } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  Sparkles,
  Layers,
  Tag,
  Check,
  Film,
  Play,
  Video,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CategorySizePreset {
  type: string;
  label: string;
  sizes: string[];
  defaultColor: string;
}

const getCategorySizePresets = (catId: string, subId: string, categoriesList: any[]): CategorySizePreset => {
  const selectedCat = categoriesList.find((c) => c._id === catId);
  const selectedSub = selectedCat?.subCategories?.find((s: any) => s._id === subId);

  const catSlug = (selectedCat?.slug || selectedCat?.name || '').toLowerCase();
  const subSlug = (selectedSub?.slug || selectedSub?.name || '').toLowerCase();

  // 1. Footwear (Shoes / Sneakers / Sandals / Loafers / Court Low)
  if (
    catSlug.includes('sneaker') ||
    catSlug.includes('footwear') ||
    catSlug.includes('shoe') ||
    subSlug.includes('court') ||
    subSlug.includes('high-top') ||
    subSlug.includes('loafer') ||
    subSlug.includes('runner')
  ) {
    return {
      type: 'footwear',
      label: 'Footwear (Standard BD / Asian: 39–45)',
      sizes: ['39', '40', '41', '42', '43', '44', '45'],
      defaultColor: 'Chalk White'
    };
  }

  // 2. Trousers / Pants / Jeans (Waist Sizes)
  if (
    subSlug.includes('trouser') ||
    subSlug.includes('pant') ||
    subSlug.includes('jeans') ||
    catSlug.includes('trouser')
  ) {
    return {
      type: 'waist',
      label: 'Trousers & Pants (BD Waist: 28–38)',
      sizes: ['28', '30', '32', '34', '36', '38'],
      defaultColor: 'Oatmeal'
    };
  }

  // 3. Clothing / Apparel (Shirts, T-Shirts, Panjabi, Polo, Jackets, Overcoats, Hoodies)
  if (
    catSlug.includes('clothing') ||
    catSlug.includes('apparel') ||
    subSlug.includes('shirt') ||
    subSlug.includes('jacket') ||
    subSlug.includes('overcoat') ||
    subSlug.includes('knitwear') ||
    subSlug.includes('t-shirt')
  ) {
    return {
      type: 'apparel',
      label: 'Apparel & Tops (Standard BD: S–XXL)',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      defaultColor: 'Charcoal'
    };
  }

  // 4. Fragrance / Attar / Perfume (Volume Sizes)
  if (
    catSlug.includes('fragrance') ||
    catSlug.includes('perfume') ||
    catSlug.includes('attar')
  ) {
    return {
      type: 'fragrance',
      label: 'Fragrance & Attar (Volume: 30ml, 50ml, 100ml)',
      sizes: ['30ml', '50ml', '100ml'],
      defaultColor: 'Standard'
    };
  }

  // 5. The Boys Edit (Junior sizes)
  if (catSlug.includes('boy') || catSlug.includes('junior')) {
    if (subSlug.includes('footwear') || subSlug.includes('shoe') || subSlug.includes('court')) {
      return {
        type: 'boys_footwear',
        label: 'Boys Footwear (Junior: 30–36)',
        sizes: ['30', '32', '34', '36'],
        defaultColor: 'Chalk White'
      };
    }
    return {
      type: 'boys_apparel',
      label: 'Boys Apparel (Ages / Sizes)',
      sizes: ['6-7Y', '8-9Y', '10-11Y', '12-13Y'],
      defaultColor: 'Navy'
    };
  }

  // 6. Accessories / Lifestyle / Default
  return {
    type: 'lifestyle',
    label: 'Accessories & Lifestyle (One-Size)',
    sizes: ['Free Size'],
    defaultColor: 'Standard'
  };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number | string>('');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState<number | string>(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; publicId: string; isPrimary?: boolean }>>([]);
  const [media, setMedia] = useState<Array<{ url: string; type: 'image' | 'video'; publicId?: string; order?: number }>>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [variants, setVariants] = useState<Array<{ size: string; color?: string; stock: number; sku?: string }>>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAdminProducts({ limit: 50 }), getAdminCategories()])
      .then(([prodRes, catRes]) => {
        if (prodRes?.success) setProducts(prodRes.products || []);
        if (catRes?.success) setCategories(catRes.categories || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSku(`VT-${Date.now().toString().slice(-6)}`);
    const defaultCat = categories[0]?._id || '';
    setCategory(defaultCat);
    setSubCategory('');
    setDescription('');
    setBasePrice('');
    setDiscountType('none');
    setDiscountValue(0);
    setIsFeatured(false);
    setImages([]);
    setMedia([]);
    setMediaError(null);

    // Category-aware initial variants (e.g. 40 and 41 for footwear instead of mixed EU/XL)
    const preset = getCategorySizePresets(defaultCat, '', categories);
    const initialSizes = preset.sizes.slice(0, 2);
    setVariants(
      initialSizes.map((s) => ({
        size: s,
        color: preset.defaultColor,
        stock: 10
      }))
    );
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p._id);
    setTitle(p.title || '');
    setSlug(p.slug || '');
    setSku(p.sku || '');
    setCategory(p.category?._id || p.category || '');
    setSubCategory(p.subCategory?._id || p.subCategory || '');
    setDescription(p.description || '');
    setBasePrice(p.basePrice || '');
    setDiscountType(p.discount?.discountType || 'none');
    setDiscountValue(p.discount?.discountValue || 0);
    setIsFeatured(Boolean(p.isFeatured));
    setImages(p.images || []);

    // Load media gallery up to 5 items (supporting photos & videos, or legacy images)
    const initialMedia = (p.media && p.media.length > 0)
      ? p.media
      : (p.images || []).map((img: any, idx: number) => ({
          url: typeof img === 'string' ? img : img.url,
          type: 'image' as const,
          publicId: img.publicId || '',
          order: idx
        }));
    setMedia(initialMedia.slice(0, 5));
    setMediaError(null);
    setVariants(p.variants || []);
    setModalOpen(true);
  };

  // Media Management Handlers
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (media.length >= 5) {
      setMediaError('Maximum limit of 5 media items already reached.');
      return;
    }

    setMediaError(null);
    setMediaUploading(true);

    try {
      const res = await uploadMedia(file, 'products');
      if (res?.success) {
        const item = {
          url: res.media?.url || res.image?.url || res.file?.url,
          type: (res.mediaType || res.media?.type || res.image?.type || (file.type.startsWith('video/') ? 'video' : 'image')) as 'image' | 'video',
          publicId: res.media?.publicId || res.image?.publicId || res.file?.publicId || '',
          order: media.length
        };
        setMedia([...media, item]);
      } else {
        throw new Error(res?.message || 'Upload failed.');
      }
    } catch (err: any) {
      setMediaError(err.response?.data?.message || err.message || 'Error uploading file.');
    } finally {
      setMediaUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleMoveMedia = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= media.length) return;
    const copy = [...media];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setMedia(copy);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const copy = [...media];
    const [selected] = copy.splice(index, 1);
    copy.unshift(selected);
    setMedia(copy);
  };

  // Category presets helper based on currently selected category & subcategory
  const activePreset = getCategorySizePresets(category, subCategory, categories);

  const handleAddVariant = () => {
    // Find next unused size from category preset if available, or first preset size
    const existingSizes = new Set(variants.map((v) => v.size));
    const nextAvailable = activePreset.sizes.find((s) => !existingSizes.has(s)) || activePreset.sizes[0] || 'Free Size';

    setVariants([
      ...variants,
      { size: nextAvailable, color: activePreset.defaultColor, stock: 10 }
    ]);
  };

  const handleAddSpecificSize = (sz: string) => {
    if (variants.some((v) => v.size === sz)) return;
    setVariants([
      ...variants,
      { size: sz, color: activePreset.defaultColor, stock: 10 }
    ]);
  };

  const handleGenerateAllSizes = () => {
    const existingMap = new Map(variants.map((v) => [v.size, v]));
    const newVariants = activePreset.sizes.map((sz) => {
      if (existingMap.has(sz)) return existingMap.get(sz)!;
      return {
        size: sz,
        color: activePreset.defaultColor,
        stock: 10
      };
    });
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, val: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = val;
    setVariants(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !basePrice) {
      alert('Title, category, and base price are required.');
      return;
    }

    if (variants.length === 0) {
      alert('At least one size variant with stock is required.');
      return;
    }

    setSaving(true);
    try {
      // Derive primary image and still image list for backward compatibility & listing cards
      const imageMedia = media.filter((m) => m.type === 'image');
      const imagesPayload = imageMedia.map((m, idx) => ({
        url: m.url,
        publicId: m.publicId || `products/${Date.now()}-${idx}`,
        isPrimary: idx === 0
      }));

      const payload = {
        title,
        slug,
        sku,
        category,
        subCategory: subCategory || null,
        description,
        basePrice: Number(basePrice),
        discount: {
          discountType,
          discountValue: Number(discountValue),
        },
        isFeatured,
        media: media.slice(0, 5),
        images: imagesPayload,
        variants,
      };

      if (editingId) {
        await updateAdminProduct(editingId, payload);
      } else {
        await createAdminProduct(payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Permanently delete this product and remove its image files?')) return;
    try {
      await deleteAdminProduct(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Find subcategories of selected category
  const selectedCatObj = categories.find((c) => c._id === category);
  const subCategoriesList = selectedCatObj?.subCategories || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 ">
      <AdminHeader
        title="Products & Discounts Manager"
        subtitle="Manage product catalog, inventory variants with Bangladesh category sizes, and dynamic promotional markdowns"
        actions={
          <Button variant="primary" size="sm" onClick={openAddModal} className="flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 flex-1 text-left">
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex justify-between items-center bg-cream/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Active Inventory ({products.length} products)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-line text-ink-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Base Price</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Sizes in Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {products.map((p) => {
                  const stock = p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
                  const hasDiscount = p.discount && p.discount.discountType !== 'none';
                  return (
                    <tr key={p._id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img
                          src={resolveImageUrl(p.images?.[0]?.url) || ''}
                          alt=""
                          className="w-10 h-12 object-cover rounded-xs border border-line flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-ink-900">{p.title}</p>
                          <p className="text-[11px] text-ink-500 font-mono">/{p.slug}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-ink-600">{p.sku}</td>
                      <td className="py-3 px-3 text-ink-700 uppercase text-[11px]">
                        {p.category?.name || 'General'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-ink-900">
                        {formatBDT(p.basePrice)}
                      </td>
                      <td className="py-3 px-3">
                        {hasDiscount ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xs font-bold">
                            {p.discount.discountType === 'percentage'
                              ? `-${p.discount.discountValue}%`
                              : `৳${p.discount.discountValue} OFF`}
                          </span>
                        ) : (
                          <span className="text-ink-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-ink-900 block">{stock} total</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {p.variants?.slice(0, 4).map((v: any, vIdx: number) => (
                            <span key={vIdx} className="text-[10px] bg-stone px-1.5 py-0.2 rounded-xs font-mono text-ink-700">
                              {v.size} ({v.stock})
                            </span>
                          ))}
                          {p.variants?.length > 4 && (
                            <span className="text-[10px] text-ink-400 font-mono">+{p.variants.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-ink-600 hover:text-ink-900 hover:bg-stone rounded-xs transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-paper border border-line rounded-md p-6 max-h-[92vh] overflow-y-auto shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-lg font-bold text-ink-900">
                {editingId ? 'Edit Product Piece' : 'Add New Product to Catalog'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-ink-400 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Product Title"
                  placeholder="e.g. Court Low Sneakers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  label="SKU Code"
                  placeholder="VT-SNK-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory('');
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-line rounded-sm text-sm focus:outline-none focus:border-ink-900"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Sub-Category (Optional)
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-line rounded-sm text-sm focus:outline-none focus:border-ink-900"
                  >
                    <option value="">None / General</option>
                    {subCategoriesList.map((s: any) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Base Price (BDT ৳)"
                  type="number"
                  placeholder="14500"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-line rounded-sm text-sm"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳)</option>
                  </select>
                </div>

                {discountType !== 'none' && (
                  <Input
                    label={discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Flat (৳)'}
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Artisanal construction notes, silhouette details, material origin..."
                  className="w-full px-4 py-2 bg-white border border-line rounded-sm text-sm text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              {/* PRODUCT MULTI-IMAGE & VIDEO GALLERY MANAGER (MAX 5 ITEMS) */}
              <div className="pt-4 border-t border-line space-y-3 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-gold-500" />
                      Showcase Media Gallery (Max 5 Photos & Videos)
                    </h4>
                    <p className="text-[11px] text-ink-500">
                      Upload high-res photos (JPEG/PNG/WebP ≤5MB) or product showcase videos (MP4/WebM/MOV ≤50MB).
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xs border self-start sm:self-auto ${
                      media.length >= 5
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-stone/50 text-ink-700 border-line'
                    }`}
                  >
                    {media.length} / 5 media slots used
                  </span>
                </div>

                {/* Media Preview Grid */}
                {media.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    {media.map((item, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-[3/4] bg-stone/40 rounded-sm overflow-hidden border-2 group transition-all ${
                          idx === 0
                            ? 'border-gold-500 ring-2 ring-gold-500/20'
                            : 'border-line hover:border-ink-400'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full relative bg-black flex items-center justify-center">
                            <video
                              src={resolveImageUrl(item.url)}
                              muted
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-ink-900 shadow-sm">
                                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                              </div>
                            </div>
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-ink-900/90 text-white text-[9px] font-mono uppercase tracking-wider rounded-xs">
                              Video
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <img
                              src={resolveImageUrl(item.url)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-gold-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-xs shadow-sm">
                                Primary Cover
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Toolbar on Hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-ink-900/85 backdrop-blur-xs p-1 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveMedia(idx, 'left')}
                              className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-white"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === media.length - 1}
                              onClick={() => handleMoveMedia(idx, 'right')}
                              className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-white"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            {item.type === 'image' && idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(idx)}
                                className="px-1 text-[10px] text-gold-400 hover:text-gold-300 font-semibold"
                                title="Set as primary cover"
                              >
                                Cover
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                            title="Remove media piece"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Trigger Zone or Limit Reached Notice */}
                {media.length < 5 ? (
                  <div className="relative">
                    <label
                      className={`flex flex-col items-center justify-center border-2 border-dashed border-line hover:border-ink-600 rounded-sm p-4 text-center cursor-pointer transition-colors ${
                        mediaUploading
                          ? 'pointer-events-none opacity-60 bg-stone/20'
                          : 'bg-white hover:bg-stone/10'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                        onChange={handleMediaUpload}
                        disabled={mediaUploading}
                        className="hidden"
                      />
                      {mediaUploading ? (
                        <div className="flex items-center space-x-2 text-xs font-medium text-ink-700">
                          <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                          <span>Saving media to local storage (Multer diskStorage)...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-gold-500 mb-1.5">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-semibold text-ink-900">
                            Click or drag to add media piece ({5 - media.length} slot
                            {5 - media.length === 1 ? '' : 's'} remaining)
                          </p>
                          <p className="text-[11px] text-ink-500 mt-0.5">
                            Supports JPG, PNG, WebP (≤5MB) and MP4, WebM, MOV clips (≤50MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-stone/40 border border-line rounded-sm text-xs text-ink-700 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Maximum limit of <strong>5 media items</strong> reached for this product. Remove or reorder
                      items to add new media.
                    </span>
                  </div>
                )}

                {mediaError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{mediaError}</span>
                  </div>
                )}
              </div>

              {/* CATEGORY-AWARE SIZES & INVENTORY STOCK (BANGLADESH MARKET ALIGNED) */}
              <div className="pt-4 border-t border-line space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-gold-500" />
                      Sizes & Inventory Stock
                    </h4>
                    <span className="text-[11px] text-ink-500 font-mono">
                      Category Standard: <strong className="text-gold-600">{activePreset.label}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleGenerateAllSizes}
                      className="text-xs font-semibold text-ink-800 hover:text-gold-600 px-2.5 py-1 bg-cream rounded-sm border border-line flex items-center gap-1 transition-colors"
                      title="Populate all recommended sizes for this category with stock = 10"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                      <span>Generate All Sizes</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-xs font-semibold text-white px-3 py-1 bg-ink-900 hover:bg-ink-800 rounded-sm flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Size</span>
                    </button>
                  </div>
                </div>

                {/* Category Preset Quick-Select Chips */}
                <div className="p-3 bg-cream/50 rounded-sm border border-line space-y-1.5">
                  <span className="text-[11px] text-ink-500 block uppercase font-mono">
                    Quick-Add Category Size Chips:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePreset.sizes.map((sz) => {
                      const isAdded = variants.some((v) => v.size === sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleAddSpecificSize(sz)}
                          className={`px-2.5 py-1 rounded-xs text-xs font-mono font-semibold transition-all flex items-center gap-1 ${
                            isAdded
                              ? 'bg-ink-900 text-white'
                              : 'bg-white hover:bg-gold-500 hover:text-white border border-line text-ink-800'
                          }`}
                        >
                          {isAdded && <Check className="w-3 h-3 text-gold-400" />}
                          <span>{sz}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold uppercase text-ink-500 px-1">
                    <div className="col-span-4">Size / Variant</div>
                    <div className="col-span-4">Color / Finish</div>
                    <div className="col-span-3">Stock Units</div>
                    <div className="col-span-1 text-center">Del</div>
                  </div>

                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center text-xs">
                      {/* Size Selector with Category Suggestions & Custom Input */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          list={`size-options-${i}`}
                          placeholder="e.g. 42"
                          value={v.size}
                          onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm bg-white font-mono font-bold text-ink-900"
                          required
                        />
                        <datalist id={`size-options-${i}`}>
                          {activePreset.sizes.map((sz) => (
                            <option key={sz} value={sz} />
                          ))}
                        </datalist>
                      </div>

                      {/* Color */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="e.g. Charcoal"
                          value={v.color || ''}
                          onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm bg-white text-ink-800"
                        />
                      </div>

                      {/* Stock */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Stock"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-line rounded-sm bg-white font-mono text-ink-900"
                          required
                          min={0}
                        />
                      </div>

                      {/* Delete */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="text-ink-400 hover:text-rose-600 p-1"
                          title="Remove Size Variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={saving}>
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
