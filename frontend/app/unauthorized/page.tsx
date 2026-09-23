/**
 * EEC EAMS – Unauthorized / Access Denied Page (Phase 9D.1)
 * Standardized permission denial landing page.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';
import EECLogo from '@/components/brand/EECLogo';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-eec-primary to-[#052831] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-eec-accent selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,167,214,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(201,111,89,0.08),transparent_50%)] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3 z-10">
        <EECLogo size={42} />
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight leading-tight">
            Ethiopian Engineering Group
          </h1>
          <p className="text-eec-accent text-xs font-semibold tracking-widest uppercase">
            Asset Management System (EAMS)
          </p>
        </div>
      </div>

      {/* Main Access Denied Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/30 border border-white/20 p-8 sm:p-10 text-center z-10">
        {/* Shield Icon Halo */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-red-500/20 border border-red-200 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-10 h-10 text-rose-600" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-rose-500/15 blur-xl -z-10 animate-pulse" />
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Resource</span>
        </div>

        {/* Access Denied Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          Access Denied
        </h2>

        {/* Short Enterprise Message */}
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
          You do not have the required role privileges or module permissions to access this page. If you believe this is an error, please reach out to your department supervisor or the EEC ICT Administration.
        </p>

        {/* Corporate ICT Notice */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 mb-8 text-left text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-slate-700">Need elevated privileges?</p>
          <p className="text-slate-500">
            Submit an access elevation ticket or contact ICT Helpdesk at <span className="font-medium text-slate-700">ict.support@eec.gov.et</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            Go Back
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-eec-primary text-white text-sm font-semibold hover:bg-eec-primary/90 transition-all shadow-md shadow-eec-primary/20"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-xs text-white/50 z-10">
        &copy; {new Date().getFullYear()} Ethiopian Engineering Group. All rights reserved.
      </p>
    </div>
  );
}
