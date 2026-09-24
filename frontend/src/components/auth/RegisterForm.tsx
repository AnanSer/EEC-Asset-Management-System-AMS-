'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    employeeId: z
      .string()
      .trim()
      .min(3, 'Employee ID must be at least 3 characters')
      .max(30, 'Employee ID cannot exceed 30 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Employee ID can only contain alphanumeric characters, hyphens, and underscores'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    departmentId: z
      .string()
      .min(1, 'Please select your department'),
    position: z
      .string()
      .trim()
      .min(2, 'Job title / position must be at least 2 characters')
      .max(100, 'Position cannot exceed 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

export const RegisterForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    employeeId: '',
    email: '',
    departmentId: '',
    position: '',
    password: '',
    confirmPassword: '',
  });

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch departments dynamically on mount using public endpoint
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
        const res = await fetch(`${apiBase}/api/identity/departments`);
        if (res.ok) {
          const json = await res.json();
          const deptList = json.data || [];
          setDepartments(deptList);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoadingDepts(false);
      }
    }

    fetchDepartments();
  }, []);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Validate using Zod
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof RegisterFormData;
        if (key) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      const res = await fetch(`${apiBase}/api/identity/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          employeeId: formData.employeeId.trim().toUpperCase(),
          email: formData.email.trim().toLowerCase(),
          departmentId: formData.departmentId,
          position: formData.position.trim(),
          password: formData.password,
          requestedRole: 'EMPLOYEE',
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors && Array.isArray(json.errors)) {
          const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
          json.errors.forEach((errItem: any) => {
            if (errItem.field) fieldErrors[errItem.field as keyof RegisterFormData] = errItem.message;
          });
          setErrors(fieldErrors);
          setGlobalError(json.message || 'Validation failed. Please correct the fields above.');
        } else {
          setGlobalError(json.message || 'Registration request failed. Please verify your details.');
        }
        setLoading(false);
        return;
      }

      // Find selected department name for feedback on pending page
      const selectedDept = departments.find((d) => d.id === formData.departmentId);
      const deptName = selectedDept ? selectedDept.name : '';

      // Success: Redirect to pending page
      router.push(
        `/pending?email=${encodeURIComponent(formData.email)}&dept=${encodeURIComponent(
          deptName
        )}&name=${encodeURIComponent(formData.fullName)}`
      );
    } catch (err: any) {
      console.error('Registration error:', err);
      setGlobalError(err?.message || 'An unexpected error occurred. Please try again.');
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

      {/* Full Name & Employee ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="e.g. Abebe Kebede"
            value={formData.fullName}
            onChange={handleChange}
            required
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm transition-all focus:outline-none ${
              errors.fullName
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="employeeId"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            id="employeeId"
            name="employeeId"
            type="text"
            placeholder="e.g. EEC-1042"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm transition-all uppercase focus:outline-none ${
              errors.employeeId
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20'
            }`}
          />
          {errors.employeeId && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.employeeId}</p>
          )}
        </div>
      </div>

      {/* Gmail Address */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Gmail Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. ananserbesa2423@gmail.com"
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


      {/* Department & Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="departmentId"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Department <span className="text-red-500">*</span>
          </label>
          <select
            id="departmentId"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            required
            disabled={loadingDepts}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 bg-white shadow-sm transition-all focus:outline-none ${
              errors.departmentId
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20'
            }`}
          >
            <option value="">
              {loadingDepts ? 'Loading departments...' : 'Select Department'}
            </option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
          {errors.departmentId && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.departmentId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="position"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Position <span className="text-red-500">*</span>
          </label>

          <input
            id="position"
            name="position"
            type="text"
            placeholder="e.g. Senior Civil Engineer"
            value={formData.position}
            onChange={handleChange}
            required
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm transition-all focus:outline-none ${
              errors.position
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20'
            }`}
          />
          {errors.position && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.position}</p>
          )}
        </div>
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
        </div>

        <div>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
        </div>
      </div>

      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator password={formData.password} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-3 py-3 px-4 rounded-xl bg-eec-primary hover:bg-[#06313b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Submitting registration request...</span>
          </>
        ) : (
          <>
            <UserPlus size={18} />
            <span>Submit Registration Request</span>
          </>
        )}
      </button>

      {/* Link to Login */}
      <div className="text-center pt-2">
        <p className="text-xs sm:text-sm text-slate-600">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-semibold text-eec-accent hover:text-eec-primary transition-colors hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
