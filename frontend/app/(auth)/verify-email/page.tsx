'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { authClient } from '@/lib/auth-client';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  ArrowRight,
  LogIn,
  RotateCw,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(Boolean(token));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual token input state if user navigates directly
  const [manualToken, setManualToken] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleVerify = useCallback(async (tokenToVerify: string) => {
    if (!tokenToVerify) return;

    setVerifying(true);
    setError(null);

    try {
      const res = await authClient.verifyEmail({
        query: { token: tokenToVerify.trim() },
      });

      if (res?.error) {
        setError(res.error.message || 'The verification link is invalid or has expired.');
        setSuccess(false);
      } else {
        setSuccess(true);
        setError(null);
      }
    } catch (err: unknown) {
      console.error('Email verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify email. Please try again.');
      setSuccess(false);
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token, handleVerify]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResending(true);
    setResendMessage(null);

    try {
      await authClient.sendVerificationEmail({
        email: resendEmail.trim().toLowerCase(),
        callbackURL: `${window.location.origin}/verify-email`,
      });
      setResendMessage(`A fresh verification link has been dispatched to ${resendEmail}. Please check your inbox.`);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      setResendMessage('If this corporate account exists, a new verification link was sent.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Corporate Email Verification"
      subtitle="Safeguarding enterprise identity and authenticating official communications."
      icon={<ShieldCheck size={28} className="text-eec-primary" />}
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* State 1: Verifying in progress */}
        {verifying && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-eec-primary/10 flex items-center justify-center text-eec-primary">
              <Loader2 size={30} className="animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Verifying Security Token...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Authenticating your credentials with the EEC identity registry. Please wait.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Verification Successful */}
        {!verifying && success && (
          <div className="py-4 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <StatusBadge status="verified" label="Email Verified" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Email Address Confirmed
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your corporate email address has been verified. You now have full credentials registered in the EEC Enterprise Asset Management System.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Continue to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Verification Failed / Expired Token */}
        {!verifying && error && (
          <div className="space-y-5 text-left">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-rose-900">
              <AlertTriangle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-bold text-rose-950">Verification Token Invalid or Expired</p>
                <p className="text-rose-800 leading-relaxed">
                  {error} Verification tokens are single-use and expire after 60 minutes for security.
                </p>
              </div>
            </div>

            {/* Resend Verification Form */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Request New Verification Link
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your corporate email address to receive a fresh verification link.
                </p>
              </div>

              {resendMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  {resendMessage}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="e.g. employee@eec.gov.et"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending || !resendEmail.trim()}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {resending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={14} />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-medium text-eec-accent hover:text-eec-primary transition-colors hover:underline inline-flex items-center gap-1"
              >
                <span>Return to Login</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Direct navigation without token in URL */}
        {!verifying && !success && !error && !token && (
          <div className="space-y-5 text-left">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you received a verification code or token in your corporate email, paste it below to authenticate your account.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify(manualToken);
              }}
              className="space-y-3"
            >
              <div>
                <label
                  htmlFor="tokenInput"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Verification Security Token
                </label>
                <input
                  id="tokenInput"
                  type="text"
                  required
                  placeholder="Paste your token here..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20"
                />
              </div>

              <button
                type="submit"
                disabled={!manualToken.trim()}
                className="w-full py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <RotateCw size={16} />
                <span>Verify Token</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading verification service...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
