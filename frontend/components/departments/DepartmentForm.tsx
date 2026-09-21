'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Building2, Hash, MapPin, CheckCircle2 } from 'lucide-react';
import { Department, CreateDepartmentInput } from '@/constants/departments';

export const departmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name cannot exceed 100 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Department code must be at least 2 characters')
    .max(20, 'Department code cannot exceed 20 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  description: z.string().trim().max(500).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  officeLocation: z.string().trim().max(100).optional().nullable(),
  building: z.string().trim().max(100).optional().nullable(),
  floor: z.string().trim().max(50).optional().nullable(),
  headOfDepartment: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean(),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface DepartmentFormProps {
  initialData?: Department;
  onSubmit: (data: CreateDepartmentInput) => Promise<void>;
  isSubmitting?: boolean;
}

export default function DepartmentForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: DepartmentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      location: initialData?.location || 'Addis Ababa Head Office (Kazanchis)',
      officeLocation: initialData?.officeLocation || '',
      building: initialData?.building || '',
      floor: initialData?.floor || '',
      headOfDepartment: initialData?.headOfDepartment || '',
      isActive: initialData ? initialData.isActive : true,
    },
  });

  const isActive = watch('isActive');

  const onFormSubmit = async (data: DepartmentFormData) => {
    await onSubmit({
      ...data,
      code: data.code.toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* General Information Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-eec-text flex items-center gap-2">
            <Building2 className="w-5 h-5 text-eec-accent" />
            General Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Core organizational identification for this sector or directorate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Department Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Transport Infrastructure Sector"
              {...register('name')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                errors.name
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:border-eec-accent bg-white'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Department Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Hash className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. EEC-TIS"
                {...register('code')}
                onChange={(e) => setValue('code', e.target.value.toUpperCase())}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm font-mono tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
                  errors.code
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-eec-accent bg-white'
                }`}
              />
            </div>
            {errors.code && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.code.message}</p>
            )}
          </div>

          {/* Head of Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Head of Department
            </label>
            <input
              type="text"
              placeholder="e.g. Eng. Solomon Worku"
              {...register('headOfDepartment')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent bg-white"
            />
            {errors.headOfDepartment && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.headOfDepartment.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Responsibilities
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the sector's operational mandate and engineering domain..."
              {...register('description')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent bg-white resize-y"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Physical Location Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-eec-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-eec-accent" />
            EEC Facility & Office Location
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical premises, office number, building block, and floor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Main Facility / Campus */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus / Regional Office
            </label>
            <input
              type="text"
              placeholder="e.g. Addis Ababa Head Office (Kazanchis)"
              {...register('location')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent bg-white"
            />
          </div>

          {/* Building */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Building / Block
            </label>
            <input
              type="text"
              placeholder="e.g. Block A (Engineering Wing)"
              {...register('building')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent bg-white"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Floor
            </label>
            <input
              type="text"
              placeholder="e.g. 3rd Floor"
              {...register('floor')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent bg-white"
            />
          </div>

          {/* Office / Suite Location */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Office / Room / Suite Number
            </label>
            <input
              type="text"
              placeholder="e.g. Suite A-301"
              {...register('officeLocation')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent bg-white"
            />
          </div>
        </div>
      </div>

      {/* Status Setting Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-semibold text-eec-text flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Active Status
            </label>
            <p className="text-xs text-slate-500">
              Active departments can receive new staff assignments and equipment allocations.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setValue('isActive', !isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-eec-accent/40 ${
              isActive ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-sm font-medium shadow-sm transition-all duration-200 hover:shadow disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEdit ? 'Saving Changes...' : 'Creating Department...'}
            </>
          ) : (
            <>{isEdit ? 'Save Changes' : 'Create Department'}</>
          )}
        </button>
      </div>
    </form>
  );
}
