import React from 'react';
import { ReturnRequestStatus, RETURN_STATUS_COLORS, RETURN_STATUS_LABELS } from '@/constants/returns';
import clsx from 'clsx';

interface ReturnStatusBadgeProps {
  status: ReturnRequestStatus;
  className?: string;
}

export default function ReturnStatusBadge({ status, className }: ReturnStatusBadgeProps) {
  const colorClass = RETURN_STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = RETURN_STATUS_LABELS[status] || status;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        colorClass,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
}
