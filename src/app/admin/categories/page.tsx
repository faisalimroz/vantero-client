'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  createAdminSubCategory,
  deleteAdminSubCategory,
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { Plus, Edit2, Trash2, FolderPlus, X, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [categoryImage, setCategoryImage] = useState<{ url: string; publicId: string } | null>(null);
  const [savingCat, setSavingCat] = useState(false);

  // Subcategory Modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [parentCatId, setParentCatId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [savingSub, setSavingSub] = useState(false);

  const fetchCats = () => {
    setLoading(true);
    getAdminCategories()
      .then((res) => {
        if (res?.success) setCategories(res.categories || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openAddCategory = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setFeatured(false);
    setCategoryImage(null);
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setFeatured(Boolean(cat.featured));
    setCategoryImage(cat.image || null);
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCat(true);
    try {
      const payload = {
        name,
        slug,
        description,
        featured,
        image: categoryImage,
      };
      if (editingCategory) {
        await updateAdminCategory(editingCategory._id, payload);
      } else {
        await createAdminCategory(payload);
      }
      setCatModalOpen(false);
      fetchCats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category and its subcategories?')) return;
    try {
      await deleteAdminCategory(id);
      fetchCats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const openAddSub = (catId: string) => {
    setParentCatId(catId);
    setSubName('');
    setSubSlug('');
    setSubDesc('');
    setSubModalOpen(true);
  };

  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentCatId) return;
    setSavingSub(true);
    try {
      await createAdminSubCategory(parentCatId, {
        name: subName,
        slug: subSlug,
        description: subDesc,
      });
      setSubModalOpen(false);
      fetchCats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving subcategory');
    } finally {
      setSavingSub(false);
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm('Remove this subcategory?')) return;
    try {
      await deleteAdminSubCategory(subId);
      fetchCats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove subcategory');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Category & Sub-Category Manager"
        subtitle="Organize product catalog taxonomies, slugs, and navigation covers"
        actions={
          <Button variant="primary" size="sm" onClick={openAddCategory} className="flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 flex-1 text-left">
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="p-4 border-b border-line flex justify-between items-center bg-cream/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
              Active Taxonomies ({categories.length})
            </h3>
          </div>

          <div className="divide-y divide-line">
            {categories.map((cat) => (
              <div key={cat._id} className="p-5 space-y-4 hover:bg-cream/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    {cat.image?.url ? (
                      <img
                        src={cat.image.url}
                        alt=""
                        className="w-12 h-14 object-cover rounded-xs border border-line flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-14 bg-stone rounded-xs border border-line flex items-center justify-center text-ink-400 font-mono text-xs">
                        No Img
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-ink-900">{cat.name}</h4>
                        {cat.featured && (
                          <span className="text-[10px] bg-gold-500 text-white font-mono px-1.5 py-0.2 rounded-xs uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-ink-500">/{cat.slug}</p>
                      {cat.description && (
                        <p className="text-xs text-ink-600 line-clamp-1 max-w-md mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddSub(cat._id)}
                      className="text-xs flex items-center space-x-1"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Add Sub</span>
                    </Button>
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="p-2 text-ink-600 hover:text-ink-900 hover:bg-cream rounded-sm transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="p-2 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nested Subcategories List */}
                {cat.subCategories && cat.subCategories.length > 0 && (
                  <div className="pl-4 sm:pl-16 pt-2 border-t border-line/40 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mr-2">
                      Sub-Categories:
                    </span>
                    {cat.subCategories.map((sub: any) => (
                      <span
                        key={sub._id}
                        className="inline-flex items-center space-x-2 px-2.5 py-1 bg-cream border border-line rounded-xs text-xs text-ink-800"
                      >
                        <span>{sub.name}</span>
                        <button
                          onClick={() => handleDeleteSub(sub._id)}
                          className="text-ink-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-paper border border-line rounded-md p-6 shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-ink-500 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <Input
                label="Category Name"
                placeholder="e.g. Footwear & Sneakers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="SEO Slug (Auto-generated if empty)"
                placeholder="e.g. sneakers"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-line rounded-sm text-sm"
                />
              </div>

              <ImageUploadZone
                label="Category Cover (Cloudinary)"
                folder="categories"
                currentImage={categoryImage}
                onImageUploaded={(img) => setCategoryImage(img)}
                onImageRemoved={() => setCategoryImage(null)}
              />

              <label className="flex items-center space-x-2 text-xs text-ink-800 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded-xs border-line text-ink-900 focus:ring-ink-900"
                />
                <span>Highlight in Featured Storefront Grid</span>
              </label>

              <div className="pt-4 border-t border-line flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setCatModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={savingCat}>
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-paper border border-line rounded-md p-6 shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink-900">Add Nested Subcategory</h3>
              <button onClick={() => setSubModalOpen(false)} className="text-ink-500 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory} className="space-y-4">
              <Input
                label="Subcategory Name"
                placeholder="e.g. Court Low"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                required
              />
              <Input
                label="Slug"
                placeholder="e.g. court-low"
                value={subSlug}
                onChange={(e) => setSubSlug(e.target.value)}
              />
              <Input
                label="Description (Optional)"
                placeholder="Short description"
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
              />

              <div className="pt-4 border-t border-line flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={savingSub}>
                  Create Subcategory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
