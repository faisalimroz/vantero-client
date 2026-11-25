'use client';

import React, { useState } from 'react';
import { submitReturnRequestApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatBDT, formatDateTime, resolveImageUrl } from '@/lib/utils';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Truck,
  UploadCloud,
  X,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

interface OrderReturnSectionProps {
  order: any;
  onReturnSubmitted?: () => void;
}

const RETURN_REASONS = [
  { value: 'size_fit_issue', label: 'Size / Fit Issue (Too small or too large)' },
  { value: 'damaged_defective', label: 'Damaged or Defective Item Received' },
  { value: 'wrong_item_delivered', label: 'Wrong Item, Color, or Size Delivered' },
  { value: 'not_as_described', label: 'Item Differs from Store Description or Pictures' },
  { value: 'quality_dissatisfaction', label: 'Material Quality Not as Expected' },
  { value: 'other', label: 'Other Reason' },
];

export const OrderReturnSection: React.FC<OrderReturnSectionProps> = ({ order, onReturnSubmitted }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; quantity: number; reason: string }>>({});
  const [generalReason, setGeneralReason] = useState('size_fit_issue');
  const [customerNotes, setCustomerNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check delivery date and 7-day return window
  const isDelivered = order.orderStatus === 'delivered';
  const deliveredDate = order.deliveredAt || order.updatedAt;
  const daysSinceDelivery = Math.floor((Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24));
  const isWithinWindow = daysSinceDelivery <= 7;
  const hasExistingReturn = Boolean(order.hasReturnRequest || order.returnRequest);

  if (!isDelivered) {
    return null;
  }

  const existingReturn = order.returnRequest;

  // Initialize selected items for return modal
  const handleOpenModal = () => {
    const initial: Record<string, any> = {};
    order.items?.forEach((item: any) => {
      initial[`${item.product?._id || item.product}-${item.size}`] = {
        selected: true,
        quantity: item.quantity,
        reason: 'size_fit_issue'
      };
    });
    setSelectedItems(initial);
    setError(null);
    setFiles([]);
    setCustomerNotes('');
    setModalOpen(true);
  };

  const handleToggleItem = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        selected: !prev[key]?.selected
      }
    }));
  };

  const handleQuantityChange = (key: string, maxQty: number, val: number) => {
    const qty = Math.max(1, Math.min(maxQty, val));
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: qty
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, 4);
    setFiles(selected);
  };

  // Calculate return totals
  const totalReturnCalc = order.items?.reduce(
    (acc: { count: number; amount: number }, item: any) => {
      const key = `${item.product?._id || item.product}-${item.size}`;
      const sel = selectedItems[key];
      if (sel?.selected) {
        acc.count += sel.quantity;
        acc.amount += item.unitPrice * sel.quantity;
      }
      return acc;
    },
    { count: 0, amount: 0 }
  ) || { count: 0, amount: 0 };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totalReturnCalc.count === 0) {
      setError('Please select at least one item and quantity to return.');
      return;
    }

    const payloadItems = order.items
      ?.filter((item: any) => {
        const key = `${item.product?._id || item.product}-${item.size}`;
        return selectedItems[key]?.selected;
      })
      .map((item: any) => {
        const key = `${item.product?._id || item.product}-${item.size}`;
        return {
          productId: item.product?._id || item.product,
          size: item.size,
          color: item.color || '',
          quantity: selectedItems[key].quantity,
          reason: generalReason
        };
      });

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('folder', 'returns');
      formData.append('items', JSON.stringify(payloadItems));
      formData.append('customerReason', generalReason);
      formData.append('customerNotes', customerNotes);

      files.forEach((f) => {
        formData.append('proofImages', f);
      });

      const res = await submitReturnRequestApi(order.orderNumber, formData);
      if (res?.success) {
        setSuccessMsg('Return request submitted! Our concierge team will review and schedule collection.');
        setTimeout(() => {
          setModalOpen(false);
          if (onReturnSubmitted) onReturnSubmitted();
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getReturnStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'approved':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'in_transit':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* CASE 1: EXISTING RETURN REQUEST ACTIVE */}
      {hasExistingReturn && existingReturn ? (
        <div className="bg-white border border-line rounded-sm p-6 space-y-5 text-left shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
            <div>
              <span className="text-[11px] font-mono text-gold-500 uppercase tracking-wider font-bold">
                Return Reference: {existingReturn.returnNumber}
              </span>
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2 mt-0.5">
                <RotateCcw className="w-4 h-4 text-gold-500" />
                Post-Delivery Return Status
              </h3>
            </div>

            <span
              className={`px-3 py-1 rounded-xs text-xs font-bold uppercase tracking-wider border ${getReturnStatusColor(
                existingReturn.status
              )}`}
            >
              {existingReturn.status === 'completed'
                ? 'Return Settled & Completed'
                : existingReturn.status === 'approved'
                ? 'Return Approved · Pickup Scheduled'
                : existingReturn.status === 'in_transit'
                ? 'In Transit to Center'
                : existingReturn.status === 'rejected'
                ? 'Return Declined'
                : 'Pending Concierge Review'}
            </span>
          </div>

          {/* Refund Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-cream/50 rounded-sm border border-line text-xs">
            <div>
              <span className="text-ink-500 block">Returned Items</span>
              <span className="font-mono font-bold text-sm text-ink-900">
                {existingReturn.totalReturnQuantity} unit{existingReturn.totalReturnQuantity === 1 ? '' : 's'}
              </span>
            </div>
            <div>
              <span className="text-ink-500 block">Refund Amount</span>
              <span className="font-mono font-bold text-sm text-ink-900">
                {formatBDT(existingReturn.totalReturnAmount)}
              </span>
            </div>
            <div>
              <span className="text-ink-500 block">Settlement Status</span>
              <span className="font-mono font-bold text-sm text-emerald-700 capitalize">
                {existingReturn.settlementStatus || 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-ink-500 block">Registered On</span>
              <span className="font-mono text-xs text-ink-700">
                {formatDateTime(existingReturn.createdAt)}
              </span>
            </div>
          </div>

          {/* Rejection Alert if rejected */}
          {existingReturn.status === 'rejected' && existingReturn.rejectionReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Decline Reason:</strong> {existingReturn.rejectionReason}
              </div>
            </div>
          )}

          {/* Pickup Courier Note if approved */}
          {existingReturn.pickupCourier?.name && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm flex items-start gap-2.5 text-xs text-blue-900">
              <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Pickup Courier Assigned:</strong> {existingReturn.pickupCourier.name}
                {existingReturn.pickupCourier.trackingCode && ` (Tracking: ${existingReturn.pickupCourier.trackingCode})`}
                . Please keep parcel securely packed with original tags.
              </div>
            </div>
          )}

          {/* Return Tracking Timeline */}
          {existingReturn.timeline && existingReturn.timeline.length > 0 && (
            <div className="space-y-3 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                Return Progress Timeline
              </h4>
              <div className="relative pl-6 space-y-4 border-l-2 border-line">
                {existingReturn.timeline.map((entry: any, idx: number) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 bg-gold-500 rounded-full border-2 border-white shadow-xs" />
                    <p className="font-bold text-ink-900">{entry.title}</p>
                    <p className="text-ink-600 mt-0.5">{entry.note}</p>
                    <span className="text-[10px] text-ink-400 font-mono">
                      {formatDateTime(entry.timestamp)} · by {entry.updatedBy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isWithinWindow ? (
        /* CASE 2: ELIGIBLE FOR RETURN */
        <div className="p-6 bg-cream/70 border border-gold-300/80 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-gold-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              Vantero 7-Day Exchange & Return Guarantee
            </span>
            <h3 className="text-sm font-bold text-ink-900">
              Delivered within return window ({7 - daysSinceDelivery} day{7 - daysSinceDelivery === 1 ? '' : 's'} remaining)
            </h3>
            <p className="text-xs text-ink-600 max-w-lg leading-relaxed">
              If an item is defective, does not fit, or requires a size adjustment, you may request a hassle-free doorstep exchange or return.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={handleOpenModal}
            className="border-gold-500 text-ink-900 hover:bg-gold-500 hover:text-white whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Request Return</span>
          </Button>
        </div>
      ) : (
        /* CASE 3: EXPIRED RETURN WINDOW */
        <div className="p-4 bg-stone/40 border border-line rounded-sm text-xs text-ink-500 flex items-center justify-between">
          <span>7-Day Return Window Expired ({daysSinceDelivery} days since delivery)</span>
          <span className="font-mono text-[10px] uppercase">Final Sale</span>
        </div>
      )}

      {/* RETURN REQUEST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-paper border border-line rounded-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-mono text-gold-500 uppercase tracking-wider font-bold">
                  Order #{order.orderNumber}
                </span>
                <h2 className="text-lg font-bold text-ink-900">Request Item Return / Exchange</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-ink-400 hover:text-ink-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReturn} className="space-y-5">
              {/* Step 1: Select Items */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-900">
                  1. Select Items to Return
                </label>

                <div className="divide-y divide-line border border-line rounded-sm bg-white">
                  {order.items?.map((item: any, idx: number) => {
                    const key = `${item.product?._id || item.product}-${item.size}`;
                    const current = selectedItems[key] || { selected: false, quantity: 1 };

                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={current.selected}
                            onChange={() => handleToggleItem(key)}
                            className="w-4 h-4 text-ink-900 border-line rounded focus:ring-0 cursor-pointer"
                          />
                          <img
                            src={resolveImageUrl(item.image)}
                            alt=""
                            className="w-12 h-14 object-cover rounded-xs border border-line"
                          />
                          <div>
                            <p className="font-semibold text-ink-900">{item.title}</p>
                            <p className="text-[11px] text-ink-500">
                              Size: <strong>{item.size}</strong> · Unit Price: {formatBDT(item.unitPrice)}
                            </p>
                          </div>
                        </div>

                        {current.selected && (
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-ink-500">Return Qty:</span>
                            <select
                              value={current.quantity}
                              onChange={(e) => handleQuantityChange(key, item.quantity, Number(e.target.value))}
                              className="px-2 py-1 bg-paper border border-line rounded-sm text-xs font-mono font-bold"
                            >
                              {[...Array(item.quantity)].map((_, qIdx) => (
                                <option key={qIdx + 1} value={qIdx + 1}>
                                  {qIdx + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Primary Reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-900">
                  2. Reason for Return
                </label>
                <select
                  value={generalReason}
                  onChange={(e) => setGeneralReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Explanation Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-900">
                  3. Details & Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Tell us what went wrong (e.g., shoe feels half-size too snug, or minor stitching issue)..."
                  className="w-full px-3.5 py-2 bg-white border border-line rounded-sm text-xs text-ink-900 focus:outline-none focus:border-ink-900"
                />
              </div>

              {/* Step 4: Photo Proofs via Multer */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center justify-between">
                  <span>4. Attach Proof Photos (Multer Local Storage)</span>
                  <span className="text-[10px] text-ink-500 font-normal">Up to 4 images · JPEG, PNG, WebP (5MB)</span>
                </label>

                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-line hover:border-gold-500 rounded-sm cursor-pointer bg-white transition-colors">
                  <div className="flex flex-col items-center justify-center p-2 text-center text-xs">
                    <UploadCloud className="w-5 h-5 text-ink-400 mb-1" />
                    <span className="text-ink-700 font-medium">Click or browse images to attach</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-ink-600">
                    {files.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-stone border border-line rounded-xs font-mono truncate max-w-xs">
                        {f.name} ({(f.size / 1024).toFixed(0)}KB)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Calculation Banner */}
              <div className="p-4 bg-cream rounded-sm border border-line flex items-center justify-between text-xs">
                <div>
                  <span className="text-ink-600">Calculated Return Value:</span>
                  <p className="font-bold text-sm text-ink-900 font-mono">
                    {formatBDT(totalReturnCalc.amount)} ({totalReturnCalc.count} item{totalReturnCalc.count === 1 ? '' : 's'})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-ink-500 block uppercase">Doorstep Pickup</span>
                  <span className="text-xs font-semibold text-emerald-700 font-mono">Free Exchange</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-line">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={submitting}>
                  Confirm & Submit Return Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
