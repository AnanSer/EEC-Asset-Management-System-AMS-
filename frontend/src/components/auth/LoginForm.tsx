'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import PasswordInput from './PasswordInput';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

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
        setGlobalError(
          error.message || 'Invalid email or password. Please check your credentials.'
        );
        setLoading(false);
        return;
      }

      // Fetch user business account status from backend
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const meRes = await fetch(`${apiBase}/api/auth/me`, {
        credentials: 'include',
      });

      if (meRes.ok) {
        const meJson = await meRes.json();
        const status = meJson?.data?.businessUser?.status;

        if (status === 'PENDING') {
          router.push(`/pending?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        if (status === 'REJECTED') {
          router.push(`/rejected?email=${encodeURIComponent(formData.email)}`);
          return;
        }

        // Default or APPROVED: Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Default fallback to dashboard if session established
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setGlobalError(err?.message || 'An unexpected error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Global Error Banner */}
      {globalError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle size={18} className="flex-shrink-0 text-red-500 mt-0.5" />
          <span>{globalError}</span>
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

        <button
          type="button"
          onClick={() => alert('Forgot password self-service is coming in a future update. Please contact the EEC ICT Administration desk.')}
          className="text-xs font-medium text-eec-accent hover:text-eec-primary transition-colors focus:outline-none hover:underline"
        >
          Forgot password?
        </button>
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
