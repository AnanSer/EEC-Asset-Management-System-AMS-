'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Tag, Hash, Monitor, Building2, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';
import { Asset, CreateAssetInput, ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS, ASSET_CONDITION_LABELS } from '@/constants/assets';
import departmentService from '@/services/department.service';
import { Department } from '@/constants/departments';

export const assetFormSchema = z.object({
  assetCode: z
    .string()
    .trim()
    .min(3, 'Asset code must be at least 3 characters')
    .max(50, 'Asset code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
  name: z
    .string()
    .trim()
    .min(2, 'Asset name must be at least 2 characters')
    .max(150, 'Name cannot exceed 150 characters'),
  category: z.enum([
    'LAPTOP', 'DESKTOP', 'PRINTER', 'SCANNER', 'ROUTER',
    'SWITCH', 'PROJECTOR', 'MONITOR', 'SERVER', 'UPS', 'OTHER',
  ] as const),
  brand: z.string().trim().max(100).optional().nullable(),
  model: z.string().trim().max(100).optional().nullable(),
  serialNumber: z
    .string()
    .trim()
    .min(2, 'Serial number must be at least 2 characters')
    .max(100, 'Serial number cannot exceed 100 characters'),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED'] as const),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'RETIRED'] as const),
  departmentId: z.string().optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().positive('Price must be a positive number').optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type AssetFormData = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  initialData?: Asset;
  onSubmit: (data: CreateAssetInput) => Promise<void>;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-rose-600 mt-1">{message}</p>;
}

export default function AssetForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: AssetFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssetFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(assetFormSchema) as any,
    defaultValues: {
      assetCode: initialData?.assetCode || '',
      name: initialData?.name || '',
      category: (initialData?.category as AssetFormData['category']) || 'LAPTOP',
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      serialNumber: initialData?.serialNumber || '',
      status: (initialData?.status as AssetFormData['status']) || 'AVAILABLE',
      condition: (initialData?.condition as AssetFormData['condition']) || 'GOOD',
      departmentId: initialData?.departmentId || '',
      location: initialData?.location || '',
      purchaseDate: initialData?.purchaseDate
        ? new Date(initialData.purchaseDate).toISOString().substring(0, 10)
        : '',
      purchasePrice: initialData?.purchasePrice ?? undefined,
      warrantyExpiry: initialData?.warrantyExpiry
        ? new Date(initialData.warrantyExpiry).toISOString().substring(0, 10)
        : '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    async function loadDepts() {
      try {
        setLoadingDepts(true);
        const res = await departmentService.getAll({ limit: 100 });
        if (res.success) setDepartments(res.data);
      } catch {
        // fail silently
      } finally {
        setLoadingDepts(false);
      }
    }
    loadDepts();
  }, []);

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      departmentId: data.departmentId || null,
      purchaseDate: data.purchaseDate || null,
      warrantyExpiry: data.warrantyExpiry || null,
    } as unknown as CreateAssetInput);
  });

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent transition';

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* Section: Identity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Tag className="w-4 h-4" /> Asset Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Asset Code *</label>
            <input
              {...register('assetCode')}
              placeholder="e.g. LAP-001"
              className={`${inputClass} uppercase`}
            />
            <FieldError message={errors.assetCode?.message} />
          </div>
          <div>
            <label className={labelClass}>Asset Name *</label>
            <input {...register('name')} placeholder="e.g. Dell Latitude 5420" className={inputClass} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select {...register('category')} className={inputClass}>
              {(Object.entries(ASSET_CATEGORY_LABELS) as [string, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <FieldError message={errors.category?.message} />
          </div>
          <div>
            <label className={labelClass}>Serial Number *</label>
            <input {...register('serialNumber')} placeholder="e.g. SN-123456789" className={inputClass} />
            <FieldError message={errors.serialNumber?.message} />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input {...register('brand')} placeholder="e.g. Dell, HP, Cisco" className={inputClass} />
            <FieldError message={errors.brand?.message} />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input {...register('model')} placeholder="e.g. Latitude 5420" className={inputClass} />
            <FieldError message={errors.model?.message} />
          </div>
        </div>
      </div>

      {/* Section: Status & Condition */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Monitor className="w-4 h-4" /> Status &amp; Condition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Status *</label>
            <select {...register('status')} className={inputClass}>
              {(Object.entries(ASSET_STATUS_LABELS) as [string, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <FieldError message={errors.status?.message} />
          </div>
          <div>
            <label className={labelClass}>Condition *</label>
            <select {...register('condition')} className={inputClass}>
              {(Object.entries(ASSET_CONDITION_LABELS) as [string, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <FieldError message={errors.condition?.message} />
          </div>
        </div>
      </div>

      {/* Section: Location */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Department</label>
            <select {...register('departmentId')} className={inputClass} disabled={loadingDepts}>
              <option value="">— No Department —</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <FieldError message={errors.departmentId?.message} />
          </div>
          <div>
            <label className={labelClass}>Office / Room Location</label>
            <input {...register('location')} placeholder="e.g. Room 201, IT Lab" className={inputClass} />
            <FieldError message={errors.location?.message} />
          </div>
        </div>
      </div>

      {/* Section: Purchase & Warranty */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Purchase &amp; Warranty
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Purchase Date</label>
            <input type="date" {...register('purchaseDate')} className={inputClass} />
            <FieldError message={errors.purchaseDate?.message} />
          </div>
          <div>
            <label className={labelClass}>Purchase Price (ETB)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('purchasePrice')}
              placeholder="0.00"
              className={inputClass}
            />
            <FieldError message={errors.purchasePrice?.message} />
          </div>
          <div>
            <label className={labelClass}>Warranty Expiry</label>
            <input type="date" {...register('warrantyExpiry')} className={inputClass} />
            <FieldError message={errors.warrantyExpiry?.message} />
          </div>
        </div>
      </div>

      {/* Section: Notes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Notes
        </h3>
        <textarea
          {...register('notes')}
          rows={4}
          placeholder="Any additional information about this asset..."
          className={`${inputClass} resize-none`}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-eec-primary text-white text-sm font-semibold hover:bg-eec-primary/90 transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Register Asset'}
        </button>
      </div>
    </form>
  );
}
