'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Clock, Mail, Building2, ArrowLeft, ShieldAlert } from 'lucide-react';

function PendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const dept = searchParams.get('dept');
  const name = searchParams.get('name');

  return (
    <AuthCard
      title="Registration Submitted"
      subtitle="Your registration request has been submitted successfully and is awaiting review."
      icon={<Clock size={28} className="text-amber-500" />}
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Status Alert Card */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-left">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <p className="font-semibold text-amber-950 mb-1">
                Waiting for ICT Administrator Approval
              </p>
              <p className="text-amber-800/90">
                To protect corporate assets, new account requests must be verified and approved by the EEC ICT Directorate before granting system access.
              </p>
            </div>
          </div>
        </div>

        {/* User / Request Details Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Request Summary
          </p>

          {name && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Applicant:</span>
              <span className="font-semibold text-slate-800">{name}</span>
            </div>
          )}

          {email && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" /> Corporate Email:
              </span>
              <span className="font-semibold text-slate-800">{email}</span>
            </div>
          )}

          {dept && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-400" /> Department:
              </span>
              <span className="font-semibold text-slate-800">{dept}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              PENDING APPROVAL
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export default function PendingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading pending request details...
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
