'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Laptop, Search, ExternalLink, Wrench, ShieldCheck, Calendar, Hash, RotateCcw, Clock, CheckCircle2, PackageCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import returnService from '@/services/return.service';
import { Asset, ASSET_STATUS_LABELS } from '@/constants/assets';
import AssetThumbnail from '@/components/assets/AssetThumbnail';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import RequestReturnModal from '@/components/returns/RequestReturnModal';

export default function MyAssetsPage() {
  const toast = useToast();
  const { can } = usePermissions();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [pendingReturnAssetIds, setPendingReturnAssetIds] = useState<Set<string>>(new Set());
  const [assetForReturn, setAssetForReturn] = useState<Asset | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchMyAssets = useCallback(async () => {
    try {
      setLoading(true);
      const [assetsRes, returnsRes] = await Promise.allSettled([
        assetService.getAll({
          personal: true,
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          limit: 50,
        }),
        returnService.getMyReturns({ status: 'PENDING' }),
      ]);

      if (assetsRes.status === 'fulfilled' && assetsRes.value.success) {
        setAssets(assetsRes.value.data);
      }

      if (returnsRes.status === 'fulfilled' && returnsRes.value.success) {
        const pendingIds = new Set<string>(
          (returnsRes.value.data || []).map((r: any) => r.assetId)
        );
        setPendingReturnAssetIds(pendingIds);
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to fetch your assigned assets';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    fetchMyAssets();
  }, [fetchMyAssets]);

  const assignedCount = assets.filter(
    (a) => (a.custodyStatus ? a.custodyStatus === 'ASSIGNED' : a.status === 'ASSIGNED')
  ).length;
  const returnedCount = assets.filter((a) => a.custodyStatus === 'RETURNED').length;

  const filteredAssets = assets.filter((asset) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'ASSIGNED') {
        const isAssigned = asset.custodyStatus
          ? asset.custodyStatus === 'ASSIGNED'
          : asset.status === 'ASSIGNED';
        if (!isAssigned) return false;
      } else if (statusFilter === 'RETURNED') {
        if (asset.custodyStatus !== 'RETURNED') return false;
      } else if (asset.status !== statusFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.assetCode.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        (asset.brand && asset.brand.toLowerCase().includes(q)) ||
        (asset.model && asset.model.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <PermissionGuard permission={PERMISSIONS.ASSETS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="My Assets"
          description="Company equipment and hardware assigned to your employee account or previously returned."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Assets' },
          ]}
        />

        {/* Filter bar & Quick Tabs */}
        <div className="space-y-3">
          {/* Quick Segment Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-eec-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All Equipment</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {assets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === 'ASSIGNED'
                  ? 'bg-eec-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Currently Assigned</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'ASSIGNED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {assignedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('RETURNED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === 'RETURNED'
                  ? 'bg-eec-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Returned to Store</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'RETURNED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {returnedCount}
              </span>
            </button>
          </div>

          {/* Search bar & Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code, model, serial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700 w-full sm:w-48"
              >
                <option value="all">All Equipment</option>
                <option value="ASSIGNED">Currently Assigned</option>
                <option value="RETURNED">Returned to Store</option>
                <option value="MAINTENANCE">In Maintenance</option>
                <option value="TESTING">In Testing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title={search || statusFilter !== 'all' ? 'No Matching Assets' : 'No Assets Found'}
            description={
              search || statusFilter !== 'all'
                ? 'No assets match your current search or filter criteria.'
                : 'You currently have no company equipment assigned or returned in your records.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssets.map((asset) => {
              const isWarrantyExpired = asset.warrantyExpiry
                ? new Date(asset.warrantyExpiry) < new Date()
                : false;
              const isReturned = asset.custodyStatus === 'RETURNED';

              return (
                <div
                  key={asset.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                    isReturned
                      ? 'bg-slate-50/70 border-slate-200/90 saturate-[0.6] opacity-80 hover:opacity-100 hover:saturate-100 shadow-none'
                      : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Top Archived Ribbon for Returned Assets */}
                  {isReturned && (
                    <div className="bg-slate-100/90 border-b border-slate-200/70 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
                        Past Assignment · Released
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded font-bold">
                        Returned
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Header info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 transition-transform duration-200 ${
                        isReturned
                          ? 'bg-slate-100 border border-slate-200 opacity-70'
                          : 'bg-slate-50 border border-slate-100 group-hover:scale-105'
                      }`}>
                        <AssetThumbnail category={asset.category} size="md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                            isReturned
                              ? 'text-slate-600 bg-slate-200/70'
                              : 'text-eec-primary bg-eec-primary/5'
                          }`}>
                            {asset.assetCode}
                          </span>
                          {isReturned ? (
                            <span className="inline-flex items-center gap-1 font-medium text-xs px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 border border-slate-300/80">
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                              Returned
                            </span>
                          ) : (
                            <StatusBadge status={asset.status} />
                          )}
                        </div>
                        <h3 className={`font-bold text-base leading-snug truncate ${
                          isReturned ? 'text-slate-700' : 'text-slate-900'
                        }`} title={asset.name}>
                          {asset.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {asset.brand ? `${asset.brand} ` : ''}{asset.model || ''}
                        </p>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          Serial Number:
                        </span>
                        <span className="font-mono font-medium text-slate-700">{asset.serialNumber}</span>
                      </div>

                      {asset.warrantyExpiry && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                            Warranty:
                          </span>
                          <span
                            className={`font-medium ${
                              isWarrantyExpired ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {isWarrantyExpired ? 'Expired' : 'Active'} (
                            {new Date(asset.warrantyExpiry).toLocaleDateString()})
                          </span>
                        </div>
                      )}

                      {/* Assignment metadata for active vs returned */}
                      {isReturned ? (
                        <>
                          {asset.returnedAssignment?.returnedDate && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                                Returned On:
                              </span>
                              <span className="font-semibold text-slate-700">
                                {new Date(asset.returnedAssignment.returnedDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {asset.returnedAssignment?.conditionOnReturn && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-slate-500">
                                Return Condition:
                              </span>
                              <span className="font-medium text-slate-700 capitalize">
                                {asset.returnedAssignment.conditionOnReturn.toLowerCase()}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        asset.currentAssignment?.assignedDate && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Assigned Since:
                            </span>
                            <span className="font-medium text-slate-700">
                              {new Date(asset.currentAssignment.assignedDate).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="bg-slate-50/70 border-t border-slate-100 p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isReturned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          In Company Store
                        </span>
                      ) : (
                        <>
                          <Link
                            href={`/maintenance/new?assetId=${asset.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            <Wrench className="w-3.5 h-3.5 text-amber-600" />
                            Report Issue
                          </Link>

                          {asset.status === 'ASSIGNED' && can(PERMISSIONS.ASSET_RETURNS_CREATE) && (
                            pendingReturnAssetIds.has(asset.id) ? (
                              <span
                                title="Return request submitted; awaiting Store Keeper physical inspection"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Return Requested
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssetForReturn(asset);
                                  setIsReturnModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-eec-primary transition-colors shadow-2xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-eec-primary" />
                                Request Return
                              </button>
                            )
                          )}
                        </>
                      )}
                    </div>

                    <Link
                      href={`/assets/${asset.id}${isReturned ? '?from=my-assets&status=RETURNED' : ''}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                        isReturned
                          ? 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-none'
                          : 'text-white bg-eec-primary hover:bg-eec-primary/90'
                      }`}
                    >
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Request Return Modal */}
        <RequestReturnModal
          asset={assetForReturn}
          isOpen={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            setAssetForReturn(null);
          }}
          onSuccess={() => {
            fetchMyAssets();
          }}
        />
      </div>
    </PermissionGuard>
  );
}
