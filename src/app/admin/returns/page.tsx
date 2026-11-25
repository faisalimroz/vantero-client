'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminReturns,
  getAdminReturnsAnalytics,
  updateReturnStatus,
  getAdminReturnById
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatBDT, formatDateTime, resolveImageUrl } from '@/lib/utils';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Layers,
  Search,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Percent,
  Clock,
  Eye
} from 'lucide-react';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection / Action Modal State
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState('approved');
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [courierName, setCourierName] = useState('Steadfast Reverse Pickup');
  const [courierTracking, setCourierTracking] = useState('');
  const [restockItems, setRestockItems] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getAdminReturns({ status: statusFilter, q: searchQuery }),
      getAdminReturnsAnalytics()
    ])
      .then(([retRes, anaRes]) => {
        if (retRes?.success) setReturns(retRes.returns || []);
        if (anaRes?.success) setAnalytics(anaRes.analytics || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, searchQuery]);

  const handleOpenInspect = (ret: any) => {
    setSelectedReturn(ret);
    setActionStatus(ret.status === 'pending' ? 'approved' : ret.status);
    setAdminNote(ret.adminNotes || '');
    setRejectionReason(ret.rejectionReason || '');
    setCourierName(ret.pickupCourier?.name || 'Steadfast Reverse Pickup');
    setCourierTracking(ret.pickupCourier?.trackingCode || '');
    setRestockItems(false);
    setModalError(null);
    setModalSuccess(false);
  };

  const handleUpdateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setModalError(null);

    if (actionStatus === 'rejected' && !rejectionReason.trim() && !adminNote.trim()) {
      setModalError('A rejection explanation note is required when declining a return.');
      return;
    }

    setUpdating(true);
    try {
      await updateReturnStatus(selectedReturn._id, {
        status: actionStatus,
        note: adminNote,
        rejectionReason: actionStatus === 'rejected' ? rejectionReason : undefined,
        courierName: courierName,
        trackingCode: courierTracking,
        restockItems: actionStatus === 'completed' ? restockItems : false
      });

      setModalSuccess(true);
      fetchData();
      setTimeout(() => {
        setSelectedReturn(null);
        setModalSuccess(false);
      }, 1200);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to update return status.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">
            Completed / Settled
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">
            Approved (Pickup)
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">
            In Transit
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">
            Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Returns & Exchanges Queue"
        subtitle="Manage 7-day post-delivery returns, doorstep pickup dispatch, settlements, and inventory restocking"
      />

      <div className="p-6 sm:p-8 space-y-8 flex-1 text-left">
        {/* KPI Metrics Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Returns"
            value={analytics?.totalReturnsCount ?? 0}
            subtitle={`${analytics?.pendingCount ?? 0} pending review`}
            icon={RotateCcw}
          />
          <KpiCard
            title="Returned Units"
            value={`${analytics?.totalUnits ?? 0} items`}
            subtitle={`${analytics?.completedUnits ?? 0} settled & processed`}
            icon={Package}
          />
          <KpiCard
            title="Total Return Value"
            value={formatBDT(analytics?.totalAmount ?? 0)}
            subtitle={`Settled: ${formatBDT(analytics?.settledAmount ?? 0)}`}
            icon={ShieldCheck}
          />
          <KpiCard
            title="Return Rate"
            value={`${analytics?.returnRateOrders ?? 0}%`}
            subtitle={`of ${analytics?.deliveredOrdersCount ?? 0} delivered orders`}
            icon={Percent}
          />
        </div>

        {/* Filters and Queue Table */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card space-y-4">
          <div className="p-4 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cream/30">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'pending', 'approved', 'in_transit', 'completed', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-sm capitalize font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-ink-900 text-white font-semibold'
                      : 'bg-white text-ink-600 hover:bg-stone border border-line'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-ink-400" />
              <input
                type="text"
                placeholder="Search Return / Order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-line rounded-sm focus:outline-none focus:border-ink-900"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-line text-ink-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Return ID</th>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items Returned</th>
                  <th className="py-3 px-3">Refund Value</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Restocked?</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-ink-400 font-mono">
                      Loading returns queue...
                    </td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink-500">
                      No return requests match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  returns.map((ret) => (
                    <tr key={ret._id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-ink-900">
                        {ret.returnNumber}
                        <span className="block text-[10px] text-ink-400 font-normal">
                          {formatDateTime(ret.createdAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-medium text-gold-600">
                        {ret.orderNumber}
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-ink-900">{ret.customer?.name || 'Customer'}</p>
                        <p className="text-[11px] text-ink-500 font-mono">{ret.customer?.phone}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-ink-900">
                          {ret.totalReturnQuantity} unit{ret.totalReturnQuantity === 1 ? '' : 's'}
                        </span>
                        <div className="text-[10px] text-ink-500 line-clamp-1 max-w-xs mt-0.5">
                          {ret.items?.map((it: any) => `${it.title} (${it.size})`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-ink-900">
                        {formatBDT(ret.totalReturnAmount)}
                      </td>

                      <td className="py-3.5 px-3">
                        {getStatusBadge(ret.status)}
                      </td>

                      <td className="py-3.5 px-3">
                        {ret.isRestocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs">
                            <Check className="w-3 h-3" /> Restocked
                          </span>
                        ) : (
                          <span className="text-[10px] text-ink-400 font-mono">No</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInspect(ret)}
                          className="flex items-center space-x-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* INSPECT & ACTION MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-paper border border-line rounded-md p-6 max-h-[92vh] overflow-y-auto shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-mono text-gold-500 uppercase tracking-wider font-bold">
                  Inspection: {selectedReturn.returnNumber}
                </span>
                <h2 className="text-lg font-bold text-ink-900">
                  Return for Order #{selectedReturn.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 text-ink-400 hover:text-ink-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-sm flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> Return request updated successfully!
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Customer & Reason Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-cream/50 rounded-sm border border-line text-xs">
              <div>
                <span className="text-ink-500 block">Customer</span>
                <p className="font-bold text-ink-900">{selectedReturn.customer?.name}</p>
                <p className="font-mono text-ink-600">{selectedReturn.customer?.phone}</p>
                <p className="text-ink-500 text-[11px] truncate">{selectedReturn.customer?.email}</p>
              </div>

              <div>
                <span className="text-ink-500 block">Return Primary Reason</span>
                <p className="font-bold text-ink-900 capitalize">
                  {selectedReturn.customerReason?.replace(/_/g, ' ')}
                </p>
                {selectedReturn.customerNotes && (
                  <p className="text-ink-600 text-[11px] mt-0.5 line-clamp-2 italic">
                    "{selectedReturn.customerNotes}"
                  </p>
                )}
              </div>

              <div>
                <span className="text-ink-500 block">Calculated Value</span>
                <p className="font-bold text-base font-mono text-ink-900">
                  {formatBDT(selectedReturn.totalReturnAmount)}
                </p>
                <span className="text-[10px] text-ink-500 font-mono">
                  {selectedReturn.totalReturnQuantity} item{selectedReturn.totalReturnQuantity === 1 ? '' : 's'} to be returned
                </span>
              </div>
            </div>

            {/* Returned Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                Items Selected by Customer
              </h4>
              <div className="divide-y divide-line border border-line rounded-sm bg-white">
                {selectedReturn.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={resolveImageUrl(item.image)}
                        alt=""
                        className="w-12 h-14 object-cover rounded-xs border border-line flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-ink-900">{item.title}</p>
                        <p className="text-[11px] text-ink-500 font-mono">
                          Size: <strong>{item.size}</strong> {item.color && `· Color: ${item.color}`} · Qty: <strong>{item.quantity}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-ink-900 block">
                        {formatBDT(item.totalRefund)}
                      </span>
                      <span className="text-[10px] text-ink-400 font-mono">
                        {formatBDT(item.unitPrice)} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof Photos Gallery (Multer Local Storage) */}
            {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                  Attached Proof Photos ({selectedReturn.proofImages.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedReturn.proofImages.map((img: any, i: number) => (
                    <a
                      key={i}
                      href={resolveImageUrl(img.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative w-24 h-24 rounded-sm border border-line overflow-hidden bg-stone/40 block"
                    >
                      <img
                        src={resolveImageUrl(img.url)}
                        alt={`Proof photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-mono">
                        View Full
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Action Form */}
            <form onSubmit={handleUpdateReturn} className="pt-4 border-t border-line space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-900">
                    Update Return Status
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900 font-bold"
                  >
                    <option value="pending">Pending Concierge Review</option>
                    <option value="approved">Approve Return (Schedule Pickup)</option>
                    <option value="in_transit">In Transit (Courier En Route)</option>
                    <option value="completed">Complete & Settle Return</option>
                    <option value="rejected">Decline / Reject Return</option>
                  </select>
                </div>

                {actionStatus === 'rejected' ? (
                  <Input
                    label="Rejection Reason Note (Sent to Customer)"
                    placeholder="e.g. Item shows signs of wear, tags missing..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                ) : (
                  <Input
                    label="Reverse Pickup Courier"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Steadfast / Pathao / RedX Reverse"
                  />
                )}
              </div>

              {(actionStatus === 'approved' || actionStatus === 'in_transit') && (
                <Input
                  label="Courier Reverse Tracking Code"
                  placeholder="e.g. STDF-RET-98214"
                  value={courierTracking}
                  onChange={(e) => setCourierTracking(e.target.value)}
                />
              )}

              {/* Explicit Restock Toggle for Completed Status */}
              {actionStatus === 'completed' && (
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-sm space-y-2">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restockItems}
                      onChange={(e) => setRestockItems(e.target.checked)}
                      className="w-4 h-4 text-gold-500 rounded border-line mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-ink-900 block">
                        Restock Returned Items Into Product Inventory?
                      </span>
                      <p className="text-ink-600 text-[11px] leading-relaxed mt-0.5">
                        Only check this if the items are unworn, undamaged, and verified sellable.
                        <strong> Do NOT restock</strong> defective or damaged items.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Concierge / Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes for audit trail..."
                  className="w-full px-3.5 py-2 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-line">
                <Button type="button" variant="ghost" onClick={() => setSelectedReturn(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" isLoading={updating}>
                  Apply Status & Record Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
