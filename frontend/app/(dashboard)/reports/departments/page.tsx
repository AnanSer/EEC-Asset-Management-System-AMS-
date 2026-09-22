'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import reportService, { DepartmentReportItem } from '@/services/report.service';
import { exportToCSV, exportToExcel, printReport } from '@/src/utils/export';

export default function DepartmentsReportPage() {
  const [departments, setDepartments] = useState<DepartmentReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('all');

  const fetchDepartments = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = {
      search,
      page,
      limit: 15,
    };
    if (isActive === 'true') params.isActive = 'true';
    if (isActive === 'false') params.isActive = 'false';

    reportService
      .getDepartments(params)
      .then((res) => {
        setDepartments(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((err) => {
        console.error('Failed to load department report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, isActive, page]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const totalAssetsAcrossDepts = departments.reduce((sum, d) => sum + d.totalAssets, 0);

  const handleExportCSV = () => {
    const headers = [
      'Department Code',
      'Department Name',
      'Location',
      'Head of Department',
      'Status',
      'Staff Count',
      'Total Assets',
      'Assigned',
      'Available',
      'In Maintenance',
      'Under Testing',
    ];
    const rows = departments.map((d) => [
      d.code,
      d.name,
      d.location,
      d.headOfDepartment,
      d.isActive ? 'ACTIVE' : 'INACTIVE',
      d.employeeCount,
      d.totalAssets,
      d.assignedAssets,
      d.availableAssets,
      d.maintenanceAssets,
      d.testingAssets,
    ]);
    exportToCSV('EEC_Departments_Report', headers, rows);
  };

  const handleExportExcel = () => {
    const headers = [
      'Department Code',
      'Department Name',
      'Location',
      'Head of Department',
      'Status',
      'Staff Count',
      'Total Assets',
      'Assigned',
      'Available',
      'In Maintenance',
      'Under Testing',
    ];
    const rows = departments.map((d) => [
      d.code,
      d.name,
      d.location,
      d.headOfDepartment,
      d.isActive ? 'ACTIVE' : 'INACTIVE',
      d.employeeCount,
      d.totalAssets,
      d.assignedAssets,
      d.availableAssets,
      d.maintenanceAssets,
      d.testingAssets,
    ]);
    exportToExcel('EEC_Departments_Report', 'Department Allocation', headers, rows);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Department Allocation' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Header & Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eec-primary tracking-tight">
            Department Asset Allocation Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Directorate breakdown of physical equipment assets, operational states, and assigned personnel.
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
        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-purple-600">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Active Directorates & Sectors
            </p>
            <p className="text-2xl font-bold text-eec-text mt-1">{total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Building2 size={22} />
          </div>
        </div>

        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-blue-600">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Assets Distributed Across Sectors
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{totalAssetsAcrossDepts}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────────── */}
      <div className="eec-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              placeholder="Search code or department name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent"
            />
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
              <option value="all">All Operational Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Departments Table ───────────────────────────────────────────────── */}
      <div className="eec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Head of Directorate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Staff</th>
                <th className="py-3 px-4 text-center">Total Assets</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-center">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <EmptyState
                      icon={Building2}
                      title="No Departments Found"
                      description="Try adjusting your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-eec-primary">
                      <Link href={`/departments/${dept.id}`} className="hover:underline">
                        {dept.code}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{dept.name}</p>
                      <p className="text-[11px] text-slate-400">{dept.location}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{dept.headOfDepartment}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={dept.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {dept.employeeCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-eec-primary">
                      {dept.totalAssets}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {dept.assignedAssets}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {dept.availableAssets}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                        {dept.maintenanceAssets}
                      </span>
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
              Showing {departments.length} of {total} departments (Page {page} of {totalPages})
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
