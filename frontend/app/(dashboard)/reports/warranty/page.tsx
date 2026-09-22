'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import reportService, { WarrantyReportItem } from '@/services/report.service';
import departmentService from '@/services/department.service';
import { exportToCSV, exportToExcel, printReport } from '@/src/utils/export';

export default function WarrantyCenterPage() {
  const [assets, setAssets] = useState<WarrantyReportItem[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [buckets, setBuckets] = useState({
    within30Days: 0,
    within60Days: 0,
    within90Days: 0,
    expired: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90' | 'expired' | 'all'>('all');
  const [departmentId, setDepartmentId] = useState('all');

  // Load department options
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

  const fetchWarranty = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = {
      search,
      timeframe,
      page,
      limit: 15,
    };
    if (departmentId !== 'all') params.departmentId = departmentId;

    reportService
      .getWarranty(params)
      .then((res) => {
        setAssets(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
        if (res.buckets) {
          setBuckets(res.buckets);
        }
      })
      .catch((err) => {
        console.error('Failed to load warranty report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, timeframe, departmentId, page]);

  useEffect(() => {
    fetchWarranty();
  }, [fetchWarranty]);

  const handleExportCSV = () => {
    const headers = [
      'Asset Code',
      'Asset Name',
      'Category',
      'Serial Number',
      'Department',
      'Warranty Expiry',
      'Days Remaining',
      'Warning Status',
    ];
    const rows = assets.map((a) => [
      a.assetCode,
      a.name,
      a.category,
      a.serialNumber,
      a.department?.name || 'Unassigned',
      a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A',
      a.daysRemaining !== null ? a.daysRemaining : 'N/A',
      a.urgency,
    ]);
    exportToCSV('EEC_Warranty_Center_Report', headers, rows);
  };

  const handleExportExcel = () => {
    const headers = [
      'Asset Code',
      'Asset Name',
      'Category',
      'Serial Number',
      'Department',
      'Warranty Expiry',
      'Days Remaining',
      'Warning Status',
    ];
    const rows = assets.map((a) => [
      a.assetCode,
      a.name,
      a.category,
      a.serialNumber,
      a.department?.name || 'Unassigned',
      a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A',
      a.daysRemaining !== null ? a.daysRemaining : 'N/A',
      a.urgency,
    ]);
    exportToExcel('EEC_Warranty_Center_Report', 'Warranty Center', headers, rows);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Warranty Center' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Header & Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eec-primary tracking-tight">
            Warranty Center & Risk Expiration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vendor warranty coverage alerts, proactive maintenance renewals, and SLA expiration tracking.
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

      {/* ─── Three Required Warranty Expiration Sections ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 1: Expiring within 30 days */}
        <div
          onClick={() => {
            setTimeframe('30');
            setPage(1);
          }}
          className={`eec-card p-4 border-l-4 border-l-rose-500 cursor-pointer transition-all hover:shadow-md ${
            timeframe === '30' ? 'ring-2 ring-rose-500/50 bg-rose-50/20' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full mb-2">
                <AlertCircle size={12} />
                Critical Expiration Alert
              </span>
              <h2 className="text-sm font-semibold text-slate-800">
                Expiring within 30 days
              </h2>
              <p className="text-3xl font-bold text-rose-700 mt-2 font-mono">
                {buckets.within30Days}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Urgent contract renewals or replacement required.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 flex-shrink-0">
              <ShieldAlert size={22} />
            </div>
          </div>
        </div>

        {/* Section 2: Expiring within 60 days */}
        <div
          onClick={() => {
            setTimeframe('60');
            setPage(1);
          }}
          className={`eec-card p-4 border-l-4 border-l-amber-500 cursor-pointer transition-all hover:shadow-md ${
            timeframe === '60' ? 'ring-2 ring-amber-500/50 bg-amber-50/20' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mb-2">
                <AlertTriangle size={12} />
                Moderate Warning
              </span>
              <h2 className="text-sm font-semibold text-slate-800">
                Expiring within 60 days
              </h2>
              <p className="text-3xl font-bold text-amber-700 mt-2 font-mono">
                {buckets.within60Days}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Initiate supplier review and renewal quotations.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Section 3: Expiring within 90 days */}
        <div
          onClick={() => {
            setTimeframe('90');
            setPage(1);
          }}
          className={`eec-card p-4 border-l-4 border-l-blue-600 cursor-pointer transition-all hover:shadow-md ${
            timeframe === '90' ? 'ring-2 ring-blue-600/50 bg-blue-50/20' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
                <ShieldCheck size={12} />
                Upcoming Notice
              </span>
              <h2 className="text-sm font-semibold text-slate-800">
                Expiring within 90 days
              </h2>
              <p className="text-3xl font-bold text-blue-700 mt-2 font-mono">
                {buckets.within90Days}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Quarterly budget & warranty planning window.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
              <Calendar size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────────── */}
      <div className="eec-card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Timeframe Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Warranties' },
              { id: '30', label: '≤ 30 Days' },
              { id: '60', label: '≤ 60 Days' },
              { id: '90', label: '≤ 90 Days' },
              { id: 'expired', label: 'Expired' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTimeframe(tab.id as any);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  timeframe === tab.id
                    ? 'bg-eec-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search code or asset..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent"
              />
            </div>

            {/* Department Filter */}
            <div className="w-40 sm:w-48">
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
          </div>
        </div>
      </div>

      {/* ─── Warranty Table ──────────────────────────────────────────────────── */}
      <div className="eec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Equipment Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Warranty Expiry</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4">Warning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <EmptyState
                      icon={ShieldCheck}
                      title="No Warranty Records Found"
                      description="No assets match the selected warranty timeframe or filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  let warningBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  let warningText = 'Active (Healthy)';

                  if (asset.urgency === 'EXPIRED') {
                    warningBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                    warningText = 'EXPIRED';
                  } else if (asset.urgency === 'CRITICAL_30') {
                    warningBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
                    warningText = 'Critical (< 30 Days)';
                  } else if (asset.urgency === 'MODERATE_60') {
                    warningBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
                    warningText = 'Warning (< 60 Days)';
                  } else if (asset.urgency === 'UPCOMING_90') {
                    warningBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
                    warningText = 'Upcoming (< 90 Days)';
                  }

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-eec-primary">
                        <Link href={`/assets/${asset.id}`} className="hover:underline">
                          {asset.assetCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{asset.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          SN: {asset.serialNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{asset.category}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {asset.department?.name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {asset.warrantyExpiry
                          ? new Date(asset.warrantyExpiry).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {asset.daysRemaining !== null ? (
                          asset.daysRemaining < 0 ? (
                            <span className="text-rose-600 font-semibold">
                              Expired ({Math.abs(asset.daysRemaining)}d ago)
                            </span>
                          ) : (
                            <span
                              className={`font-semibold ${
                                asset.daysRemaining <= 30
                                  ? 'text-rose-600'
                                  : asset.daysRemaining <= 60
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                              }`}
                            >
                              {asset.daysRemaining} days left
                            </span>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${warningBadgeClass}`}
                        >
                          {warningText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ──────────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {assets.length} of {total} warranty records (Page {page} of {totalPages})
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
