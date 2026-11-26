'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminBlogs,
  createAdminBlog,
  updateAdminBlog,
  deleteAdminBlog,
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDateTime, resolveImageUrl } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  X,
  CheckCircle2,
  ExternalLink,
  Tag,
} from 'lucide-react';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Vantero Atelier');
  const [tagsInput, setTagsInput] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await getAdminBlogs();
      if (res?.success) {
        setBlogs(res.blogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setAuthor('Vantero Atelier');
    setTagsInput('');
    setMetaTitle('');
    setMetaDescription('');
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    setEditingId(blog._id);
    setTitle(blog.title || '');
    setSlug(blog.slug || '');
    setExcerpt(blog.excerpt || '');
    setContent(blog.content || '');
    setCoverImage(blog.coverImage || '');
    setAuthor(blog.author || 'Vantero Atelier');
    setTagsInput(Array.isArray(blog.tags) ? blog.tags.join(', ') : '');
    setMetaTitle(blog.metaTitle || '');
    setMetaDescription(blog.metaDescription || '');
    setIsPublished(blog.isPublished !== false);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      // Auto-generate clean slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }

    setSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim(),
      author: author.trim(),
      tags,
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      isPublished,
    };

    try {
      if (editingId) {
        await updateAdminBlog(editingId, payload);
      } else {
        await createAdminBlog(payload);
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, blogTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) return;
    try {
      await deleteAdminBlog(id);
      fetchBlogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting article');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Vantero Journal & Editorial Blog Manager"
        subtitle="Publish styling guides, craftsmanship journals, and SEO-optimized articles"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </Button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 flex-1 text-left">
        {/* Blog Table */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-line text-ink-500 uppercase tracking-wider font-semibold bg-cream/30">
                  <th className="py-3 px-4">Article Title & Slug</th>
                  <th className="py-3 px-3">Author</th>
                  <th className="py-3 px-3">Tags</th>
                  <th className="py-3 px-3">Views</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Published Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {blogs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-400">
                      No blog articles found. Click &quot;Write New Article&quot; to publish your first post.
                    </td>
                  </tr>
                )}
                {blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        {b.coverImage ? (
                          <img
                            src={resolveImageUrl(b.coverImage)}
                            alt=""
                            className="w-12 h-9 object-cover rounded-xs border border-line flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-9 bg-cream border border-line rounded-xs flex items-center justify-center flex-shrink-0 text-ink-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-ink-900 line-clamp-1">{b.title}</p>
                          <p className="text-[11px] font-mono text-gold-600">/blogs/{b.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-ink-700 font-medium">
                      {b.author || 'Vantero Atelier'}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {b.tags?.slice(0, 3).map((t: string, i: number) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-paper border border-line rounded-xs text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-ink-600">
                      {b.views || 0}
                    </td>
                    <td className="py-3.5 px-3">
                      {b.isPublished ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone text-ink-500 border border-line rounded-xs text-[10px] font-bold uppercase tracking-wider">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-ink-500 font-mono">
                      {formatDateTime(b.publishedAt || b.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {b.isPublished && (
                          <a
                            href={`/blogs/${b.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-ink-400 hover:text-ink-900 transition-colors"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-ink-600 hover:text-gold-600 transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Article Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-paper border border-line rounded-md p-6 max-h-[92vh] overflow-y-auto shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-500 font-bold">
                  Journal Editorial
                </span>
                <h3 className="text-base font-bold text-ink-900">
                  {editingId ? 'Edit Journal Article' : 'Write New Journal Article'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-ink-500 hover:text-ink-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Article Title *"
                  placeholder="e.g. The Anatomy of Italian Calfskin Sneakers"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
                <Input
                  label="URL Slug *"
                  placeholder="anatomy-of-italian-calfskin-sneakers"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Author"
                  placeholder="e.g. Vantero Atelier"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
                <Input
                  label="Tags (Comma Separated)"
                  placeholder="e.g. Footwear, Leather Care, AW26"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <ImageUploadZone
                  folder="cms"
                  label="Article Cover Image (Multer Disk Storage)"
                  currentImage={coverImage ? { url: coverImage, publicId: '' } : null}
                  onImageUploaded={(img) => setCoverImage(img.url)}
                  onImageRemoved={() => setCoverImage('')}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Excerpt / Short Summary (For Cards & Search Snippets)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence overview of the article..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-line rounded-sm text-xs focus:outline-none"
                />
              </div>

              {/* Main Content */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Article Content (Supports markdown headings ## and bullet points - ) *
                </label>
                <textarea
                  rows={8}
                  placeholder="Write full article content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-line rounded-sm text-xs font-mono focus:outline-none leading-relaxed"
                />
              </div>

              {/* SEO Overrides */}
              <div className="p-3 bg-stone/30 border border-line rounded-sm space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700 block">
                  SEO & Search Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Meta Title (Optional)"
                    placeholder="Defaults to article title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  <Input
                    label="Meta Description (Optional)"
                    placeholder="Defaults to excerpt"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Publication Status */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-line text-ink-900 focus:ring-ink-900"
                />
                <label htmlFor="isPublished" className="font-semibold text-ink-900 cursor-pointer">
                  Publish Article Immediately (Visible on /blogs storefront)
                </label>
              </div>

              <div className="pt-4 border-t border-line flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={saving}>
                  {editingId ? 'Update Article' : 'Publish Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
