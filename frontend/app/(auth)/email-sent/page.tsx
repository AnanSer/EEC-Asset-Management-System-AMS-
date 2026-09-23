'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { authClient } from '@/lib/auth-client';
import {
  MailCheck,
  Mail,
  ArrowLeft,
  RotateCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';

function EmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your corporate email';
  const type = searchParams.get('type') || 'verification'; // 'verification' | 'reset'

  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // 60-second countdown cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendStatus(null);

    try {
      if (type === 'reset') {
        await authClient.requestPasswordReset({
          email: email.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/reset-password`,
        });
      } else {
        await authClient.sendVerificationEmail({
          email: email.trim().toLowerCase(),
          callbackURL: `${window.location.origin}/verify-email`,
        });
      }
      setResendStatus('A new email has been dispatched to your inbox.');
      setCooldown(60);
    } catch (err: unknown) {
      console.error('Resend error:', err);
      setResendStatus('Email request submitted. Please check your inbox.');
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  const isReset = type === 'reset';

  return (
    <AuthCard
      title={isReset ? 'Password Reset Email Sent' : 'Verification Email Dispatched'}
      subtitle={
        isReset
          ? 'Check your inbox for instructions to securely recover your account password.'
          : 'We have dispatched a verification link to confirm your corporate identity.'
      }
      icon={<MailCheck size={28} className="text-eec-accent" />}
      className="max-w-lg"
    >
      <div className="space-y-6 text-left">
        {/* Target Email Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-200 shrink-0 mt-0.5">
            <Mail size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dispatched To
            </p>
            <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
              {email}
            </p>
          </div>
        </div>

        {/* Security & Spam Notice */}
        <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-100 text-xs sm:text-sm text-sky-900 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-sky-950">
            <ShieldAlert size={16} className="text-sky-600" />
            <span>Next Steps:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sky-800/90 pl-1">
            <li>Open the message sent by <strong>EEC EAMS Security</strong>.</li>
            <li>
              Click the link inside to {isReset ? 'reset your password' : 'verify your email'} (valid for{' '}
              {isReset ? '30 minutes' : '60 minutes'}).
            </li>
            <li>If you do not see it within 2 minutes, please inspect your spam or junk folder.</li>
          </ul>
        </div>

        {resendStatus && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium animate-in fade-in">
            {resendStatus}
          </div>
        )}

        {/* Cooldown & Resend Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {resending ? (
              <>
                <RotateCw size={14} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock size={14} className="text-slate-400" />
                <span>Resend in {cooldown}s</span>
              </>
            ) : (
              <>
                <RotateCw size={14} />
                <span>Resend Email</span>
              </>
            )}
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 text-center"
          >
            <ArrowLeft size={14} />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export default function EmailSentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading email status...
        </div>
      }
    >
      <EmailSentContent />
    </Suspense>
  );
}
