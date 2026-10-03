'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Warehouse,
  PackageCheck,
  ClipboardList,
  Clock,
  RotateCcw,
  RefreshCw,
  Plus,
  ArrowRight,
  Package,
  Boxes,
  SendHorizontal,
  ArrowRightLeft,
  MapPin,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Store,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/loading';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS, ROLES } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import storeService from '@/services/store.service';
import { StoreDashboardData, StoreActivityItem, StoreActivityType } from '@/constants/store';
import WalkInReturnModal from '@/components/returns/WalkInReturnModal';

export default function StoreDashboardPage() {
  const toast = useToast();
  const { role, can } = usePermissions();
  const [data, setData] = useState<StoreDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  const fetchDashboard = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!data) setLoading(true);
        else setIsUpdating(true);

        const res = await storeService.getDashboard(forceRefresh);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to fetch store dashboard';
        toast.error(msg);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    },
    [data, toast]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const canReceive = can(PERMISSIONS.ASSET_RETURNS_RECEIVE) || role === ROLES.STORE_KEEPER;

  const filteredActivity = useMemo(() => {
    if (!data?.recentActivity) return [];
    if (activityFilter === 'ALL') return data.recentActivity;
    return data.recentActivity.filter((item) => item.type === activityFilter);
  }, [data?.recentActivity, activityFilter]);

  const getActivityBadge = (type: StoreActivityType) => {
    switch (type) {
      case 'HANDOVER':
      case 'ASSIGNMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PackageCheck className="w-3.5 h-3.5" />
            Handover
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Returned
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transferred
          </span>
        );
      case 'LOCATION_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <MapPin className="w-3.5 h-3.5" />
            Location
          </span>
        );
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Store Operations Dashboard"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Store Operations' },
          ]}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  const kpis = data?.kpis || {
    availableAssets: 0,
    assignedAssets: 0,
    pendingHandovers: 0,
    pendingReturns: 0,
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ASSETS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="Store Operations Dashboard"
          description="Physical asset custody, storage allocation, pending handovers, and return intake."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Store Operations' },
          ]}
          isUpdating={isUpdating}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                title="Refresh Store Overview"
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors bg-white shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin text-eec-primary' : ''}`} />
              </button>
              {canReceive && (
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-eec-primary hover:bg-eec-primary/90 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Receive Walk-in Return
                </button>
              )}
            </div>
          }
        />

        {/* ── 1. Store KPI Cards ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Store Custody & Workflow Metrics
            </h3>
            <span className="text-2xs text-slate-400 font-medium">Real-time database counts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <Link href="/store/inventory" className="block transition-transform hover:-translate-y-0.5">
              <StatCard
                title="Available Assets"
                value={kpis.availableAssets}
                icon={PackageCheck}
                accent="success"
                subtitle="Ready in stock for employee handover"
              />
            </Link>

            <Link href="/assets?status=ASSIGNED" className="block transition-transform hover:-translate-y-0.5">
              <StatCard
                title="Assigned Assets"
                value={kpis.assignedAssets}
                icon={ClipboardList}
                accent="primary"
                subtitle="Deployed with corporate staff"
              />
            </Link>

            <Link href="/store/requests" className="block transition-transform hover:-translate-y-0.5">
              <StatCard
                title="Pending Handovers"
                value={kpis.pendingHandovers}
                icon={SendHorizontal}
                accent="warning"
                subtitle="Approved requests ready for pickup"
              />
            </Link>

            <Link href="/store/returns" className="block transition-transform hover:-translate-y-0.5">
              <StatCard
                title="Pending Return Requests"
                value={kpis.pendingReturns}
                icon={RotateCcw}
                accent="warning"
                subtitle="Awaiting store physical inspection"
              />
            </Link>
          </div>
        </div>

        {/* ── 2. Store Quick Actions ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-eec-primary" />
              Store Quick Actions
            </h3>
            <span className="text-2xs text-slate-400">Direct operational shortcuts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Action 1: Inventory */}
            <Link
              href="/store/inventory"
              className="p-4 rounded-xl border border-slate-200 hover:border-eec-primary/40 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                  <Warehouse className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-eec-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-eec-primary transition-colors">
                  Inventory Overview
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  View full stock, category breakdowns, and physical storage locations.
                </p>
              </div>
            </Link>

            {/* Quick Action 2: Store Requests */}
            <Link
              href="/store/requests"
              className="p-4 rounded-xl border border-slate-200 hover:border-eec-primary/40 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-eec-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-eec-primary transition-colors">
                  Assignment Requests
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Pick equipment and confirm physical handover for approved requests.
                </p>
              </div>
            </Link>

            {/* Quick Action 3: Returns Queue */}
            <Link
              href="/store/returns"
              className="p-4 rounded-xl border border-slate-200 hover:border-eec-primary/40 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-eec-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-eec-primary transition-colors">
                  Returns Queue
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect returned equipment and restore units back to available status.
                </p>
              </div>
            </Link>

            {/* Quick Action 4: Walk-in Direct Return */}
            {canReceive ? (
              <button
                type="button"
                onClick={() => setIsWalkInModalOpen(true)}
                className="p-4 rounded-xl border border-slate-200 hover:border-eec-primary/40 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group flex flex-col justify-between text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-eec-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-eec-primary transition-colors">
                    Walk-in Return
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Receive unrequested physical returns directly over the counter.
                  </p>
                </div>
              </button>
            ) : (
              <Link
                href="/assets"
                className="p-4 rounded-xl border border-slate-200 hover:border-eec-primary/40 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-eec-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-eec-primary transition-colors">
                    Asset Directory
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Search and inspect company hardware and equipment records.
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* ── 3. Recent Store Activity Feed ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-eec-accent" />
                Recent Store Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest equipment handovers, custody receipts, and warehouse physical movements.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
              {['ALL', 'HANDOVER', 'RETURN', 'TRANSFER'].map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setActivityFilter(filterKey)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activityFilter === filterKey
                      ? 'bg-white text-eec-primary shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? 'All Activity'
                    : filterKey === 'HANDOVER'
                    ? 'Handovers'
                    : filterKey === 'RETURN'
                    ? 'Returns'
                    : 'Transfers'}
                </button>
              ))}
            </div>
          </div>

          {filteredActivity.length === 0 ? (
            <div className="p-10 text-center">
              <EmptyState
                icon={Boxes}
                title="No Store Activity Recorded"
                description={
                  activityFilter === 'ALL'
                    ? 'No physical store handovers or returns have taken place yet.'
                    : `No ${activityFilter.toLowerCase()} events found in recent store activity.`
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredActivity.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">{getActivityBadge(item.type)}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/assets/${item.assetId}`}
                          className="font-mono text-xs font-bold text-eec-primary hover:underline bg-eec-primary/5 px-2 py-0.5 rounded"
                        >
                          {item.assetCode}
                        </Link>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.assetName}
                        </span>
                        <span className="text-slate-400 text-2xs">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.employeeName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {item.departmentName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.location}
                        </span>
                      </div>

                      {item.details && (
                        <p className="text-xs text-slate-600 mt-1 italic leading-relaxed">
                          &ldquo;{item.details}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata: Date and Actor */}
                  <div className="text-right sm:shrink-0 text-xs">
                    <div className="flex items-center sm:justify-end gap-1 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="text-2xs text-slate-500 mt-0.5 block">
                      Handled by: <strong className="text-slate-700">{item.actorName}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Direct Walk-in Return */}
        <WalkInReturnModal
          isOpen={isWalkInModalOpen}
          onClose={() => setIsWalkInModalOpen(false)}
          onSuccess={() => {
            fetchDashboard(true);
          }}
        />
      </div>
    </PermissionGuard>
  );
}
