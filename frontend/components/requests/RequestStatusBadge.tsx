'use client';

import React from 'react';
import { RequestStatus, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '@/constants/requests';
import { Clock, CheckCircle2, XCircle, PackageCheck, Ban } from 'lucide-react';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

export default function RequestStatusBadge({ status, size = 'sm' }: RequestStatusBadgeProps) {
  const label = REQUEST_STATUS_LABELS[status] || status;
  const colors = REQUEST_STATUS_COLORS[status] || {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  };

  const getIcon = () => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3 h-3 text-amber-600 animate-pulse" />;
      case 'APPROVED':
        return <CheckCircle2 className="w-3 h-3 text-blue-600" />;
      case 'FULFILLED':
        return <PackageCheck className="w-3 h-3 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="w-3 h-3 text-rose-600" />;
      case 'CANCELLED':
        return <Ban className="w-3 h-3 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {getIcon()}
      <span>{label}</span>
    </span>
  );
}
