'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import PasswordInput from '@/components/auth/PasswordInput';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { authClient } from '@/lib/auth-client';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Check,
  X,
  LogIn,
  Clock,
} from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');
  const { branding } = useSystemSettings();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(errorParam || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Active countdown timer on success
  useEffect(() => {
    if (success) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        router.push('/login');
      }
    }
  }, [success, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing. Please request a new recovery link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.resetPassword({
        newPassword: password,
        token: token.trim(),
      });

      if (res?.error) {
        setError(res.error.message || 'Failed to reset password. The link may have expired or already been used.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCountdown(3);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Account Password"
      subtitle={`Establish new corporate credentials for your ${branding.organizationShortName} EAMS account.`}
      icon={<KeyRound size={28} className="text-eec-primary" />}
      className="max-w-lg"
    >
      <div className="space-y-6 text-left">
        {/* Token Missing / Invalid Notice */}
        {!token && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-left space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                <p className="font-bold text-rose-950 mb-1">Invalid or Missing Reset Token</p>
                <p className="text-rose-800">
                  This password reset link is invalid or incomplete. Please request a new link to recover your account.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/forgot-password"
                className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Request New Reset Link</span>
              </Link>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && token && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle size={18} className="flex-shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success State with Live Countdown */}
        {success ? (
          <div className="py-4 space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Password Successfully Reset
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your corporate account credentials have been updated securely.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-600">
              <Clock size={14} className="text-slate-400" />
              <span>
                Redirecting to sign in in <strong className="text-slate-900 font-bold">{countdown}s</strong>...
              </span>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Sign In Now</span>
              </Link>
            </div>
          </div>
        ) : (
          token && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* New Password */}
              <div>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={password} />

              {/* Confirm Password */}
              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword.length > 0 && (
                  <p
                    className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                      passwordsMatch ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check size={12} />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X size={12} />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || password.length < 8 || !passwordsMatch}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Updating credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Save New Password</span>
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Cancel and Return to Sign In</span>
                </Link>
              </div>
            </form>
          )
        )}
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
