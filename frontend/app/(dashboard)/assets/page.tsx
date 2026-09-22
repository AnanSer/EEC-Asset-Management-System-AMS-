'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton, { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import departmentService from '@/services/department.service';
import { Asset, AssetsResponse, ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/constants/assets';
import { Department } from '@/constants/departments';
import AssetStats from '@/components/assets/AssetStats';
import AssetTable from '@/components/assets/AssetTable';

const ASSET_STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED'] as const;
const ASSET_CATEGORIES = ['LAPTOP', 'DESKTOP', 'PRINTER', 'SCANNER', 'ROUTER', 'SWITCH', 'PROJECTOR', 'MONITOR', 'SERVER', 'UPS', 'OTHER'] as const;

export default function AssetsPage() {
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<AssetsResponse['meta']>({
    total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load departments for filter
  useEffect(() => {
    departmentService.getAll({ limit: 100 }).then((res) => {
      if (res.success) setDepartments(res.data);
    }).catch(() => {});
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await assetService.getAll({
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
        page,
        limit: 10,
      });
      if (res.success) {
        setAssets(res.data);
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to fetch assets';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, departmentFilter, page, toast]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setPage(1);
  };

  const isInitialLoad = loading && assets.length === 0 && !search && categoryFilter === 'all' && statusFilter === 'all' && departmentFilter === 'all';

  if (isInitialLoad) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assets"
          description="Manage EEC's IT and operational asset inventory."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assets' }]}
          action={{ label: 'Register Asset', href: '/assets/new', icon: Plus }}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Manage EEC's IT and operational asset inventory."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assets' }]}
        action={{ label: 'Register Asset', href: '/assets/new', icon: Plus }}
      />

      {/* Stats */}
      <AssetStats assets={assets} total={meta.total} />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="w-full lg:w-72">
          <SearchInput
            placeholder="Search by name, code, serial..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
          >
            <option value="all">All Categories</option>
            {ASSET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{ASSET_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-eec-accent/40"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', ...ASSET_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-white text-eec-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? 'All Status' : ASSET_STATUS_LABELS[s as keyof typeof ASSET_STATUS_LABELS]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : assets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Package}
              title="No assets found."
              description="No asset records match your search or filter criteria."
              action={{ label: 'Clear Filters', onClick: handleClearFilters }}
            />
          </div>
        ) : (
          <>
            <AssetTable assets={assets} />

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
                <span>
                  Page <strong className="text-slate-800">{meta.page}</strong> of{' '}
                  <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.total} total assets)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={!meta.hasPrevPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
