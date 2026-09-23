'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/components/ui/Toast';
import PasswordInput from './PasswordInput';
import {
  LogIn,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldX,
  Mail,
  RotateCw,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid corporate email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

type AuthBannerType =
  | 'invalid_credentials'
  | 'pending_approval'
  | 'email_not_verified'
  | 'account_suspended'
  | 'account_rejected'
  | 'generic'
  | null;

interface AuthBannerState {
  type: AuthBannerType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { success, info } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [banner, setBanner] = useState<AuthBannerState | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resend state for unverified email
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setBanner(null);
  };

  const handleResendVerification = async () => {
    const target = unverifiedEmail || formData.email.trim().toLowerCase();
    if (!target || resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      await authClient.sendVerificationEmail({
        email: target,
        callbackURL: `${window.location.origin}/verify-email`,
      });

      success(`A fresh verification link has been dispatched to ${target}.`);
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      info('If the account exists, a new verification link was sent.');
      setResendCooldown(60);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setUnverifiedEmail(null);

    // Validate with Zod
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') fieldErrors.email = issue.message;
        if (issue.path[0] === 'password') fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (error) {
        const errMsg = error.message?.toLowerCase() || '';

        if (errMsg.includes('not verified') || errMsg.includes('verification') || (error.status === 403 && errMsg.includes('email'))) {
          const emailTarget = formData.email.trim().toLowerCase();
          setUnverifiedEmail(emailTarget);
          setBanner({
            type: 'email_not_verified',
            title: 'Corporate Email Not Verified',
            message: `Your email address (${emailTarget}) requires verification before full dashboard access can be granted.`,
          });
        } else {
          setBanner({
            type: 'invalid_credentials',
            title: 'Invalid Credentials',
            message: error.message || 'The corporate email or password you entered is incorrect. Please verify your credentials and try again.',
          });
        }
        setLoading(false);
        return;
      }

      // Fetch user business account status from backend
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      const meRes = await fetch(`${apiBase}/api/auth/me`, {
        credentials: 'include',
      });

      if (meRes.ok) {
        const meJson = await meRes.json();
        const businessUser = meJson?.data?.businessUser;
        const status = businessUser?.status;
        const isEmailVerified = businessUser?.isEmailVerified;

        if (status === 'PENDING') {
          router.push(`/pending?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        if (status === 'REJECTED') {
          router.push(`/rejected?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        if (status === 'SUSPENDED') {
          setBanner({
            type: 'account_suspended',
            title: 'Corporate Account Suspended',
            message: 'This account has been suspended by the ICT Security Administration. Access to EEC asset management systems has been temporarily restricted. Please contact the ICT Service Desk.',
          });
          setLoading(false);
          return;
        }

        // Check if email is unverified on business user profile
        if (isEmailVerified === false) {
          const emailTarget = formData.email.trim().toLowerCase();
          setUnverifiedEmail(emailTarget);
          setBanner({
            type: 'email_not_verified',
            title: 'Corporate Email Not Verified',
            message: `Your corporate email (${emailTarget}) is pending verification. Please verify your email via the link in your inbox.`,
          });
        }

        // Default or APPROVED: Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Default fallback to dashboard if session established
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setBanner({
        type: 'generic',
        title: 'Authentication Error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred during sign-in. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Enterprise Status & Error Banners */}
      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2.5 animate-in fade-in text-left ${
            banner.type === 'invalid_credentials' || banner.type === 'account_suspended'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : banner.type === 'pending_approval' || banner.type === 'email_not_verified'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {banner.type === 'account_suspended' ? (
              <ShieldX size={19} className="text-rose-600 flex-shrink-0 mt-0.5" />
            ) : banner.type === 'pending_approval' || banner.type === 'email_not_verified' ? (
              <ShieldAlert size={19} className="text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={19} className="text-rose-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight mb-0.5">{banner.title}</p>
              <p className="opacity-90 leading-relaxed">{banner.message}</p>
            </div>
          </div>

          {/* Action Button for Unverified Email */}
          {banner.type === 'email_not_verified' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || resending}
                className="py-2 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {resending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock size={13} />
                    <span>Resend link in {resendCooldown}s</span>
                  </>
                ) : (
                  <>
                    <Mail size={13} />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Link for Pending Approval */}
          {banner.type === 'pending_approval' && (
            <div className="pt-1">
              <Link
                href={`/pending?email=${encodeURIComponent(formData.email)}`}
                className="inline-flex items-center gap-1.5 font-semibold text-amber-950 hover:underline"
              >
                <span>View Request Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Corporate Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. employee@eec.gov.et"
          value={formData.email}
          onChange={handleChange}
          required
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm transition-all focus:outline-none ${
            errors.email
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-300 focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-slate-600">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 rounded text-eec-primary focus:ring-eec-accent border-slate-300 cursor-pointer"
          />
          <span>Remember me</span>
        </label>

        <Link
          href="/forgot-password"
          className="text-xs font-medium text-eec-accent hover:text-eec-primary transition-colors focus:outline-none hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Sign In to EAMS</span>
          </>
        )}
      </button>

      {/* Create Account Link */}
      <div className="text-center pt-2">
        <p className="text-xs sm:text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-eec-accent hover:text-eec-primary transition-colors hover:underline"
          >
            Request Access
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
