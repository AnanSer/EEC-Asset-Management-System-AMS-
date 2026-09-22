'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import reportService, { MaintenanceReportItem } from '@/services/report.service';
import { exportToCSV, exportToExcel, printReport } from '@/src/utils/export';

export default function MaintenanceReportPage() {
  const [tickets, setTickets] = useState<MaintenanceReportItem[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');

  const fetchTickets = useCallback(() => {
    setLoading(true);
    reportService
      .getMaintenance({
        search,
        status,
        priority,
        page,
        limit: 15,
      })
      .then((res) => {
        setTickets(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages || 1);
        if (res.summary) {
          setTotalCost(res.summary.totalCost);
        }
      })
      .catch((err) => {
        console.error('Failed to load maintenance report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, status, priority, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleExportCSV = () => {
    const headers = [
      'Ticket Number',
      'Title',
      'Asset Code',
      'Asset Name',
      'Category',
      'Priority',
      'Status',
      'Cost',
      'Reported By',
      'Assigned Technician',
      'Date Created',
      'Date Completed',
    ];
    const rows = tickets.map((t) => [
      t.ticketNumber,
      t.title,
      t.asset?.assetCode || 'N/A',
      t.asset?.name || 'N/A',
      t.asset?.category || 'N/A',
      t.priority,
      t.status,
      t.cost !== null ? t.cost : 0,
      t.reportedBy,
      t.assignedTechnician,
      new Date(t.createdAt).toLocaleDateString(),
      t.completedDate ? new Date(t.completedDate).toLocaleDateString() : 'In Progress',
    ]);
    exportToCSV('EEC_Maintenance_Service_Report', headers, rows);
  };

  const handleExportExcel = () => {
    const headers = [
      'Ticket Number',
      'Title',
      'Asset Code',
      'Asset Name',
      'Category',
      'Priority',
      'Status',
      'Cost',
      'Reported By',
      'Assigned Technician',
      'Date Created',
      'Date Completed',
    ];
    const rows = tickets.map((t) => [
      t.ticketNumber,
      t.title,
      t.asset?.assetCode || 'N/A',
      t.asset?.name || 'N/A',
      t.asset?.category || 'N/A',
      t.priority,
      t.status,
      t.cost !== null ? t.cost : 0,
      t.reportedBy,
      t.assignedTechnician,
      new Date(t.createdAt).toLocaleDateString(),
      t.completedDate ? new Date(t.completedDate).toLocaleDateString() : 'In Progress',
    ]);
    exportToExcel('EEC_Maintenance_Service_Report', 'Maintenance Orders', headers, rows);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Maintenance & Service' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Header & Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eec-primary tracking-tight">
            Maintenance & Service Cost Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit history of repair requests, work order expenses, technician allocations, and resolution lifecycles.
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
        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Logged Service Tickets
            </p>
            <p className="text-2xl font-bold text-eec-text mt-1">{total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Wrench size={22} />
          </div>
        </div>

        <div className="eec-card flex items-center justify-between p-4 border-l-4 border-l-emerald-600">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Maintenance & Repair Expenditure
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign size={22} />
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
              placeholder="Search ticket #, title, technician..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent"
            />
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
              <option value="all">All Ticket Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="TESTING">Testing</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent text-slate-700"
            >
              <option value="all">All Priority Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Maintenance Table ───────────────────────────────────────────────── */}
      <div className="eec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Target Asset</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4">Logged Date</th>
                <th className="py-3 px-4">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <EmptyState
                      icon={Wrench}
                      title="No Maintenance Records Found"
                      description="Try adjusting your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-eec-primary">
                      <Link href={`/maintenance/${t.id}`} className="hover:underline">
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{t.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{t.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      {t.asset ? (
                        <div>
                          <p className="font-medium text-slate-700">{t.asset.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {t.asset.assetCode}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          t.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : t.priority === 'MEDIUM'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status.toLowerCase()} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {t.assignedTechnician}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {t.cost !== null ? `$${t.cost.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {t.completedDate ? (
                        new Date(t.completedDate).toLocaleDateString()
                      ) : (
                        <span className="text-amber-600 italic font-sans font-normal">Active</span>
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
              Showing {tickets.length} of {total} tickets (Page {page} of {totalPages})
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
