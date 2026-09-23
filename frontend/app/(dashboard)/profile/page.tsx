'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth-client';
import { UserAvatar } from '@/components/auth';
import {
  UserCircle,
  Mail,
  Building2,
  Shield,
  Briefcase,
  Calendar,
  IdCard,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  Phone,
  AlertCircle,
  RotateCw,
  Loader2,
} from 'lucide-react';

interface UserProfileData {
  userId: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  employeeId: string;
  departmentName: string;
  departmentCode?: string;
  position: string;
  officeLocation?: string | null;
  phone?: string | null;
}

export default function ProfilePage() {
  const { success, info } = useToast();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Email verification resend state
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      const res = await fetch(`${apiBase}/api/auth/me`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error('Invalid user profile response');
      }

      const user = json.data.user;
      const session = json.data.session;
      const businessUser = json.data.businessUser;
      const employeeProfile = businessUser?.employeeProfile;

      const fullName =
        employeeProfile?.fullName ||
        (employeeProfile?.firstName
          ? `${employeeProfile.firstName} ${employeeProfile.lastName}`
          : user?.name) ||
        'EEC Employee';

      setProfile({
        userId: user?.id || businessUser?.id || '',
        email: user?.email || businessUser?.email || '',
        name: fullName,
        image: user?.image || null,
        role: businessUser?.role || 'EMPLOYEE',
        status: businessUser?.status || 'APPROVED',
        isEmailVerified: Boolean(businessUser?.isEmailVerified ?? user?.emailVerified),
        createdAt: businessUser?.createdAt || user?.createdAt || new Date().toISOString(),
        lastLoginAt: session?.createdAt || session?.updatedAt || null,
        employeeId: employeeProfile?.employeeId || '—',
        departmentName: employeeProfile?.department?.name || 'General Directorate',
        departmentCode: employeeProfile?.department?.code,
        position: employeeProfile?.jobTitle || 'Staff Member',
        officeLocation: employeeProfile?.officeLocation,
        phone: employeeProfile?.phone,
      });
    } catch (err: unknown) {
      console.error('Failed to load profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleResendVerification = async () => {
    if (!profile?.email || resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      await authClient.sendVerificationEmail({
        email: profile.email.trim().toLowerCase(),
        callbackURL: `${window.location.origin}/verify-email`,
      });

      success(`A fresh verification email was sent to ${profile.email}.`);
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      info('If the account exists, a new verification link was dispatched.');
      setResendCooldown(60);
    } finally {
      setResending(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Profile' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Profile"
          description="View your corporate identity, assigned role, and organizational credentials."
          breadcrumbs={breadcrumbs}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Profile"
          description="View your corporate identity, assigned role, and organizational credentials."
          breadcrumbs={breadcrumbs}
        />
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <EmptyState
            title="Failed to Load Profile"
            description={
              error
                ? `An error occurred while loading your profile: ${error}`
                : 'Unable to retrieve your corporate profile information.'
            }
            icon={AlertCircle}
            action={{
              label: 'Retry',
              onClick: loadUserProfile,
            }}
          />
        </div>
      </div>
    );
  }

  const formattedMemberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const formattedLastLogin = profile.lastLoginAt
    ? new Date(profile.lastLoginAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Active Session';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Profile"
        description="View your corporate identity, assigned role, and organizational credentials."
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar & Identity Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center text-center">
          <UserAvatar
            name={profile.name}
            email={profile.email}
            image={profile.image}
            size="lg"
            className="mb-4"
          />

          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {profile.name}
          </h2>

          <p className="text-xs text-slate-500 mt-1 font-medium">
            {profile.position}
          </p>

          <p className="text-xs text-eec-accent font-semibold mt-0.5">
            {profile.departmentName}
          </p>

          {/* Account Status Badge */}
          <div className="mt-4 pt-4 border-t border-slate-100 w-full flex flex-col items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Account Status
            </span>
            <StatusBadge status={profile.status} />
          </div>

          {/* Role Badge */}
          <div className="mt-3 pt-3 border-t border-slate-100 w-full flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              System Access Role
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-eec-primary/10 text-eec-primary ring-1 ring-eec-primary/20">
              <Shield size={13} />
              <span>{profile.role.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Right: Account Security & Corporate Details Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Account Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-eec-primary/10 text-eec-primary">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Account Security
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authentication credentials, verification posture, and access telemetry
                  </p>
                </div>
              </div>
              <StatusBadge status={profile.status} />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Corporate Email */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Corporate Email
                  </dt>
                  <dd className="text-sm font-medium text-slate-900 truncate mt-0.5">
                    {profile.email}
                  </dd>
                </div>
              </div>

              {/* Email Verification Badge & Resend Action */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email Verification
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={profile.isEmailVerified ? 'verified' : 'unverified'}
                      label={profile.isEmailVerified ? 'Verified' : 'Unverified'}
                    />
                    {!profile.isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendCooldown > 0 || resending}
                        className="text-xs font-semibold text-eec-accent hover:text-eec-primary transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {resending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <RotateCw size={12} />
                        )}
                        <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend link'}</span>
                      </button>
                    )}
                  </dd>
                </div>
              </div>

              {/* Account Status Badge */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <Shield size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Account Status
                  </dt>
                  <dd className="mt-1">
                    <StatusBadge status={profile.status} />
                  </dd>
                </div>
              </div>

              {/* Last Login */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <Clock size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Last Login
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                    {formattedLastLogin}
                  </dd>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 sm:col-span-2">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Member Since
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                    {formattedMemberSince}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* 2. Corporate Profile & Organization Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-eec-primary/10 text-eec-primary">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Corporate Profile & Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official employee profile registered in EEC EAMS
                  </p>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <UserCircle size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                    {profile.name}
                  </dd>
                </div>
              </div>

              {/* Employee ID */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <IdCard size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Employee ID
                  </dt>
                  <dd className="text-sm font-mono font-bold text-slate-900 truncate mt-0.5">
                    {profile.employeeId}
                  </dd>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Department
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                    {profile.departmentName}{' '}
                    {profile.departmentCode ? `(${profile.departmentCode})` : ''}
                  </dd>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Position / Job Title
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                    {profile.position}
                  </dd>
                </div>
              </div>

              {/* Office Location if present */}
              {profile.officeLocation && (
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Office Location
                    </dt>
                    <dd className="text-sm font-medium text-slate-900 truncate mt-0.5">
                      {profile.officeLocation}
                    </dd>
                  </div>
                </div>
              )}

              {/* Phone Number if present */}
              {profile.phone && (
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="p-2 rounded-lg bg-white text-eec-primary shadow-2xs border border-slate-100 shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Number
                    </dt>
                    <dd className="text-sm font-medium text-slate-900 truncate mt-0.5">
                      {profile.phone}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
