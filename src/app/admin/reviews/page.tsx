'use client';

import React, { useState, useEffect } from 'react';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  uploadImage
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resolveImageUrl } from '@/lib/utils';
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  UploadCloud,
  MessageSquare,
  AlertCircle,
  Loader2,
  MapPin,
  Tag
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'hidden'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('Gulshan 2, Dhaka');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [productName, setProductName] = useState('Court Low — Chalk / Gum');
  const [categoryLabel, setCategoryLabel] = useState('Sneakers');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPublicId, setAvatarPublicId] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReviewsData = () => {
    setLoading(true);
    getReviews({ all: true })
      .then((res) => {
        if (res?.success) setReviews(res.reviews || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCustomerName('');
    setCustomerLocation('Dhaka, Bangladesh');
    setRating(5);
    setTitle('');
    setComment('');
    setProductName('');
    setCategoryLabel('Apparel');
    setAvatarUrl('');
    setAvatarPublicId('');
    setIsPublished(true);
    setSortOrder(reviews.length + 1);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (rev: any) => {
    setEditingId(rev._id);
    setCustomerName(rev.customerName || '');
    setCustomerLocation(rev.customerLocation || '');
    setRating(rev.rating || 5);
    setTitle(rev.title || '');
    setComment(rev.comment || '');
    setProductName(rev.productName || '');
    setCategoryLabel(rev.categoryLabel || '');
    setAvatarUrl(rev.avatarUrl || '');
    setAvatarPublicId(rev.avatarPublicId || '');
    setIsPublished(rev.isPublished !== false);
    setSortOrder(rev.sortOrder || 0);
    setFormError(null);
    setModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFormError(null);
    try {
      const res = await uploadImage(file, 'misc');
      if (res?.success) {
        setAvatarUrl(res.image?.url || res.media?.url);
        setAvatarPublicId(res.image?.publicId || res.media?.publicId || '');
      } else {
        throw new Error(res?.message || 'Upload failed');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      setFormError('Customer name and review comment are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      customerName: customerName.trim(),
      customerLocation: customerLocation.trim(),
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      productName: productName.trim(),
      categoryLabel: categoryLabel.trim(),
      avatarUrl,
      avatarPublicId,
      isPublished,
      sortOrder: Number(sortOrder) || 0
    };

    try {
      if (editingId) {
        await updateReview(editingId, payload);
      } else {
        await createReview(payload);
      }
      setModalOpen(false);
      fetchReviewsData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error saving review.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (rev: any) => {
    try {
      await updateReview(rev._id, { isPublished: !rev.isPublished });
      fetchReviewsData();
    } catch (err) {
      console.error('Failed to toggle review visibility:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      await deleteReview(id);
      fetchReviewsData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting review.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerLocation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'published') return r.isPublished === true;
    if (filterStatus === 'hidden') return r.isPublished === false;
    return true;
  });

  return (
    <div className="flex-1 min-h-screen bg-paper pb-16">
      <AdminHeader
        title="Customer Reviews Manager"
        subtitle="Curate verified client feedback, star ratings, and artisanal product experiences"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 font-sans flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-500" />
              Homepage Customer Reviews & Testimonials
            </h2>
            <p className="text-xs text-ink-500 mt-1">
              Curate verified client feedback, star ratings, and artisanal product experiences showcased on the storefront homepage.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Review
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-line rounded-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, location, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-paper border border-line rounded-sm text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-ink-500 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-paper border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
            >
              <option value="all">All Reviews ({reviews.length})</option>
              <option value="published">Published ({reviews.filter((r) => r.isPublished).length})</option>
              <option value="hidden">Hidden ({reviews.filter((r) => !r.isPublished).length})</option>
            </select>
          </div>
        </div>

        {/* Reviews Grid / Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-ink-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
            <span>Loading customer reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 bg-white border border-line rounded-sm text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-ink-300 mx-auto" />
            <p className="text-sm font-semibold text-ink-800">No reviews found</p>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No reviews match your current search criteria.'
                : 'No client reviews have been published yet. Click "Add New Review" to publish the first testimonial.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredReviews.map((rev) => {
              const initials = (rev.customerName || 'V')
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={rev._id}
                  className={`bg-white border rounded-sm p-5 space-y-4 shadow-xs relative transition-all ${
                    rev.isPublished
                      ? 'border-line hover:border-ink-400'
                      : 'border-dashed border-ink-300 opacity-60 bg-stone/20'
                  }`}
                >
                  {/* Top Bar: Rating, Status, and Controls */}
                  <div className="flex items-center justify-between pb-2 border-b border-line/60">
                    <div className="flex items-center space-x-1 text-gold-500">
                      {[...Array(rev.rating || 5)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs ${
                          rev.isPublished
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone/50 text-ink-500 border border-line'
                        }`}
                      >
                        {rev.isPublished ? 'Live' : 'Hidden'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(rev)}
                        className="p-1 text-ink-400 hover:text-ink-900 transition-colors"
                        title={rev.isPublished ? 'Hide from storefront' : 'Publish to storefront'}
                      >
                        {rev.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(rev)}
                        className="p-1 text-ink-400 hover:text-ink-900 transition-colors"
                        title="Edit review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(rev._id)}
                        className="p-1 text-ink-400 hover:text-rose-600 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-1.5">
                    {rev.title && (
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 line-clamp-1">
                        {rev.title}
                      </h4>
                    )}
                    <p className="text-xs text-ink-700 leading-relaxed italic line-clamp-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Customer Metadata Footer */}
                  <div className="pt-3 border-t border-line/60 flex items-center space-x-3">
                    {rev.avatarUrl ? (
                      <img
                        src={resolveImageUrl(rev.avatarUrl)}
                        alt={rev.customerName}
                        className="w-9 h-9 rounded-full object-cover border border-line shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-cream text-gold-600 font-mono font-bold text-xs flex items-center justify-center border border-line shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-ink-900 truncate">{rev.customerName}</p>
                      <p className="text-[11px] text-ink-500 truncate">
                        {rev.customerLocation || 'Bangladesh'}
                        {rev.productName && (
                          <> · <span className="text-ink-700 italic">{rev.productName}</span></>
                        )}
                      </p>
                    </div>

                    {rev.categoryLabel && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-stone/40 border border-line rounded-xs text-ink-500">
                        {rev.categoryLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add or Edit Review */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-paper border border-line rounded-md p-6 max-h-[92vh] overflow-y-auto shadow-2xl text-left space-y-4">
              <div className="flex justify-between items-center border-b border-line pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gold-500 font-bold">
                    Storefront Testimonial
                  </span>
                  <h3 className="text-base font-bold text-ink-900">
                    {editingId ? 'Edit Customer Review' : 'Create Customer Review'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-ink-500 hover:text-ink-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Customer Full Name *"
                    placeholder="e.g. Faheem Rahman"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />

                  <Input
                    label="Customer Location / City"
                    placeholder="e.g. Gulshan 2, Dhaka"
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Star Rating (1–5) *
                    </label>
                    <div className="flex items-center space-x-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className={`p-1.5 rounded-sm transition-colors ${
                            rating >= starVal ? 'text-gold-500' : 'text-ink-300 hover:text-gold-300'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold text-ink-900 ml-2">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Product Name (Optional)"
                    placeholder="e.g. Court Low — Chalk / Gum"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />

                  <Input
                    label="Category Tag (Optional)"
                    placeholder="e.g. Footwear, Apparel"
                    value={categoryLabel}
                    onChange={(e) => setCategoryLabel(e.target.value)}
                  />
                </div>

                <Input
                  label="Headline / Catchy Title (Optional)"
                  placeholder="e.g. European Luxury Craftsmanship in Dhaka"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Review Comment / Client Quote *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe their experience with Vantero footwear or tailoring..."
                    className="w-full px-4 py-2.5 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                    required
                  />
                </div>

                {/* Avatar Photo Upload via Multer */}
                <div className="p-3.5 bg-cream/50 border border-line rounded-sm space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-800 block">
                    Customer Photo / Avatar (Multer Local Storage)
                  </span>
                  <div className="flex items-center space-x-4">
                    {avatarUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-line shrink-0">
                        <img src={resolveImageUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl('');
                            setAvatarPublicId('');
                          }}
                          className="absolute inset-0 bg-ink-900/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-paper border border-dashed border-line flex items-center justify-center text-ink-400 shrink-0">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-sm text-xs font-medium text-ink-800 hover:border-ink-600 transition-colors">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-500" />
                            <span>Uploading photo...</span>
                          </>
                        ) : (
                          <span>{avatarUrl ? 'Replace Photo' : 'Upload Client Photo'}</span>
                        )}
                      </label>
                      <p className="text-[10px] text-ink-400 mt-0.5">
                        JPEG, PNG, WebP up to 5MB. Monogram initials will be used if omitted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visibility & Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isPublishedCheck"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded-xs border-line text-ink-900 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-ink-900 cursor-pointer">
                      Publish immediately on homepage
                    </label>
                  </div>

                  <Input
                    label="Display Sort Order (Ascending)"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  />
                </div>

                {/* Live Card Preview Box */}
                <div className="pt-3 border-t border-line space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold-600 font-bold block">
                    Storefront Appearance Preview
                  </span>
                  <div className="p-4 bg-paper border border-line rounded-sm space-y-3">
                    <div className="flex items-center space-x-1 text-gold-500">
                      {[...Array(rating)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {title && <p className="text-xs font-bold text-ink-900">{title}</p>}
                    <p className="text-xs text-ink-700 italic">
                      "{comment || 'Client quote text will preview here...'}"
                    </p>
                    <div className="pt-2 border-t border-line/60 flex items-center space-x-2 text-[11px]">
                      <span className="font-bold text-ink-900">{customerName || 'Client Name'}</span>
                      <span className="text-ink-400">·</span>
                      <span className="text-ink-500">{customerLocation || 'Dhaka'}</span>
                      {productName && (
                        <>
                          <span className="text-ink-400">·</span>
                          <span className="text-ink-700 italic">{productName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={saving}>
                    {editingId ? 'Save Review' : 'Create & Publish'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
