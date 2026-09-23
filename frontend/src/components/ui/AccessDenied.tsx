/**
 * EEC EAMS – AccessDenied Component (Phase 9D.1)
 * Reusable Access Denied view with EEC enterprise styling.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

export interface AccessDeniedProps {
  title?: string;
  message?: string;
  showDashboardButton?: boolean;
  showBackButton?: boolean;
  className?: string;
  requiredPermission?: string;
}

export function AccessDenied({
  title = 'Access Denied',
  message = 'You do not have the required permissions to access this corporate resource. If you believe this is an error, please contact your system administrator or ICT support.',
  showDashboardButton = true,
  showBackButton = true,
  className,
  requiredPermission,
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-lg mx-auto bg-white rounded-2xl border border-red-100 shadow-xl shadow-red-500/5',
        className
      )}
    >
      {/* Icon with glowing ambient halo */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-red-500/20 border border-red-200 flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-10 h-10 text-rose-600" />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-rose-500/10 blur-lg -z-10 animate-pulse" />
      </div>

      {/* Badge (Optional permission identifier) */}
      {requiredPermission && (
        <span className="mb-3 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-rose-700 bg-rose-50 border border-rose-200 rounded-full">
          Required: {requiredPermission}
        </span>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
        {title}
      </h2>

      {/* Enterprise Message */}
      <p className="text-sm text-slate-500 leading-relaxed mb-8">
        {message}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        {showBackButton && (
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            Go Back
          </button>
        )}

        {showDashboardButton && (
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-eec-primary text-white text-sm font-semibold hover:bg-eec-primary/90 transition-all shadow-md shadow-eec-primary/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

export default AccessDenied;
