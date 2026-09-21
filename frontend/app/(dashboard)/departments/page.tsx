'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  Eye,
  Edit2,
  Power,
  Users,
  Box,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import departmentService from '@/services/department.service';
import { Department, PaginationMeta } from '@/constants/departments';

export default function DepartmentsPage() {
  const router = useRouter();
  const toast = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Status toggle confirmation modal state
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    department: Department | null;
    isUpdating: boolean;
  }>({
    open: false,
    department: null,
    isUpdating: false,
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAll({
        search: search.trim() || undefined,
        status: statusFilter,
        page,
        limit: 8,
      });

      if (res.success) {
        setDepartments(res.data);
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load departments';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter(filter);
    setPage(1);
  };

  const confirmToggleStatus = async () => {
    if (!statusModal.department) return;
    const dept = statusModal.department;
    const newStatus = !dept.isActive;

    try {
      setStatusModal((prev) => ({ ...prev, isUpdating: true }));
      const res = await departmentService.updateStatus(dept.id, newStatus);
      if (res.success) {
        toast.success(`Department '${dept.name}' ${newStatus ? 'activated' : 'deactivated'} successfully`);
        // Update local state directly
        setDepartments((prev) =>
          prev.map((d) => (d.id === dept.id ? { ...d, isActive: newStatus } : d))
        );
        setStatusModal({ open: false, department: null, isUpdating: false });
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update department status';
      toast.error(errorMsg);
      setStatusModal((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Departments"
        description="Manage Ethiopian Engineering Corporation organizational sectors, directorates, and asset allocations."
        action={{
          label: 'Add Department',
          href: '/departments/new',
          icon: Plus,
        }}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Search by name, code, or building..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg self-start md:self-auto">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => handleStatusFilterChange(filter)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                statusFilter === filter
                  ? 'bg-white text-eec-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter === 'all' ? 'All Status' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : departments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No Departments Found"
              description={
                search || statusFilter !== 'all'
                  ? 'No departments match your current filter or search criteria.'
                  : 'Get started by creating your first organizational department.'
              }
              action={
                search || statusFilter !== 'all'
                  ? {
                      label: 'Reset Filters',
                      onClick: () => {
                        setSearch('');
                        setStatusFilter('all');
                        setPage(1);
                      },
                    }
                  : {
                      label: 'Create Department',
                      onClick: () => router.push('/departments/new'),
                    }
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Department / Code</th>
                  <th className="py-3.5 px-5">Office Location</th>
                  <th className="py-3.5 px-5">Head of Dept</th>
                  <th className="py-3.5 px-4 text-center">Allocations</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Department Name & Code */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-eec-primary/10 text-eec-primary flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            href={`/departments/${dept.id}`}
                            className="font-semibold text-eec-text hover:text-eec-accent transition-colors line-clamp-1"
                          >
                            {dept.name}
                          </Link>
                          <span className="inline-block font-mono text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                            {dept.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-5 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">
                          {dept.building || dept.officeLocation
                            ? `${dept.building || ''}${dept.floor ? `, ${dept.floor}` : ''}${dept.officeLocation ? ` (${dept.officeLocation})` : ''}`
                            : dept.location || 'Kazanchis Head Office'}
                        </span>
                      </div>
                    </td>

                    {/* Head of Department */}
                    <td className="py-3.5 px-5 text-xs text-slate-700 font-medium">
                      {dept.headOfDepartment || <span className="text-slate-400">Unassigned</span>}
                    </td>

                    {/* Allocations: Staff & Assets */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1" title="Employees">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{dept._count?.employees ?? 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1" title="Assets">
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{dept._count?.assets ?? 0}</span>
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <StatusBadge status={dept.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <Link
                          href={`/departments/${dept.id}`}
                          className="p-1.5 text-slate-400 hover:text-eec-primary hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/departments/${dept.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-eec-accent hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Department"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Toggle Active/Inactive */}
                        <button
                          type="button"
                          onClick={() => setStatusModal({ open: true, department: dept, isUpdating: false })}
                          className={`p-1.5 rounded-lg transition-colors ${
                            dept.isActive
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={dept.isActive ? 'Deactivate Department' : 'Activate Department'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && departments.length > 0 && meta.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(page - 1) * meta.limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(page * meta.limit, meta.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{meta.total}</span> departments
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs font-semibold rounded-lg transition-colors ${
                    page === p
                      ? 'bg-eec-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Activate/Deactivate */}
      {statusModal.open && statusModal.department && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  statusModal.department.isActive ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {statusModal.department.isActive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-base font-semibold text-eec-text">
                  {statusModal.department.isActive ? 'Deactivate Department' : 'Activate Department'}
                </h4>
                <p className="text-xs text-slate-500">
                  {statusModal.department.name} ({statusModal.department.code})
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {statusModal.department.isActive
                ? 'Deactivating this department will flag it as inactive. Existing employee and asset assignments remain recorded, but new allocations will be restricted.'
                : 'Activating this department will restore it to full operational status for staff and asset assignments.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, department: null, isUpdating: false })}
                disabled={statusModal.isUpdating}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                disabled={statusModal.isUpdating}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors ${
                  statusModal.department.isActive
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusModal.isUpdating
                  ? 'Updating...'
                  : statusModal.department.isActive
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
