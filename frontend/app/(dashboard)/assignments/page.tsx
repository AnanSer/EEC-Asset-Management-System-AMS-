'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton, { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import assignmentService, { AssignmentsResponse } from '@/services/assignment.service';
import departmentService from '@/services/department.service';
import employeeService from '@/services/employee.service';
import { AssetAssignment, AssignmentStats } from '@/constants/assignments';
import { Department } from '@/constants/departments';
import { Employee } from '@/constants/employees';
import AssignmentTable from '@/components/assignments/AssignmentTable';
import AssignmentSummary from '@/components/assignments/AssignmentSummary';
import TransferModal from '@/components/assignments/TransferModal';
import ReturnModal from '@/components/assignments/ReturnModal';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/authorization';

export default function AssignmentsPage() {
  const toast = useToast();
  const { can } = usePermissions();

  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);

  const [meta, setMeta] = useState<AssignmentsResponse['meta']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states for action triggers
  const [transferTarget, setTransferTarget] = useState<AssetAssignment | null>(null);
  const [returnTarget, setReturnTarget] = useState<AssetAssignment | null>(null);

  // Load department and employee filter lists & stats
  useEffect(() => {
    departmentService.getAll({ limit: 100 }).then((res) => {
      if (res.success) setDepartments(res.data);
    }).catch(() => {});

    employeeService.getAll({ limit: 100 }).then((res) => {
      if (res.success) setEmployees(res.data);
    }).catch(() => {});

    assignmentService.getStats().then((res) => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getAll({
        search: search.trim() || undefined,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
        employeeId: employeeFilter !== 'all' ? employeeFilter : undefined,
        isCurrent: statusFilter,
        page,
        limit: 10,
      });

      if (res.success) {
        setAssignments(res.data);
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message || 'Failed to fetch assignments';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, employeeFilter, statusFilter, page, toast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const refreshData = () => {
    fetchAssignments();
    assignmentService.getStats().then((res) => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDepartmentFilter('all');
    setEmployeeFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const isInitialLoad =
    loading &&
    assignments.length === 0 &&
    !search &&
    departmentFilter === 'all' &&
    employeeFilter === 'all' &&
    statusFilter === 'all';

  if (isInitialLoad) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Asset Assignments"
          description="Track custody, allocations, transfers, and inventory returns."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assignments' },
          ]}
          action={
            can(PERMISSIONS.ASSETS_ASSIGN)
              ? { label: 'New Assignment', href: '/assignments/new', icon: Plus }
              : undefined
          }
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Assignments"
        description="Track custody, allocations, transfers, and inventory returns."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assignments' },
        ]}
        action={
          can(PERMISSIONS.ASSETS_ASSIGN)
            ? { label: 'New Assignment', href: '/assignments/new', icon: Plus }
            : undefined
        }
      />

      {/* Summary KPI Cards */}
      {stats && (
        <AssignmentSummary
          total={stats.totalAssignments}
          active={stats.activeAssignments}
          returned={stats.returnedAssignments}
          employeesWithAssets={stats.employeesWithAssets}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search code, name, staff..."
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent"
            >
              <option value="all">All Staff Members</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Custody Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'true' | 'false');
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40 focus:border-eec-accent"
            >
              <option value="all">All Assignments (Active &amp; Returned)</option>
              <option value="true">Current Custody Only</option>
              <option value="false">Returned to Inventory Only</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(search || departmentFilter !== 'all' || employeeFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing filtered results ({meta.total} records found)
            </span>
            <button
              onClick={handleClearFilters}
              className="text-eec-accent hover:underline font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={ClipboardList}
              title="No Assignment Records Found"
              description={
                search || departmentFilter !== 'all' || employeeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No records match your active search filters. Try adjusting your query.'
                  : 'Start assigning available IT and corporate assets to Ethiopian Engineering Corporation employees.'
              }
              action={
                search || departmentFilter !== 'all' || employeeFilter !== 'all' || statusFilter !== 'all'
                  ? { label: 'Clear Filters', onClick: handleClearFilters }
                  : can(PERMISSIONS.ASSETS_ASSIGN)
                  ? { label: 'New Assignment', href: '/assignments/new' }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <AssignmentTable
              assignments={assignments}
              onTransfer={can(PERMISSIONS.ASSETS_ASSIGN) ? (item) => setTransferTarget(item) : undefined}
              onReturn={can(PERMISSIONS.ASSETS_ASSIGN) ? (item) => setReturnTarget(item) : undefined}
            />

            {/* Pagination Bar */}
            {meta.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                <span className="text-xs text-slate-500">
                  Showing Page <strong>{meta.page}</strong> of{' '}
                  <strong>{meta.totalPages}</strong> ({meta.total} assignments)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!meta.hasPrevPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transfer Modal */}
      {transferTarget && (
        <TransferModal
          isOpen={Boolean(transferTarget)}
          onClose={() => setTransferTarget(null)}
          asset={{
            id: transferTarget.assetId,
            assetCode: transferTarget.asset?.assetCode || '',
            name: transferTarget.asset?.name || '',
            currentHolderName: transferTarget.employee?.fullName,
            currentEmployeeId: transferTarget.employeeId,
          }}
          onSuccess={refreshData}
        />
      )}

      {/* Return Modal */}
      {returnTarget && (
        <ReturnModal
          isOpen={Boolean(returnTarget)}
          onClose={() => setReturnTarget(null)}
          asset={{
            id: returnTarget.assetId,
            assetCode: returnTarget.asset?.assetCode || '',
            name: transferTarget?.asset?.name || returnTarget.asset?.name || '',
            currentHolderName: returnTarget.employee?.fullName,
          }}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
