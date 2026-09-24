'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { authClient } from '@/lib/auth-client';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import {
  KeyRound,
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ShieldQuestion,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { branding } = useSystemSettings();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    try {
      await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (err) {
      // Intentionally do not expose backend error to prevent user enumeration
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <AuthCard
      title="Recover Your Password"
      subtitle={`Enter your corporate email address to receive secure recovery instructions for ${branding.organizationName}.`}
      icon={<KeyRound size={28} className="text-eec-primary" />}
      className="max-w-lg"
    >
      <div className="space-y-6 text-left">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Info notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-700 text-xs sm:text-sm">
              <ShieldQuestion size={18} className="text-eec-primary flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Password recovery tokens expire in <strong>30 minutes</strong>. For assistance, contact support at <a href={`mailto:${branding.supportEmail}`} className="text-eec-primary font-semibold hover:underline">{branding.supportEmail}</a>.
              </span>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Corporate Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. employee@eec.gov.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing request...</span>
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Send Recovery Email</span>
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        ) : (
          /* Generic Security Confirmation (Does not reveal whether account exists) */
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-xs">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Instructions Dispatched
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                If an account exists for <strong className="text-slate-900">{email}</strong>, a password reset link has been dispatched. Please inspect your inbox and junk folder.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Use Different Email
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-xs shadow-xs transition-all text-center"
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
