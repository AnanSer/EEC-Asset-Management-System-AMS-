'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Package,
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import reportService, { EmployeeReportItem } from '@/services/report.service';
import departmentService from '@/services/department.service';
import { exportToCSV, exportToExcel, printReport } from '@/src/utils/export';

export default function EmployeesReportPage() {
  const [employees, setEmployees] = useState<EmployeeReportItem[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('all');
  const [isActive, setIsActive] = useState('all');

  // Load department options for filter dropdown
  useEffect(() => {
    departmentService
      .getAll({ limit: 100 })
      .then((res) => {
        if (res.data) {
          setDepartments(res.data.map((d: any) => ({ id: d.id, name: d.name })));
        }
      })
      .catch(() => {});
  }, []);

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = {
      search,
      page,
      limit: 15,
    };
    if (departmentId !== 'all') params.departmentId = departmentId;
    if (isActive === 'true') params.isActive = 'true';
    if (isActive === 'false') params.isActive = 'false';

    reportService
      .getEmployees(params)
      .then((res) => {
        setEmployees(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((err) => {
        console.error('Failed to load employee report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, departmentId, isActive, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const totalAssignedAssets = employees.reduce((sum, e) => sum + e.assignedAssetsCount, 0);

  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Full Name',
      'Email',
      'Role',
      'Job Title',
      'Department',
      'Status',
      'Assigned Assets Count',
      'Assigned Equipment Codes',
    ];
    const rows = employees.map((e) => [
      e.employeeId,
      e.fullName,
      e.email,
      e.role,
      e.jobTitle,
      e.department?.name || 'Unassigned',
      e.isActive ? 'ACTIVE' : 'INACTIVE',
      e.assignedAssetsCount,
      e.assignedAssets.map((a) => a.assetCode).join('; '),
    ]);
    exportToCSV('EEC_Employees_Custody_Report', headers, rows);
  };

  const handleExportExcel = () => {
    const headers = [
      'Employee ID',
      'Full Name',
      'Email',
      'Role',
      'Job Title',
      'Department',
      'Status',
      'Assigned Assets Count',
      'Assigned Equipment Codes',
    ];
    const rows = employees.map((e) => [
      e.employeeId,
      e.fullName,
      e.email,
      e.role,
      e.jobTitle,
      e.department?.name || 'Unassigned',
      e.isActive ? 'ACTIVE' : 'INACTIVE',
      e.assignedAssetsCount,
      e.assignedAssets.map((a) => a.assetCode).join('; '),
    ]);
    exportToExcel('EEC_Employees_Custody_Report', 'Employee Custody', headers, rows);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Employee Custody' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Header & Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eec-primary tracking-tight">
            Employee Equipment Custody Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personnel holding enterprise IT and capital equipment with active allocation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="eec-btn-secondary flex items-center gap-1.5 text-xs py-2 px-3 bg-white"
            title="Export CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="eec-btn-secondary flex items-center gap-1.5 text-xs py-2 px-3 bg-white text-emerald-700 hover:text-emerald-800"
            title="Export Excel"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={printReport}
            className="eec-btn-secondary flex items-center gap-1.5 text-xs py-2 px-3 bg-white"
            title="Print Report"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ─── Summary Bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-eec-primary">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Corporation Personnel
            </p>
            <p className="text-2xl font-bold text-eec-text mt-1">{total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-eec-primary/10 text-eec-primary">
            <Users size={22} />
          </div>
        </div>

        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-eec-accent">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Equipment in Staff Custody
            </p>
            <p className="text-2xl font-bold text-eec-accent mt-1">{totalAssignedAssets}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-eec-accent/10 text-eec-accent">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────────── */}
      <div className="eec-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search employee ID, name, email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent text-slate-700"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="true">Active Personnel</option>
              <option value="false">Inactive Personnel</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Employees Table ─────────────────────────────────────────────────── */}
      <div className="eec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name & Email</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Custody Count</th>
                <th className="py-3 px-4">Assigned Assets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <EmptyState
                      icon={Users}
                      title="No Employees Found"
                      description="Try adjusting your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-eec-primary">
                      <Link href={`/employees/${emp.id}`} className="hover:underline">
                        {emp.employeeId}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{emp.fullName}</p>
                      <p className="text-[11px] text-slate-400">{emp.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{emp.jobTitle}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {emp.department?.name || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={emp.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                          emp.assignedAssetsCount > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {emp.assignedAssetsCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {emp.assignedAssets.length === 0 ? (
                        <span className="text-slate-400 italic text-[11px]">No items in custody</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {emp.assignedAssets.map((asset) => (
                            <Link
                              key={asset.id}
                              href={`/assets/${asset.id}`}
                              className="font-mono text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded transition-colors"
                              title={asset.name}
                            >
                              {asset.assetCode}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ──────────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {employees.length} of {total} employees (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
