'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wrench, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import maintenanceService from '@/services/maintenance.service';
import {
  MaintenanceTicket,
  MaintenanceStats as StatsType,
  ISSUE_CATEGORY_LABELS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_PRIORITY_LABELS,
} from '@/constants/maintenance';
import MaintenanceStats from '@/components/maintenance/MaintenanceStats';
import MaintenanceTable from '@/components/maintenance/MaintenanceTable';
import { usePermissions } from '@/hooks/usePermissions';

export default function MaintenancePage() {
  const router = useRouter();
  const toast = useToast();
  const { isEmployee } = usePermissions();

  useEffect(() => {
    if (isEmployee) {
      router.replace('/my-maintenance');
    }
  }, [isEmployee, router]);

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [stats, setStats] = useState<StatsType>({
    openTickets: 0,
    inProgress: 0,
    testing: 0,
    completedThisMonth: 0,
    recentTickets: [],
  });

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await maintenanceService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await maintenanceService.getAll({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        page,
        limit: 10,
      });

      if (res.success) {
        setTickets(res.data);
        setMeta(res.meta);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Failed to fetch maintenance tickets';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, categoryFilter, page, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Maintenance & Quality Testing"
        description="Diagnose asset failures, assign technicians, track repair lifecycles, and record inspection benchmarks"
        action={{
          label: 'New Maintenance Ticket',
          href: '/maintenance/new',
          icon: Plus,
        }}
      />

      {/* KPI Stats */}
      <MaintenanceStats stats={stats} />

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="w-full md:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search ticket #, asset, technician..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
            >
              <option value="all">All Statuses</option>
              {Object.entries(MAINTENANCE_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
            >
              <option value="all">All Priorities</option>
              {Object.entries(MAINTENANCE_PRIORITY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
            >
              <option value="all">All Categories</option>
              {Object.entries(ISSUE_CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tickets Table / Loading / Empty */}
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={7} />
          </div>
        ) : tickets.length > 0 ? (
          <>
            <MaintenanceTable tickets={tickets} />

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing{' '}
                <strong className="text-slate-700">
                  {tickets.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-700">
                  {Math.min(meta.page * meta.limit, meta.total)}
                </strong>{' '}
                of <strong className="text-slate-700">{meta.total}</strong> tickets
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <span className="px-2 font-medium text-slate-700">
                  {meta.page} / {meta.totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Wrench}
              title="No Maintenance Tickets Found"
              description={
                hasActiveFilters
                  ? 'No maintenance tickets match the selected filters. Try clearing your query.'
                  : 'No maintenance or repair requests registered in the system.'
              }
              action={
                hasActiveFilters
                  ? {
                      label: 'Reset Filters',
                      onClick: handleResetFilters,
                    }
                  : {
                      label: 'Create First Ticket',
                      href: '/maintenance/new',
                    }
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
