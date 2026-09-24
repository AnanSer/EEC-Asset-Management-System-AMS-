'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Globe,
  Palette,
  Server,
  Save,
  RotateCcw,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Lock,
  Clock,
  Database,
  Mail,
  Phone,
  MapPin,
  Hash,
  Cpu,
  Layers,
  Check,
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import InfoCard from '@/components/ui/InfoCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/hooks/usePermissions';
import { invalidateSystemSettings } from '@/hooks/useSystemSettings';
import { PERMISSIONS } from '@/lib/authorization';
import settingsService, {
  SystemSettings,
  SystemInfo,
  UpdateSettingsInput,
} from '@/services/settings.service';

const settingsFormSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters'),
  organizationShortName: z
    .string()
    .trim()
    .min(1, 'Short name must be at least 1 character')
    .max(20, 'Short name cannot exceed 20 characters'),
  supportEmail: z
    .string()
    .trim()
    .email('Please enter a valid support email address'),
  supportPhone: z
    .string()
    .trim()
    .min(5, 'Support phone must be at least 5 characters')
    .max(30, 'Support phone cannot exceed 30 characters'),
  headquartersAddress: z
    .string()
    .trim()
    .min(2, 'Headquarters address must be at least 2 characters')
    .max(200, 'Headquarters address cannot exceed 200 characters'),
  defaultLanguage: z.enum(['EN', 'AM', 'OM']),
  timezone: z.string().min(2, 'Timezone is required'),
  dateFormat: z.string().min(2, 'Date format is required'),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { success, error: toastError, info } = useToast();
  const { role, isAdmin, can, isLoading: isRoleLoading } = usePermissions();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const canEdit = isAdmin || can(PERMISSIONS.SETTINGS_UPDATE);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      organizationName: '',
      organizationShortName: '',
      supportEmail: '',
      supportPhone: '',
      headquartersAddress: '',
      defaultLanguage: 'EN',
      timezone: 'Africa/Addis_Ababa',
      dateFormat: 'DD/MM/YYYY',
    },
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const [settingsRes, infoRes] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getSystemInfo().catch((err) => {
          console.warn('System info endpoint warning:', err);
          return {
            success: true,
            data: {
              systemVersion: 'v1.0.0',
              backendStatus: 'Connected',
              database: 'PostgreSQL',
              authProvider: 'Better Auth',
              mailProvider: 'Nodemailer Gmail SMTP',
              nodeVersion: 'Node.js',
              environment: 'development',
              uptimeSeconds: 0,
              serverTime: new Date().toISOString(),
            },
          };
        }),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
        reset({
          organizationName: settingsRes.data.organizationName || '',
          organizationShortName: settingsRes.data.organizationShortName || '',
          supportEmail: settingsRes.data.supportEmail || '',
          supportPhone: settingsRes.data.supportPhone || '',
          headquartersAddress: settingsRes.data.headquartersAddress || '',
          defaultLanguage: (settingsRes.data.defaultLanguage as 'EN' | 'AM' | 'OM') || 'EN',
          timezone: settingsRes.data.timezone || 'Africa/Addis_Ababa',
          dateFormat: settingsRes.data.dateFormat || 'DD/MM/YYYY',
        });
      }

      if (infoRes.success && infoRes.data) {
        setSystemInfo(infoRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load settings data:', err);
      const msg = err.response?.data?.message || 'Failed to load organization settings.';
      setFetchError(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [reset, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: SettingsFormData) => {
    if (!canEdit) {
      toastError('Unauthorized: Only administrators can update organization settings.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: UpdateSettingsInput = {
        organizationName: data.organizationName,
        organizationShortName: data.organizationShortName,
        supportEmail: data.supportEmail,
        supportPhone: data.supportPhone,
        headquartersAddress: data.headquartersAddress,
        defaultLanguage: data.defaultLanguage,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
      };

      const res = await settingsService.updateSettings(payload);

      if (res.success && res.data) {
        setSettings(res.data);
        reset({
          organizationName: res.data.organizationName,
          organizationShortName: res.data.organizationShortName,
          supportEmail: res.data.supportEmail,
          supportPhone: res.data.supportPhone,
          headquartersAddress: res.data.headquartersAddress,
          defaultLanguage: (res.data.defaultLanguage as 'EN' | 'AM' | 'OM') || 'EN',
          timezone: res.data.timezone,
          dateFormat: res.data.dateFormat,
        });
        // Invalidate cached settings across all components
        invalidateSystemSettings();
        success('System settings saved successfully!');
      } else {
        toastError(res.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      console.error('Save settings error:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save system settings. Please verify inputs.';
      toastError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!settings) return;
    reset({
      organizationName: settings.organizationName,
      organizationShortName: settings.organizationShortName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      headquartersAddress: settings.headquartersAddress,
      defaultLanguage: (settings.defaultLanguage as 'EN' | 'AM' | 'OM') || 'EN',
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
    });
    info('Form reset to saved settings.');
  };

  const handleLogoUploadClick = () => {
    info('Image upload placeholder: Media asset storage will be enabled in upcoming release.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title="System Settings"
        description="Centralized administration for enterprise organization profile, localization preferences, branding, and system telemetry."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!isRoleLoading && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  canEdit
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                }`}
              >
                {canEdit ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Administrator (Full Edit Access)
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    Read-Only Mode ({role || 'Employee'})
                  </>
                )}
              </span>
            )}
          </div>
        }
      />

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : fetchError ? (
        <div className="eec-card text-center py-12">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">Failed to Load Settings</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{fetchError}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-eec-primary hover:bg-eec-primary-dark text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Organization Profile & Localization (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Organization Profile */}
              <InfoCard
                title="Organization Profile"
                icon={Building2}
                subtitle="Official corporate identity and contact points"
              >
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Organization Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Organization Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          disabled={!canEdit || isSubmitting}
                          {...register('organizationName')}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                            errors.organizationName
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-slate-200 focus:border-eec-accent focus:ring-1 focus:ring-eec-accent'
                          } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                          placeholder="e.g. Ethiopian Engineering Corporation"
                        />
                      </div>
                      {errors.organizationName && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.organizationName.message}
                        </p>
                      )}
                    </div>

                    {/* Short Name */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Short Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          disabled={!canEdit || isSubmitting}
                          {...register('organizationShortName')}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                            errors.organizationShortName
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-slate-200 focus:border-eec-accent focus:ring-1 focus:ring-eec-accent'
                          } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                          placeholder="e.g. EEC"
                        />
                      </div>
                      {errors.organizationShortName && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.organizationShortName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Support Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Corporate Support Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="email"
                          disabled={!canEdit || isSubmitting}
                          {...register('supportEmail')}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                            errors.supportEmail
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-slate-200 focus:border-eec-accent focus:ring-1 focus:ring-eec-accent'
                          } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                          placeholder="support@eec.gov.et"
                        />
                      </div>
                      {errors.supportEmail && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.supportEmail.message}
                        </p>
                      )}
                    </div>

                    {/* Support Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Support Phone / Helpdesk <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          disabled={!canEdit || isSubmitting}
                          {...register('supportPhone')}
                          className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                            errors.supportPhone
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-slate-200 focus:border-eec-accent focus:ring-1 focus:ring-eec-accent'
                          } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                          placeholder="+251 11 123 4567"
                        />
                      </div>
                      {errors.supportPhone && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.supportPhone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Headquarters Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Headquarters Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        disabled={!canEdit || isSubmitting}
                        {...register('headquartersAddress')}
                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                          errors.headquartersAddress
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-200 focus:border-eec-accent focus:ring-1 focus:ring-eec-accent'
                        } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                        placeholder="Addis Ababa Head Office (Kazanchis), Ethiopia"
                      />
                    </div>
                    {errors.headquartersAddress && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.headquartersAddress.message}
                      </p>
                    )}
                  </div>
                </div>
              </InfoCard>

              {/* Section 2: Localization Preferences */}
              <InfoCard
                title="Localization & Regional Settings"
                icon={Globe}
                subtitle="Configure language, timezone, and calendar date display formats"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Default Language */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Language <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={!canEdit || isSubmitting}
                      {...register('defaultLanguage')}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                        errors.defaultLanguage
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-slate-200 focus:border-eec-accent'
                      } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                    >
                      <option value="EN">English (EN)</option>
                      <option value="AM">Amharic (አማርኛ - AM)</option>
                      <option value="OM">Afaan Oromoo (OM)</option>
                    </select>
                    {errors.defaultLanguage && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.defaultLanguage.message}
                      </p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Timezone <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={!canEdit || isSubmitting}
                      {...register('timezone')}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                        errors.timezone
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-slate-200 focus:border-eec-accent'
                      } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                    >
                      <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT, UTC+3)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                      <option value="UTC">UTC (Universal Time Coordinated)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                    </select>
                    {errors.timezone && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.timezone.message}
                      </p>
                    )}
                  </div>

                  {/* Date Format */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date Format <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={!canEdit || isSubmitting}
                      {...register('dateFormat')}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                        errors.dateFormat
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-slate-200 focus:border-eec-accent'
                      } ${!canEdit ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'}`}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/09/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/24/2026)</option>
                    </select>
                    {errors.dateFormat && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.dateFormat.message}
                      </p>
                    )}
                  </div>
                </div>
              </InfoCard>

              {/* Action Buttons Bar */}
              {canEdit ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">
                    {isDirty ? (
                      <span className="text-amber-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        You have unsaved configuration changes.
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        All settings are synchronized with database.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={!isDirty || isSubmitting}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save System Settings
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>View-Only Permission:</strong> Modifying enterprise organization settings
                    and system configurations requires administrator privilege (<code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px]">ADMIN</code>).
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Branding & System Information (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Section 3: Branding */}
              <InfoCard
                title="Corporate Branding"
                icon={Palette}
                subtitle="Organization emblem and asset tags branding"
              >
                <div className="space-y-4 pt-1">
                  {/* Logo Display */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center">
                    {settings?.logoUrl ? (
                      <div className="w-full max-w-[260px] h-24 rounded-2xl bg-[#083D4A] flex items-center justify-center shadow-md mb-3 border-2 border-[#00A7D6]/30 p-3 overflow-hidden">
                        <img
                          src={settings.logoUrl}
                          alt={settings.organizationShortName || 'Logo'}
                          className="h-full w-auto max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#083D4A] to-[#00A7D6] flex items-center justify-center text-white shadow-md mb-3 border-2 border-white">
                        <span className="font-black text-xl tracking-wider">
                          {settings?.organizationShortName ? settings.organizationShortName.slice(0, 3) : 'EEC'}
                        </span>
                      </div>
                    )}
                    <div className="font-bold text-sm text-slate-800">
                      {settings?.organizationShortName || 'EEC'}
                    </div>
                    <div className="text-xs text-slate-500 max-w-[220px] truncate mt-0.5">
                      {settings?.organizationName || 'Ethiopian Engineering Corporation'}
                    </div>
                  </div>

                  {/* Upload Placeholder */}
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 hover:border-slate-300 transition-colors">
                    <div className="p-2 w-9 h-9 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Update Emblem</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload placeholder only. No image storage configured yet.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={handleLogoUploadClick}
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Choose File (Mock)
                    </button>
                  </div>
                </div>
              </InfoCard>

              {/* Section 4: System Information (Read Only) */}
              <InfoCard
                title="System Information"
                icon={Server}
                subtitle="Runtime platform, services, and architecture"
              >
                <div className="space-y-3 pt-1 text-xs">
                  {/* System Version */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Cpu className="w-4 h-4 text-eec-primary" />
                      <span className="font-medium">System Version</span>
                    </div>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {systemInfo?.systemVersion || 'v1.0.0'}
                    </span>
                  </div>

                  {/* Backend Status */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">Backend Status</span>
                    </div>
                    <StatusBadge status="active" label={systemInfo?.backendStatus || 'Connected'} />
                  </div>

                  {/* Database */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Database className="w-4 h-4 text-sky-600" />
                      <span className="font-medium">Database</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {systemInfo?.database || 'PostgreSQL'}
                    </span>
                  </div>

                  {/* Auth Provider */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Authentication</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {systemInfo?.authProvider || 'Better Auth'}
                    </span>
                  </div>

                  {/* Mail Provider */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-rose-500" />
                      <span className="font-medium">Mail Provider</span>
                    </div>
                    <span className="font-semibold text-slate-700 text-right">
                      {systemInfo?.mailProvider || 'Nodemailer Gmail SMTP'}
                    </span>
                  </div>

                  {/* Environment & Node Version */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Environment: {systemInfo?.environment || 'development'}</span>
                    <span>Node: {systemInfo?.nodeVersion || 'v22.x'}</span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
