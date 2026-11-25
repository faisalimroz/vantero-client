'use client';

import React, { useState, useEffect } from 'react';
import { getPolicyByKey, updatePolicy } from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PolicyView } from '@/components/storefront/PolicyView';
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Check,
  Save,
  Clock,
  Eye,
  Edit3,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface PolicyDoc {
  key: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  lastUpdated: string;
  isPublished: boolean;
}

const POLICY_TABS = [
  {
    key: 'terms-of-service',
    label: 'Terms of Service',
    description: 'Client agreement, Cash on Delivery, authenticity guarantee and governing law.',
    icon: FileText,
    url: '/terms-of-service'
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy',
    description: 'Google Authentication, Bangladeshi delivery address privacy and cookie standards.',
    icon: ShieldCheck,
    url: '/privacy-policy'
  },
  {
    key: 'refund-policy',
    label: 'Returns & Refund Policy',
    description: '7-day return guarantee, doorstep size exchanges, and COD settlement rules.',
    icon: RotateCcw,
    url: '/refund-policy'
  }
];

export default function AdminPoliciesPage() {
  const [activeTab, setActiveTab] = useState<'terms-of-service' | 'privacy-policy' | 'refund-policy'>('terms-of-service');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const [policyData, setPolicyData] = useState<PolicyDoc>({
    key: 'terms-of-service',
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    isPublished: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchPolicy = (key: string) => {
    setLoading(true);
    setSaveError(null);
    getPolicyByKey(key)
      .then((res) => {
        if (res?.success && res.policy) {
          const pol = res.policy;
          setPolicyData({
            key: pol.key,
            title: pol.title || '',
            subtitle: pol.subtitle || '',
            summary: pol.summary || '',
            content: pol.content || '',
            lastUpdated: pol.lastUpdated ? new Date(pol.lastUpdated).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            isPublished: pol.isPublished !== false
          });
        }
      })
      .catch((err) => {
        setSaveError(err.response?.data?.message || 'Failed to load policy document.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicy(activeTab);
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyData.title.trim() || !policyData.content.trim()) {
      setSaveError('Policy title and document content are required.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await updatePolicy(activeTab, {
        title: policyData.title.trim(),
        subtitle: policyData.subtitle.trim(),
        summary: policyData.summary.trim(),
        content: policyData.content,
        lastUpdated: policyData.lastUpdated,
        isPublished: policyData.isPublished
      });

      if (res?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(res?.message || 'Error updating policy');
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || 'Error saving policy.');
    } finally {
      setSaving(false);
    }
  };

  const currentTabMeta = POLICY_TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="flex-1 min-h-screen bg-paper pb-16">
      <AdminHeader
        title="Legal & Policy Manager"
        subtitle="Manage Terms of Service, Privacy Policy, and Returns & Refund Policy"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 font-sans flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
              Storefront Legal Policies & Customer Terms
            </h2>
            <p className="text-xs text-ink-500 mt-1">
              Maintain binding Terms of Service, Privacy Policy, and 7-Day Returns Policy persisted to MongoDB and rendered dynamically on the storefront.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={currentTabMeta.url}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-sm text-xs font-semibold text-ink-800 hover:text-ink-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live Page
            </Link>
          </div>
        </div>

        {/* Tab Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POLICY_TABS.map((tab) => {
            const isCurrent = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setViewMode('edit');
                }}
                className={`p-4 rounded-sm border text-left transition-all relative ${
                  isCurrent
                    ? 'bg-white border-gold-500 ring-2 ring-gold-500/10 shadow-sm'
                    : 'bg-cream/40 border-line hover:border-ink-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xs ${isCurrent ? 'bg-gold-500 text-white' : 'bg-paper text-ink-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wider">
                    {tab.url}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink-900">{tab.label}</h3>
                <p className="text-[11px] text-ink-500 mt-1 line-clamp-2 leading-relaxed">
                  {tab.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Status Messages */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <strong>{currentTabMeta.label}</strong> updated successfully and live on storefront!
            </span>
          </div>
        )}

        {saveError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Main Editor Card */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-xs">
          {/* Subheader Toolbar: Mode Switch (Edit vs Preview) */}
          <div className="p-4 border-b border-line bg-cream/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                  viewMode === 'edit'
                    ? 'bg-ink-900 text-white shadow-xs'
                    : 'bg-white border border-line text-ink-700 hover:text-ink-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Document
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                  viewMode === 'preview'
                    ? 'bg-ink-900 text-white shadow-xs'
                    : 'bg-white border border-line text-ink-700 hover:text-ink-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Formatted Storefront Preview
              </button>
            </div>

            <div className="text-[11px] font-mono text-ink-500">
              Editing: <strong className="text-ink-900">{currentTabMeta.label}</strong>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-ink-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
              <span>Loading policy document...</span>
            </div>
          ) : viewMode === 'preview' ? (
            <div className="p-4 sm:p-8 bg-paper">
              <PolicyView policy={policyData} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-6 space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Policy Document Title *"
                  placeholder="e.g. Terms of Service"
                  value={policyData.title}
                  onChange={(e) => setPolicyData({ ...policyData, title: e.target.value })}
                  required
                />

                <Input
                  label="Effective / Last Updated Date *"
                  type="date"
                  value={policyData.lastUpdated}
                  onChange={(e) => setPolicyData({ ...policyData, lastUpdated: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Subtitle / Legal Tagline"
                placeholder="e.g. Standard client agreement for luxury acquisitions and nationwide deliveries in Bangladesh."
                value={policyData.subtitle}
                onChange={(e) => setPolicyData({ ...policyData, subtitle: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Executive Summary (Highlighted Banner on Storefront)
                </label>
                <textarea
                  rows={2}
                  value={policyData.summary}
                  onChange={(e) => setPolicyData({ ...policyData, summary: e.target.value })}
                  placeholder="A concise 1-2 sentence overview for clients..."
                  className="w-full px-4 py-2 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              {/* Policy Body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Policy Document Body (Full Content) *
                  </label>
                  <span className="text-[11px] font-mono text-ink-400">
                    Supports ### Headings, - Bullet lists, and **Bold text**
                  </span>
                </div>

                <textarea
                  rows={16}
                  value={policyData.content}
                  onChange={(e) => setPolicyData({ ...policyData, content: e.target.value })}
                  placeholder="Enter policy sections here..."
                  className="w-full px-4 py-3 bg-white border border-line rounded-sm font-mono text-xs text-ink-900 focus:outline-none focus:border-ink-900 leading-relaxed"
                  required
                />
              </div>

              {/* Publication Status & Save Actions */}
              <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublishedPolicy"
                    checked={policyData.isPublished}
                    onChange={(e) => setPolicyData({ ...policyData, isPublished: e.target.checked })}
                    className="rounded-xs border-line text-ink-900 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isPublishedPolicy" className="text-xs font-semibold text-ink-900 cursor-pointer">
                    Publish document live to storefront
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => fetchPolicy(activeTab)}
                  >
                    Reset Changes
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={saving}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save & Push Live
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
