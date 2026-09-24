'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Mail, Phone, Briefcase, Building2, Shield, MapPin, Hash } from 'lucide-react';
import { Employee, CreateEmployeeInput } from '@/constants/employees';
import departmentService from '@/services/department.service';
import { Department } from '@/constants/departments';

export const employeeFormSchema = z.object({
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
    .regex(/^[A-Za-z0-9_-]+$/, 'Employee ID can only contain letters, numbers, hyphens, and underscores'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(150, 'Email cannot exceed 150 characters'),
  phone: z.string().trim().max(30).optional().nullable(),
  position: z
    .string()
    .trim()
    .min(2, 'Position title must be at least 2 characters')
    .max(100, 'Position title cannot exceed 100 characters'),
  departmentId: z.string().min(1, 'Please select an organizational department'),
  role: z.enum(['ADMIN', 'IT_TECHNICIAN', 'DEPARTMENT_MANAGER', 'EMPLOYEE']),
  officeLocation: z.string().trim().max(100).optional().nullable(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: CreateEmployeeInput) => Promise<void>;
  isSubmitting?: boolean;
}

export default function EmployeeForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: EmployeeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      employeeId: initialData?.employeeId || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      position: initialData?.position || '',
      departmentId: initialData?.departmentId || '',
      role: (initialData?.role as EmployeeFormData['role']) || 'EMPLOYEE',
      officeLocation: initialData?.officeLocation || '',
    },
  });

  const selectedDepartmentId = watch('departmentId');

  // Load active departments for dropdown
  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoadingDepartments(true);
        const res = await departmentService.getAll({ status: 'active', limit: 50 });
        if (res.success) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoadingDepartments(false);
      }
    }
    loadDepartments();
  }, []);

  // When department changes, auto-display its office location if not already manually customized
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    setValue('departmentId', deptId, { shouldValidate: true });

    const selectedDept = departments.find((d) => d.id === deptId);
    if (selectedDept) {
      const locationParts = [
        selectedDept.building,
        selectedDept.floor,
        selectedDept.officeLocation,
      ].filter(Boolean).join(', ');

      const autoLocation = locationParts || selectedDept.location || '';
      setValue('officeLocation', autoLocation);
    }
  };

  const onFormSubmit = async (data: EmployeeFormData) => {
    await onSubmit({
      ...data,
      employeeId: data.employeeId.toUpperCase(),
      email: data.email.toLowerCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic & Professional Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-eec-text flex items-center gap-2">
            <User className="w-5 h-5 text-eec-accent" />
            Personnel Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal identity and corporate communication details for this employee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dawit Hailemariam"
              {...register('fullName')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                errors.fullName
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:border-eec-accent bg-white'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.fullName.message}</p>
            )}
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Employee ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Hash className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. EEC-EMP-015"
                {...register('employeeId')}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm uppercase font-mono transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                  errors.employeeId
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-eec-accent bg-white'
                }`}
              />
            </div>
            {errors.employeeId && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.employeeId.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email / Gmail Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="e.g. ananserbesa2423@gmail.com"
                {...register('email')}

                className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-eec-accent bg-white'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. +251-91-123-4567"
                {...register('phone')}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-eec-accent text-sm bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Organization & System Role */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-eec-text flex items-center gap-2">
            <Building2 className="w-5 h-5 text-eec-primary" />
            Organizational Assignment & System Access
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign the employee to their operating directorate and designate their system role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Position */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Position / Job Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Briefcase className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. Senior Geotechnical Lead"
                {...register('position')}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                  errors.position
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-eec-accent bg-white'
                }`}
              />
            </div>
            {errors.position && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.position.message}</p>
            )}
          </div>

          {/* Department Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDepartmentId}
              onChange={handleDepartmentChange}
              disabled={loadingDepartments}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                errors.departmentId
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:border-eec-accent bg-white'
              }`}
            >
              <option value="">
                {loadingDepartments ? 'Loading departments...' : 'Select a Department...'}
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.departmentId.message}</p>
            )}
          </div>

          {/* System Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              System Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Shield className="w-4 h-4" />
              </span>
              <select
                {...register('role')}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-eec-accent text-sm bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="DEPARTMENT_MANAGER">Department Manager</option>
                <option value="IT_TECHNICIAN">IT Technician</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            {errors.role && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.role.message}</p>
            )}
          </div>

          {/* Office Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Office Location <span className="text-xs text-slate-400 font-normal lowercase">(auto-filled from department)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. Block A, 2nd Floor, Room 204"
                {...register('officeLocation')}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-eec-accent text-sm bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
              />
            </div>
            {errors.officeLocation && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.officeLocation.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/employees')}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Save Employee Changes' : 'Register Employee'}
        </button>
      </div>
    </form>
  );
}
