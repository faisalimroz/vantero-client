'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatBDT, formatDateTime } from '@/lib/utils';
import { Download, X, ShieldCheck, MapPin, Phone, Mail, Globe, Loader2 } from 'lucide-react';

interface InvoiceProps {
  order: any;
  onClose?: () => void;
}

export function VanteroInvoice({ order, onClose }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || downloading) return;
    setDownloading(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const element = invoiceRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 900,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Vantero-Invoice-${order.orderNumber || 'Order'}.pdf`);
    } catch (error) {
      console.error('Failed to generate invoice PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isInsideDhaka =
    order.shippingAddress?.district?.toLowerCase().includes('dhaka') ||
    order.shippingAddress?.city?.toLowerCase().includes('dhaka');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white text-ink-900 shadow-2xl rounded-sm border border-line flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-paper border-b border-line">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gold-600 font-bold">
              Official Tax Invoice
            </span>
            <span className="text-xs text-ink-400">·</span>
            <span className="font-mono text-xs font-semibold text-ink-900">
              #{order.orderNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              size="sm"
              variant="primary"
              className="flex items-center space-x-1.5 text-xs"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xs text-ink-500 hover:text-ink-900 hover:bg-stone/60 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Wrapper */}
        <div className="overflow-y-auto bg-white">
          {/* Invoice Sheet Captured for PDF */}
          <div
            ref={invoiceRef}
            className="p-8 sm:p-10 space-y-8 text-left bg-white font-sans text-xs text-ink-800"
          >
            {/* Header Brand & Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-ink-900 pb-6 gap-6">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl tracking-widest font-bold text-ink-900 uppercase">
                  VANTERO
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-gold-600 font-semibold mt-1">
                  Luxury Footwear & Menswear Atelier
                </p>
                <div className="text-[11px] text-ink-600 space-y-0.5 mt-3">
                  <p className="font-semibold text-ink-900">Vantero Bangladesh Ltd.</p>
                  <p>Bond Center, Banani 11, Dhaka, Bangladesh</p>
                  <p className="flex items-center gap-1.5">
                    Email: info@vanterobd.com
                    <span className="text-ink-300">|</span>
                    Website: https://vanterobd.com
                  </p>
                </div>
              </div>

              <div className="sm:text-right space-y-1 bg-cream/50 p-4 border border-line rounded-sm sm:min-w-[220px]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-ink-400 block">
                  INVOICE / RECEIPT
                </span>
                <p className="font-mono text-base font-bold text-ink-900">
                  #{order.orderNumber}
                </p>
                <p className="text-[11px] text-ink-600">
                  <span className="font-medium text-ink-800">Date:</span> {formatDateTime(order.createdAt)}
                </p>
                <div className="pt-2 mt-2 border-t border-line text-[11px]">
                  <span className="font-medium text-ink-800">Payment:</span>{' '}
                  <span className="font-semibold text-amber-700 uppercase tracking-wider">
                    Cash on Delivery (COD)
                  </span>
                </div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider">
                  Status: {order.orderStatus === 'delivered' ? 'Paid & Received' : 'Payment Due at Doorstep'}
                </div>
              </div>
            </div>

            {/* Customer / Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-paper p-5 border border-line rounded-sm">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gold-600 block mb-1.5">
                  Billed & Delivered To
                </span>
                <p className="text-sm font-bold text-ink-900">
                  {order.shippingAddress?.recipientName}
                </p>
                <p className="text-[11px] font-mono text-ink-700 mt-0.5 flex items-center gap-1">
                 Phone No: {order.shippingAddress?.phone}
                </p>
                <p className="text-[11px] font-monotext-ink-700 mt-1 flex items-start gap-1">
                Address:
                  <span>
                    {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.district}
                  </span>
                </p>
              </div>

              <div className="sm:text-right space-y-1 text-[11px]">
                <span className="text-[10px] uppercase tracking-wider font-bold text-ink-400 block mb-1.5">
                  Logistics & Region
                </span>
                <p className="font-semibold text-ink-900">
                  Delivery Zone: {isInsideDhaka ? 'Inside Dhaka (৳60)' : 'Outside Dhaka (৳120)'}
                </p>
                {order.courier?.name && (
                  <p className="text-ink-600">
                    Assigned Courier: <span className="font-semibold">{order.courier.name}</span>
                  </p>
                )}
                {order.courier?.trackingCode && (
                  <p className="text-ink-600 font-mono">
                    AWB / Tracking: <span className="font-semibold text-ink-900">{order.courier.trackingCode}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-line rounded-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink-900 text-paper text-[10px] font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-4">Item & Specifications</th>
                    <th className="py-2.5 px-3 text-center">Size</th>
                    <th className="py-2.5 px-3 text-center">Color</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {order.items?.map((item: any, idx: number) => {
                    const lineTotal = (item.unitPrice || 0) * (item.quantity || 1);
                    return (
                      <tr key={idx} className="hover:bg-paper/40">
                        <td className="py-3 px-3 text-center font-mono text-ink-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-ink-900">{item.title}</p>
                          {item.sku && (
                            <span className="font-mono text-[10px] text-ink-400">
                              SKU: {item.sku}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-ink-800">
                          {item.size || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center text-ink-600 capitalize">
                          {item.color || '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-ink-900">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-ink-700">
                          {formatBDT(item.unitPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-ink-900">
                          {formatBDT(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculation Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              <div className="space-y-2 text-[11px] text-ink-500 max-w-sm">
                <p className="font-semibold text-ink-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" /> Vantero Authentic Guarantee
                </p>
                <p>
                  All Vantero pieces are handcrafted with Italian leather and strictly QC-inspected. For queries or exchanges within 7 days of delivery, contact concierge at{' '}
                  <strong className="text-ink-800">info@vanterobd.com</strong>.
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-2 bg-paper p-4 border border-line rounded-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-ink-900">{formatBDT(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-semibold text-ink-900">
                    {order.deliveryFee === 0 ? 'FREE' : formatBDT(order.deliveryFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-ink-900 flex justify-between text-sm font-bold text-ink-900">
                  <span>Grand Total (COD):</span>
                  <span className="font-mono text-base text-ink-900">{formatBDT(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures & Official Watermark */}
            <div className="pt-8 border-t border-line grid grid-cols-2 gap-8 text-[11px] text-ink-500">
              <div>
                <p className="font-semibold text-ink-800">Customer Acceptance</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Payment handed & package verified</p>
                <div className="h-10 border-b border-dashed border-ink-300 mt-4" />
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink-800">Authorized Atelier Representative</p>
                <p className="text-[10px] text-gold-600 uppercase tracking-wider mt-0.5">Vantero Bangladesh</p>
                <div className="h-10 border-b border-dashed border-ink-300 mt-4 flex items-end justify-end">
                  <span className="font-serif italic text-ink-400 text-xs tracking-wider">Vantero</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}