'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton, { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import employeeService from '@/services/employee.service';
import departmentService from '@/services/department.service';
import { Employee, EmployeesResponse } from '@/constants/employees';
import { Department } from '@/constants/departments';
import EmployeeStats from '@/components/employees/EmployeeStats';
import EmployeeTable from '@/components/employees/EmployeeTable';

export default function EmployeesPage() {
  const toast = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<EmployeesResponse['meta']>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    employee: Employee | null;
    isUpdating: boolean;
  }>({
    open: false,
    employee: null,
    isUpdating: false,
  });

  // Fetch departments for filter dropdown
  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await departmentService.getAll({ limit: 100 });
        if (res.success) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error('Failed to load departments for filter:', err);
      }
    }
    loadDepts();
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await employeeService.getAll({
        search: search.trim() || undefined,
        departmentId: selectedDepartmentId !== 'all' ? selectedDepartmentId : undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: statusFilter,
        page,
        limit: 8,
      });

      if (res.success) {
        setEmployees(res.data);
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch employees';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDepartmentId, selectedRole, statusFilter, page, toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDepartmentId('all');
    setSelectedRole('all');
    setStatusFilter('all');
    setPage(1);
  };

  const handleToggleStatus = (employee: Employee) => {
    setStatusModal({
      open: true,
      employee,
      isUpdating: false,
    });
  };

  const confirmToggleStatus = async () => {
    if (!statusModal.employee) return;
    const emp = statusModal.employee;
    const newStatus = !emp.isActive;

    try {
      setStatusModal((prev) => ({ ...prev, isUpdating: true }));
      const res = await employeeService.updateStatus(emp.id, newStatus);
      if (res.success) {
        toast.success(`Employee '${emp.fullName}' ${newStatus ? 'activated' : 'deactivated'} successfully`);
        setEmployees((prev) =>
          prev.map((e) => (e.id === emp.id ? { ...e, isActive: newStatus, accountStatus: newStatus ? 'ACTIVE' : 'INACTIVE' } : e))
        );
        setStatusModal({ open: false, employee: null, isUpdating: false });
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update employee status';
      toast.error(errorMsg);
      setStatusModal((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  // Initial loading state
  if (loading && employees.length === 0 && !search && selectedDepartmentId === 'all' && selectedRole === 'all' && statusFilter === 'all') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Employees"
          description="Manage Ethiopian Engineering Corporation workforce, roles, and departmental assignments."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Employees' },
          ]}
          action={{
            label: 'Add Employee',
            href: '/employees/new',
            icon: Plus,
          }}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employees"
        description="Manage Ethiopian Engineering Corporation workforce, roles, and departmental assignments."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees' },
        ]}
        action={{
          label: 'Add Employee',
          href: '/employees/new',
          icon: Plus,
        }}
      />

      {/* Stats Cards */}
      <EmployeeStats
        employees={employees}
        total={meta.total}
        totalDepartments={departments.length || 10}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full lg:w-72">
          <SearchInput
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Dropdowns and Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter Dropdown */}
          <select
            value={selectedDepartmentId}
            onChange={(e) => {
              setSelectedDepartmentId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Role Filter Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
          >
            <option value="all">All Roles</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="VIEWER">Viewer</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'active', 'inactive'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
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
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : employees.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No employees found."
              description="No employee records match your search or filter criteria."
              action={{
                label: 'Clear Filters',
                onClick: handleClearFilters,
              }}
            />
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              onToggleStatus={handleToggleStatus}
            />

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
                <span>
                  Showing page <strong className="text-slate-800">{meta.page}</strong> of{' '}
                  <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.total} total employees)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={!meta.hasPrevPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.open && Boolean(statusModal.employee)}
        onClose={() => setStatusModal({ open: false, employee: null, isUpdating: false })}
        onConfirm={confirmToggleStatus}
        title={statusModal.employee?.isActive ? 'Deactivate Employee?' : 'Activate Employee?'}
        message={
          statusModal.employee?.isActive
            ? 'This employee will become inactive. Existing asset allocations will remain recorded.'
            : 'This employee will become active. They will regain operational access in the system.'
        }
        confirmLabel={statusModal.employee?.isActive ? 'Deactivate' : 'Activate'}
        cancelLabel="Cancel"
        variant={statusModal.employee?.isActive ? 'warning' : 'success'}
        isLoading={statusModal.isUpdating}
      />
    </div>
  );
}
