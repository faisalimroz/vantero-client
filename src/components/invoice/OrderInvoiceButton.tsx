'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { VanteroInvoice } from './VanteroInvoice';
import { FileText, Printer } from 'lucide-react';

interface Props {
  order: any;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function OrderInvoiceButton({
  order,
  variant = 'outline',
  size = 'md',
  className = '',
  label = 'Invoice',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center space-x-1.5 ${className}`}
      >
        <FileText className="w-4 h-4 text-gold-600" />
        <span>{label}</span>
      </Button>

      {open && (
        <VanteroInvoice order={order} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
