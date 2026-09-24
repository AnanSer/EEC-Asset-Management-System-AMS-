'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { XCircle, ArrowLeft, Mail, AlertTriangle, PhoneCall } from 'lucide-react';

function RejectedContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { branding } = useSystemSettings();

  return (
    <AuthCard
      title="Request Not Approved"
      subtitle={`Your registration request was not approved by ${branding.organizationName} system administration.`}
      icon={<XCircle size={28} className="text-red-500" />}
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Status Alert Card */}
        <div className="p-4 rounded-xl bg-red-50/90 border border-red-200 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-red-900 leading-relaxed">
              <p className="font-semibold text-red-950 mb-1">
                Access Request Rejected
              </p>
              <p className="text-red-800/90">
                Your account registration was reviewed and denied. Please contact the {branding.organizationShortName} ICT Administration Office or your department lead if you believe this is an error.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {branding.organizationShortName} ICT Directorate Contact
          </p>

          {email && (
            <div className="flex items-center justify-between text-xs sm:text-sm pb-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Target Account:</span>
              <span className="font-semibold text-slate-800">{email}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Mail size={14} className="text-slate-400" /> Support Email:
            </span>
            <a href={`mailto:${branding.supportEmail}`} className="font-medium text-eec-primary hover:underline">
              {branding.supportEmail}
            </a>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <PhoneCall size={14} className="text-slate-400" /> Helpdesk Phone:
            </span>
            <span className="font-medium text-slate-800">{branding.supportPhone}</span>
          </div>
        </div>

        {/* Return Button */}
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

export default function RejectedPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading status details...
        </div>
      }
    >
      <RejectedContent />
    </Suspense>
  );
}
