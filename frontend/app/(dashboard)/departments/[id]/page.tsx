'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Users,
  Box,
  Edit2,
  Power,
  FileText,
  UserCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import departmentService from '@/services/department.service';
import { Department } from '@/constants/departments';

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchDepartment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await departmentService.getById(id);
      if (res.success) {
        setDepartment(res.data);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Department not found';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const handleToggleStatus = async () => {
    if (!department) return;
    const newStatus = !department.isActive;
    try {
      setStatusLoading(true);
      const res = await departmentService.updateStatus(department.id, newStatus);
      if (res.success) {
        setDepartment((prev) => (prev ? { ...prev, isActive: newStatus } : null));
        toast.success(`Department ${newStatus ? 'activated' : 'deactivated'} successfully`);
        setShowStatusModal(false);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update department status';
      toast.error(errorMsg);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Loading Department..."
          breadcrumbs={[
            { label: 'Departments', href: '/departments' },
            { label: 'Details' },
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-8 border border-slate-200">
        <EmptyState
          icon={Building2}
          title="Department Not Found"
          description="The department you are looking for does not exist or may have been relocated."
          action={{
            label: 'Back to Departments',
            onClick: () => router.push('/departments'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Breadcrumbs & Actions */}
      <PageHeader
        title={department.name}
        description={`Department Code: ${department.code}`}
        breadcrumbs={[
          { label: 'Departments', href: '/departments' },
          { label: department.name },
        ]}
      >
        <div className="flex items-center gap-2.5">
          <Link
            href={`/departments/${department.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit Department
          </Link>

          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-xs ${
              department.isActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {department.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </PageHeader>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Allocated Staff"
          value={department._count?.employees ?? 0}
          subtitle="Registered employees"
          icon={Users}
          color="accent"
        />

        <StatCard
          title="Department Assets"
          value={department._count?.assets ?? 0}
          subtitle="Assigned IT equipment"
          icon={Box}
          color="primary"
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Operational Status
            </span>
            <StatusBadge status={department.isActive ? 'ACTIVE' : 'INACTIVE'} />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-eec-text">
              {department.isActive ? 'Operational' : 'Deactivated'}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {department.isActive
                ? 'Eligible for new equipment allocations'
                : 'Restricted from new allocations'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Overview & Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-eec-accent" />
              Department Overview
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Description & Scope
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {department.description || 'No detailed description provided for this department.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Department Code
                  </span>
                  <span className="font-mono text-sm font-bold text-eec-primary bg-slate-100 px-2.5 py-1 rounded">
                    {department.code}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Head of Department
                  </span>
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    {department.headOfDepartment || 'Not designated'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Facility Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-eec-accent" />
              Premises Location
            </h3>

            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Facility / Campus</span>
                <span className="font-medium text-slate-800">
                  {department.location || 'Addis Ababa Head Office (Kazanchis)'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Building Block</span>
                <span className="font-medium text-slate-800">
                  {department.building || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Floor</span>
                <span className="font-medium text-slate-800">
                  {department.floor || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Office / Room Suite</span>
                <span className="font-medium text-slate-800">
                  {department.officeLocation || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 text-xs text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span>Created</span>
              <span className="font-medium text-slate-700">
                {new Date(department.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Modified</span>
              <span className="font-medium text-slate-700">
                {new Date(department.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Activate/Deactivate */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  department.isActive ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {department.isActive ? <AlertTriangle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-base font-semibold text-eec-text">
                  {department.isActive ? 'Deactivate Department' : 'Activate Department'}
                </h4>
                <p className="text-xs text-slate-500">
                  {department.name} ({department.code})
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {department.isActive
                ? 'Deactivating this department will flag it as inactive. Existing employee and asset records are preserved, but new allocations will be restricted.'
                : 'Activating this department will restore it to full operational status for staff and asset assignments.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                disabled={statusLoading}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors ${
                  department.isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusLoading
                  ? 'Updating...'
                  : department.isActive
                  ? 'Yes, Deactivate'
                  : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
