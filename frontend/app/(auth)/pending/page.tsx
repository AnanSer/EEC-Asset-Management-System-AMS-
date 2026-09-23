'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth-client';
import {
  Clock,
  Mail,
  Building2,
  ArrowLeft,
  ShieldAlert,
  RotateCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

function PendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const dept = searchParams.get('dept');
  const name = searchParams.get('name');

  const { success, info } = useToast();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // 60-second cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (!email || cooldown > 0 || resending) return;

    setResending(true);
    try {
      await authClient.sendVerificationEmail({
        email: email.trim().toLowerCase(),
        callbackURL: `${window.location.origin}/verify-email`,
      });

      success(`A fresh verification link has been sent to ${email}.`);
      setCooldown(60);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      info('If the account exists, a new verification link was sent.');
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

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

        {/* Resend Verification Action if email exists */}
        {email && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Email Verification</p>
              <p className="text-slate-500 mt-0.5">Need another verification link for your inbox?</p>
            </div>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={cooldown > 0 || resending}
              className="w-full sm:w-auto py-2 px-3.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {resending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock size={13} className="text-slate-400" />
                  <span>Resend in {cooldown}s</span>
                </>
              ) : (
                <>
                  <RotateCw size={13} />
                  <span>Resend Verification</span>
                </>
              )}
            </button>
          </div>
        )}

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
