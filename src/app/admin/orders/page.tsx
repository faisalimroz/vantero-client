'use client';

import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus } from '@/lib/api';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatBDT, formatDateTime } from '@/lib/utils';
import { Search, Eye, Edit3, Truck, X, CheckCircle2 } from 'lucide-react';
import { OrderInvoiceButton } from '@/components/invoice/OrderInvoiceButton';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('confirmed');
  const [timelineNote, setTimelineNote] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    getAdminOrders({ status: statusFilter, q: searchQuery })
      .then((res) => {
        if (res?.success) setOrders(res.orders || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTimelineNote('');
    setCourierName(order.courier?.name || 'Steadfast Courier');
    setTrackingCode(order.courier?.trackingCode || '');
    setTrackingUrl(order.courier?.trackingUrl || '');
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        note: timelineNote.trim(),
        courierName: courierName.trim(),
        trackingCode: trackingCode.trim(),
        trackingUrl: trackingUrl.trim(),
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Delivered</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Out for Delivery</span>;
      case 'processing':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Packed</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xs text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 bg-stone text-ink-700 border border-line rounded-xs text-[10px] font-bold uppercase tracking-wider">Pending COD</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Order Management & Live Tracking Dispatcher"
        subtitle="Manage Cash on Delivery orders, assign courier dispatches, and push live tracking updates"
      />

      <div className="p-6 sm:p-8 space-y-6 flex-1 text-left">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 border border-line rounded-sm">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
            <input
              type="text"
              placeholder="Search by Order #, Recipient Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-line rounded-sm text-xs bg-paper focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-ink-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-paper border border-line rounded-sm text-xs font-semibold text-ink-900 focus:outline-none"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending COD</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Packed / Ready</option>
              <option value="shipped">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-line rounded-sm overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-line text-ink-500 uppercase tracking-wider font-semibold bg-cream/30">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer & Phone</th>
                  <th className="py-3 px-3">Destination</th>
                  <th className="py-3 px-3">Total (COD)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-900">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 text-ink-500 font-mono">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-ink-900">{o.shippingAddress?.recipientName}</p>
                      <p className="text-[11px] text-ink-500 font-mono">{o.shippingAddress?.phone}</p>
                    </td>
                    <td className="py-3.5 px-3 text-ink-600">
                      {o.shippingAddress?.city}, {o.shippingAddress?.district}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-ink-900">
                      {formatBDT(o.totalAmount)}
                    </td>
                    <td className="py-3.5 px-3">
                      {getStatusBadge(o.orderStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <OrderInvoiceButton
                          order={o}
                          variant="ghost"
                          size="sm"
                          label="Invoice"
                          className="text-xs px-2.5 py-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateModal(o)}
                          className="text-xs inline-flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Status</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status & Courier Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-paper border border-line rounded-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-500 font-bold">
                  Managing Fulfillment
                </span>
                <h3 className="text-base font-bold text-ink-900">
                  Update Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <OrderInvoiceButton
                  order={selectedOrder}
                  variant="outline"
                  size="sm"
                  label="View Invoice"
                  className="text-xs"
                />
                <button onClick={() => setSelectedOrder(null)} className="text-ink-500 hover:text-ink-900 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ordered Items with Size & Color */}
            <div className="p-3 bg-stone/30 border border-line rounded-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700 block">
                Ordered Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="divide-y divide-line/60 max-h-36 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div className="truncate">
                      <p className="font-semibold text-ink-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-ink-500 font-mono">
                        Size: <strong>{item.size}</strong> {item.color && <>· Color: <strong>{item.color}</strong></>} · Qty: <strong>{item.quantity}</strong>
                      </p>
                    </div>
                    <span className="font-mono font-bold text-ink-900 ml-2">
                      {formatBDT(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  New Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-line rounded-sm text-xs font-semibold text-ink-900"
                >
                  <option value="pending">Pending COD</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Packed & Verified</option>
                  <option value="shipped">Handed to Courier (Out for Delivery)</option>
                  <option value="delivered">Delivered & Paid (Cash Collected)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Courier info */}
              <div className="p-3.5 bg-cream/70 border border-line rounded-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gold-500" /> Courier Assignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Courier Service"
                    placeholder="e.g. Steadfast, Pathao"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                  />
                  <Input
                    label="Courier Tracking Code"
                    placeholder="ST-109283"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                </div>
                <Input
                  label="Courier Tracking URL (Optional)"
                  placeholder="https://steadfast.com.bd/t/ST-109283"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Timeline Note (Visible to Customer on Live Tracking)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Package inspected under studio lighting and handed to Steadfast courier rider."
                  value={timelineNote}
                  onChange={(e) => setTimelineNote(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-line rounded-sm text-xs"
                />
              </div>

              <div className="pt-3 border-t border-line flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={updating}>
                  Save & Push Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
