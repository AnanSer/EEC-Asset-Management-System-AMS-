'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Laptop, Search, ExternalLink, Wrench, ShieldCheck, Calendar, Hash } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import assetService from '@/services/asset.service';
import { Asset, ASSET_STATUS_LABELS } from '@/constants/assets';
import AssetThumbnail from '@/components/assets/AssetThumbnail';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

export default function MyAssetsPage() {
  const toast = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchMyAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await assetService.getAll({
        personal: true,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
      });
      if (res.success) {
        setAssets(res.data);
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

  const filteredAssets = assets.filter((asset) => {
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
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
          title="My Assigned Assets"
          description="Company equipment and hardware assigned to your employee account."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Assets' },
          ]}
        />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700 w-full sm:w-44"
            >
              <option value="all">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="MAINTENANCE">In Maintenance</option>
              <option value="TESTING">In Testing</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title={search || statusFilter !== 'all' ? 'No Matching Assets' : 'No Assets Assigned'}
            description={
              search || statusFilter !== 'all'
                ? 'No assigned assets match your current search or filter criteria.'
                : 'You currently have no company equipment or hardware assets assigned to your profile.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssets.map((asset) => {
              const isWarrantyExpired = asset.warrantyExpiry
                ? new Date(asset.warrantyExpiry) < new Date()
                : false;

              return (
                <div
                  key={asset.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Header info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <AssetThumbnail category={asset.category} size="md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-eec-primary bg-eec-primary/5 px-2 py-0.5 rounded">
                            {asset.assetCode}
                          </span>
                          <StatusBadge status={asset.status} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug truncate" title={asset.name}>
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

                      {asset.currentAssignment?.assignedDate && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Assigned Since:
                          </span>
                          <span className="font-medium text-slate-700">
                            {new Date(asset.currentAssignment.assignedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="bg-slate-50/70 border-t border-slate-100 p-3 flex items-center justify-between gap-2">
                    <Link
                      href={`/maintenance/new?assetId=${asset.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      Report Issue
                    </Link>

                    <Link
                      href={`/assets/${asset.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-eec-primary hover:bg-eec-primary/90 transition-colors shadow-2xs"
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
      </div>
    </PermissionGuard>
  );
}
