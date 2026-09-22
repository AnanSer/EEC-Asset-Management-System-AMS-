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
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import departmentService from '@/services/department.service';
import assetService from '@/services/asset.service';
import { Department } from '@/constants/departments';
import { Asset, ASSET_STATUS_LABELS, ASSET_CONDITION_LABELS } from '@/constants/assets';

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [department, setDepartment] = useState<Department | null>(null);
  const [deptAssets, setDeptAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchDepartment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setLoadingAssets(true);
      const [deptRes, assetsRes] = await Promise.all([
        departmentService.getById(id),
        assetService.getAll({ departmentId: id, limit: 100 }),
      ]);

      if (deptRes.success) {
        setDepartment(deptRes.data);
      }
      if (assetsRes.success) {
        setDeptAssets(assetsRes.data);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Department not found';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setLoadingAssets(false);
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
            { label: 'Dashboard', href: '/dashboard' },
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
          { label: 'Dashboard', href: '/dashboard' },
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

      {/* Department Assets Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-eec-primary" />
              Department Assets ({deptAssets.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned to personnel:{' '}
              <strong className="text-eec-primary">
                {deptAssets.filter((a) => a.status === 'ASSIGNED').length}
              </strong>{' '}
              of {deptAssets.length} total allocated items
            </p>
          </div>
        </div>

        {loadingAssets ? (
          <div className="p-6">
            <TableSkeleton rows={3} />
          </div>
        ) : deptAssets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Box className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No Assets Linked to Department</p>
            <p className="text-xs text-slate-400 mt-0.5">
              There are currently no assets allocated to staff in this department.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Asset Code</th>
                  <th className="px-6 py-3">Asset Name</th>
                  <th className="px-6 py-3">Assigned To</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Condition</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptAssets.map((asset) => {
                  const currentHolder = asset.currentAssignment?.employeeName;
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="font-mono text-xs font-semibold text-eec-primary hover:underline"
                        >
                          {asset.assetCode}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-eec-text">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="hover:text-eec-primary transition"
                        >
                          {asset.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-700">
                        {currentHolder ? (
                          <span className="font-semibold text-slate-800">{currentHolder}</span>
                        ) : (
                          <span className="text-slate-400 italic">Available / In Pool</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge
                          status={asset.status.toLowerCase()}
                          label={ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                        />
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge
                          status={asset.condition.toLowerCase()}
                          label={ASSET_CONDITION_LABELS[asset.condition] ?? asset.condition}
                        />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="text-xs text-eec-primary hover:underline font-semibold"
                        >
                          View Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Activate/Deactivate */}
      {department && (
        <ConfirmationModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onConfirm={handleToggleStatus}
          title={department.isActive ? 'Deactivate Department?' : 'Activate Department?'}
          message={
            department.isActive
              ? 'This department will become inactive. Existing employees and assets will remain linked to this department.'
              : 'This department will become active. Existing employees and assets will remain linked to this department.'
          }
          confirmLabel={department.isActive ? 'Deactivate' : 'Activate'}
          cancelLabel="Cancel"
          variant={department.isActive ? 'warning' : 'success'}
          isLoading={statusLoading}
        />
      )}
    </div>
  );
}
