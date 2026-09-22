'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import reportService, { AssetReportItem } from '@/services/report.service';
import { exportToCSV, exportToExcel, printReport } from '@/src/utils/export';

export default function AssetsReportPage() {
  const [assets, setAssets] = useState<AssetReportItem[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [condition, setCondition] = useState('all');

  const fetchAssets = useCallback(() => {
    setLoading(true);
    reportService
      .getAssets({
        search,
        category,
        status,
        condition,
        page,
        limit: 15,
      })
      .then((res) => {
        setAssets(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
        if (res.summary) {
          setTotalValue(res.summary.totalValue);
        }
      })
      .catch((err) => {
        console.error('Failed to load asset report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, category, status, condition, page]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleExportCSV = () => {
    const headers = [
      'Asset Code',
      'Asset Name',
      'Category',
      'Serial Number',
      'Status',
      'Condition',
      'Department',
      'Assigned Employee',
      'Purchase Date',
      'Purchase Price',
      'Warranty Expiry',
    ];
    const rows = assets.map((a) => [
      a.assetCode,
      a.name,
      a.category,
      a.serialNumber,
      a.status,
      a.condition,
      a.department?.name || 'Unassigned',
      a.assignedTo?.fullName || 'Not Assigned',
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A',
      a.purchasePrice !== null ? a.purchasePrice : 'N/A',
      a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A',
    ]);
    exportToCSV('EEC_Assets_Report', headers, rows);
  };

  const handleExportExcel = () => {
    const headers = [
      'Asset Code',
      'Asset Name',
      'Category',
      'Serial Number',
      'Status',
      'Condition',
      'Department',
      'Assigned Employee',
      'Purchase Date',
      'Purchase Price',
      'Warranty Expiry',
    ];
    const rows = assets.map((a) => [
      a.assetCode,
      a.name,
      a.category,
      a.serialNumber,
      a.status,
      a.condition,
      a.department?.name || 'Unassigned',
      a.assignedTo?.fullName || 'Not Assigned',
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A',
      a.purchasePrice !== null ? a.purchasePrice : 'N/A',
      a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A',
    ]);
    exportToExcel('EEC_Assets_Report', 'Assets Inventory', headers, rows);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Asset Inventory' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Header & Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eec-primary tracking-tight">
            Asset Inventory Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete inventory valuation, lifecycle state, custody, and warranty records.
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
              Total Assets in Inventory
            </p>
            <p className="text-2xl font-bold text-eec-text mt-1">{total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-eec-primary/10 text-eec-primary">
            <Package size={22} />
          </div>
        </div>

        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cumulative Inventory Valuation
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────────── */}
      <div className="eec-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
              placeholder="Search code, name, serial..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="PRINTER">Printer</option>
              <option value="SCANNER">Scanner</option>
              <option value="ROUTER">Router</option>
              <option value="SWITCH">Switch</option>
              <option value="PROJECTOR">Projector</option>
              <option value="MONITOR">Monitor</option>
              <option value="SERVER">Server</option>
              <option value="UPS">UPS</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="TESTING">Testing</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent text-slate-700"
            >
              <option value="all">All Conditions</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="NEEDS_REPAIR">Needs Repair</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Assets Table ────────────────────────────────────────────────────── */}
      <div className="eec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Name & Specs</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4">Warranty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <EmptyState
                      icon={Package}
                      title="No Assets Match Criteria"
                      description="Try adjusting your search keywords or filter settings."
                    />
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
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
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {asset.category}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={asset.status.toLowerCase()} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={asset.condition.toLowerCase()} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {asset.department?.name || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {asset.assignedTo ? (
                        <span className="font-medium text-blue-700">
                          {asset.assignedTo.fullName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {asset.purchasePrice !== null
                        ? `$${asset.purchasePrice.toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {asset.warrantyExpiry
                        ? new Date(asset.warrantyExpiry).toLocaleDateString()
                        : '—'}
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
              Showing {assets.length} of {total} assets (Page {page} of {totalPages})
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
