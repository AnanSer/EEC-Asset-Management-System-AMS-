'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  UserCheck,
  Wrench,
  FlaskConical,
  Archive,
  MapPin,
  Layers,
  RefreshCw,
  Search,
  ArrowRight,
  Warehouse,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/authorization';
import { useCacheQuery } from '@/context/AppDataCacheContext';
import assetService from '@/services/asset.service';
import {
  AssetInventorySummary,
  AssetInventoryResponse,
  AssetCategoryInventory,
  AssetLocationInventory,
} from '@/constants/assets';

export default function StoreInventoryPage() {
  const { role, isLoading: isLoadingAuth } = usePermissions();
  const [categorySearch, setCategorySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'locations'>('categories');

  const canAccessInventory =
    role === ROLES.ADMIN ||
    role === ROLES.IT_TECHNICIAN ||
    role === ROLES.DEPARTMENT_MANAGER ||
    role === ROLES.STORE_KEEPER;

  const {
    data: rawData,
    isLoading: isLoadingData,
    isUpdating,
    refetch,
  } = useCacheQuery<AssetInventoryResponse | AssetInventorySummary | null>(
    'assets:inventory',
    async () => {
      const res = await assetService.getInventory(true);
      return res;
    },
    { enabled: canAccessInventory && !isLoadingAuth }
  );

  // Normalize summary data from full response or direct object
  const inventory: AssetInventorySummary | null = useMemo(() => {
    if (!rawData) return null;
    if ('data' in rawData && rawData.data) {
      return rawData.data as AssetInventorySummary;
    }
    return rawData as AssetInventorySummary;
  }, [rawData]);

  // Filtered categories
  const categoriesList: AssetCategoryInventory[] = useMemo(() => {
    if (!inventory?.byCategory) return [];
    const list = Object.values(inventory.byCategory);
    if (!categorySearch.trim()) return list;
    const term = categorySearch.toLowerCase();
    return list.filter(
      (c) =>
        c.categoryLabel.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }, [inventory, categorySearch]);

  // Filtered locations
  const locationsList: AssetLocationInventory[] = useMemo(() => {
    if (!inventory?.byLocation) return [];
    if (!locationSearch.trim()) return inventory.byLocation;
    const term = locationSearch.toLowerCase();
    return inventory.byLocation.filter((l) =>
      l.location.toLowerCase().includes(term)
    );
  }, [inventory, locationSearch]);

  if (isLoadingAuth) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!canAccessInventory) {
    return (
      <AccessDenied
        title="Inventory Custody Restricted"
        message="You do not have authorization to view physical store inventory counts. This section is reserved for Store Keepers, IT Technicians, and Department Managers."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Store Inventory & Physical Custody"
        description="Real-time counts calculated directly from active individual physical asset records"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Store', href: '/store/inventory' },
          { label: 'Inventory' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoadingData || isUpdating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  isUpdating ? 'animate-spin text-eec-primary' : ''
                }`}
              />
              <span>{isUpdating ? 'Updating...' : 'Refresh Inventory'}</span>
            </button>
            <Link
              href="/assets"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-eec-primary text-white text-xs font-semibold hover:bg-eec-primary/90 shadow-xs transition"
            >
              <Package className="w-3.5 h-3.5" />
              <span>View Individual Assets</span>
            </Link>
          </div>
        }
      />

      {/* ─── Summary KPI Cards ───────────────────────────────────────── */}
      {isLoadingData && !inventory ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Assets"
            value={inventory?.total ?? 0}
            icon={Package}
            accent="primary"
            subtitle="All active units"
          />
          <StatCard
            title="Available"
            value={inventory?.available ?? 0}
            icon={CheckCircle2}
            accent="success"
            subtitle="Ready in stock"
          />
          <StatCard
            title="Assigned"
            value={inventory?.assigned ?? 0}
            icon={UserCheck}
            accent="active"
            subtitle="With custodians"
          />
          <StatCard
            title="Maintenance"
            value={inventory?.maintenance ?? 0}
            icon={Wrench}
            accent="warning"
            subtitle="Under service"
          />
          <StatCard
            title="Testing"
            value={inventory?.testing ?? 0}
            icon={FlaskConical}
            accent="accent"
            subtitle="Inspection triage"
          />
          <StatCard
            title="Retired"
            value={inventory?.retired ?? 0}
            icon={Archive}
            accent="warning"
            subtitle="End of lifecycle"
          />
        </div>
      )}

      {/* ─── Breakdown View Tabs & Search ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'categories'
                  ? 'bg-white text-eec-primary shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Category Breakdown ({categoriesList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'locations'
                  ? 'bg-white text-eec-primary shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>Physical Locations ({locationsList.length})</span>
            </button>
          </div>

          {/* Search bar according to active tab */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activeTab === 'categories' ? categorySearch : locationSearch}
              onChange={(e) =>
                activeTab === 'categories'
                  ? setCategorySearch(e.target.value)
                  : setLocationSearch(e.target.value)
              }
              placeholder={
                activeTab === 'categories'
                  ? 'Search categories...'
                  : 'Search locations...'
              }
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary transition bg-white"
            />
          </div>
        </div>

        {/* ─── TAB 1: Category Breakdown Table ────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Category</th>
                  <th className="text-center px-4 py-3.5">Total</th>
                  <th className="text-center px-4 py-3.5 text-emerald-700">Available</th>
                  <th className="text-center px-4 py-3.5 text-blue-700">Assigned</th>
                  <th className="text-center px-4 py-3.5 text-amber-700">Maintenance</th>
                  <th className="text-center px-4 py-3.5 text-purple-700">Testing</th>
                  <th className="text-center px-4 py-3.5 text-slate-500">Retired</th>
                  <th className="text-left px-5 py-3.5">Stock Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoriesList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No categories found matching your query.
                    </td>
                  </tr>
                ) : (
                  categoriesList.map((cat) => {
                    const availPct =
                      cat.total > 0
                        ? Math.round((cat.available / cat.total) * 100)
                        : 0;

                    return (
                      <tr
                        key={cat.category}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-800">
                          <Link
                            href={`/assets?category=${cat.category}`}
                            className="hover:text-eec-primary transition flex items-center gap-2"
                          >
                            <span>{cat.categoryLabel}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-eec-primary" />
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                          {cat.total}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-emerald-700 bg-emerald-50/40">
                          {cat.available}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-blue-700">
                          {cat.assigned}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-amber-700">
                          {cat.maintenance}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-purple-700">
                          {cat.testing}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                          {cat.retired}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5 max-w-[200px]">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${availPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-medium text-slate-500 w-9 text-right">
                              {availPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 2: Physical Location Breakdown Table ───────────────── */}
        {activeTab === 'locations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Physical Location / Storage</th>
                  <th className="text-center px-4 py-3.5">Total Assets</th>
                  <th className="text-center px-4 py-3.5 text-emerald-700">Available</th>
                  <th className="text-center px-4 py-3.5 text-blue-700">Assigned</th>
                  <th className="text-center px-4 py-3.5 text-amber-700">Maintenance</th>
                  <th className="text-center px-4 py-3.5 text-purple-700">Testing</th>
                  <th className="text-center px-4 py-3.5 text-slate-500">Retired</th>
                  <th className="text-left px-5 py-3.5">Share of Total Assets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locationsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No locations found matching your query.
                    </td>
                  </tr>
                ) : (
                  locationsList.map((loc) => {
                    const totalInventory = inventory?.total || 1;
                    const sharePct = Math.round(
                      (loc.total / totalInventory) * 100
                    );

                    return (
                      <tr
                        key={loc.location}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-eec-primary shrink-0" />
                            <span className="font-semibold text-slate-800">
                              {loc.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                          {loc.total}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-emerald-700 bg-emerald-50/40">
                          {loc.available}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-blue-700">
                          {loc.assigned}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-amber-700">
                          {loc.maintenance}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-purple-700">
                          {loc.testing}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                          {loc.retired}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5 max-w-[200px]">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-eec-primary rounded-full transition-all duration-300"
                                style={{ width: `${sharePct}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-medium text-slate-500 w-9 text-right">
                              {sharePct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
