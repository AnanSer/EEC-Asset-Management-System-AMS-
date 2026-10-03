'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Search,
  PackageCheck,
  Clock,
  RefreshCw,
  User,
  Building2,
  Package,
  Plus,
  Hash,
  MapPin,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS, ROLES } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import returnService from '@/services/return.service';
import { AssetReturnRequest, ReturnRequestStatus } from '@/constants/returns';
import { ASSET_CATEGORY_LABELS, ASSET_CONDITION_LABELS } from '@/constants/assets';
import ReturnStatusBadge from '@/components/returns/ReturnStatusBadge';
import ReceiveReturnModal from '@/components/returns/ReceiveReturnModal';
import WalkInReturnModal from '@/components/returns/WalkInReturnModal';
import ReturnRequestDetailsModal from '@/components/returns/ReturnRequestDetailsModal';

export default function StoreReturnsPage() {
  const toast = useToast();
  const { role, can } = usePermissions();
  const [returns, setReturns] = useState<AssetReturnRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<AssetReturnRequest | null>(null);
  const [selectedRequestForReceipt, setSelectedRequestForReceipt] = useState<AssetReturnRequest | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  const fetchReturns = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        const res = await returnService.getAll(
          {
            search: search.trim() || undefined,
            status: statusFilter !== 'all' ? (statusFilter as ReturnRequestStatus) : undefined,
            page,
            limit: 15,
          },
          forceRefresh
        );

        if (res.success) {
          setReturns(res.data);
          setTotalPages(res.meta?.totalPages || 1);
          setTotalCount(res.meta?.total || 0);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to fetch asset return requests';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, page, toast]
  );

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const canReceive = can(PERMISSIONS.ASSET_RETURNS_RECEIVE) || role === ROLES.STORE_KEEPER;

  const pendingCount = returns.filter((r) => r.status === 'PENDING').length;
  const receivedCount = returns.filter((r) => r.status === 'RECEIVED').length;

  return (
    <PermissionGuard permission={PERMISSIONS.ASSET_RETURNS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="Store Asset Returns"
          description="Inspect and physically receive equipment returned by employees, or process direct walk-in returns."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Store', href: '/store/inventory' },
            { label: 'Returns' },
          ]}
          action={
            canReceive
              ? {
                  label: 'Receive Walk-in Return',
                  icon: Plus,
                  onClick: () => setIsWalkInModalOpen(true),
                }
              : undefined
          }
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Pending Physical Return"
            value={statusFilter === 'PENDING' ? totalCount : pendingCount}
            icon={Clock}
            accent="warning"
            subtitle="Awaiting Store Keeper inspection"
          />
          <StatCard
            title="Received & In Stock"
            value={statusFilter === 'RECEIVED' ? totalCount : receivedCount}
            icon={CheckCircle2}
            accent="success"
            subtitle="Returned to Available status"
          />
          <StatCard
            title="Total Return Requests"
            value={totalCount}
            icon={RotateCcw}
            accent="primary"
            subtitle="All historical return requests"
          />
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by asset, serial, requester, code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
              />
            </div>

            {/* Filter and Refresh */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700"
                >
                  <option value="PENDING">Pending Receipts</option>
                  <option value="RECEIVED">Received into Store</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="all">All Statuses</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => fetchReturns(true)}
                title="Refresh Queue"
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-eec-primary' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : returns.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              statusFilter === 'PENDING'
                ? 'No Pending Returns'
                : 'No Return Requests Found'
            }
            description={
              statusFilter === 'PENDING'
                ? 'There are currently no return requests waiting for Store Keeper physical receipt.'
                : 'No return requests match your search or filter parameters.'
            }
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Asset Details</th>
                    <th className="py-3 px-4">Current Holder & Department</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Requested Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returns.map((req) => {
                    const requesterName = req.requester
                      ? `${req.requester.firstName} ${req.requester.lastName}`
                      : 'Unknown Employee';

                    const receiverName = req.receivedBy?.employeeProfile
                      ? `${req.receivedBy.employeeProfile.firstName} ${req.receivedBy.employeeProfile.lastName}`
                      : req.receivedBy?.email || 'Store Keeper';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Request Number */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          <button
                            type="button"
                            onClick={() => setSelectedRequestForDetails(req)}
                            className="font-mono font-bold text-slate-800 hover:text-eec-primary hover:underline text-left inline-flex items-center gap-1 focus:outline-none"
                            title="View Return Request Ticket Details"
                          >
                            <span>{req.requestNumber}</span>
                          </button>
                        </td>

                        {/* Asset Details */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/assets/${req.assetId}`}
                                className="font-mono font-bold text-eec-primary hover:text-eec-primary/80 hover:underline transition-colors"
                                title="View Asset Details"
                              >
                                {req.asset.assetCode}
                              </Link>
                              <span className="text-slate-400">•</span>
                              <Link
                                href={`/assets/${req.assetId}`}
                                className="font-semibold text-slate-800 hover:text-eec-primary hover:underline transition-colors truncate max-w-[200px]"
                                title="View Asset Details"
                              >
                                {req.asset.name}
                              </Link>
                            </div>
                            <span className="text-slate-500 text-2xs mt-0.5">
                              {ASSET_CATEGORY_LABELS[req.asset.category] || req.asset.category} • SN: {req.asset.serialNumber}
                            </span>
                          </div>
                        </td>

                        {/* Current Holder */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {requesterName}
                            </span>
                            <span className="text-slate-500 text-2xs flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {req.department.name}
                            </span>
                          </div>
                        </td>

                        {/* Reason / Notes */}
                        <td className="py-3 px-4 max-w-[220px]">
                          <p className="text-slate-700 truncate font-medium" title={req.reason}>
                            {req.reason}
                          </p>
                          {req.notes && (
                            <p className="text-slate-400 text-2xs truncate mt-0.5" title={req.notes}>
                              Notes: {req.notes}
                            </p>
                          )}
                        </td>

                        {/* Requested Date */}
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(req.requestedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <ReturnStatusBadge status={req.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRequestForDetails(req)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="View complete return request details"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Details</span>
                            </button>
                            {req.status === 'PENDING' && canReceive ? (
                              <button
                                type="button"
                                onClick={() => setSelectedRequestForReceipt(req)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                Receive Asset
                              </button>
                            ) : req.status === 'RECEIVED' ? (
                              <div className="text-right">
                                <span className="text-2xs text-emerald-700 font-semibold block">
                                  Received {req.receivedAt ? new Date(req.receivedAt).toLocaleDateString() : ''}
                                </span>
                                <span className="text-2xs text-slate-400 block truncate max-w-[140px]">
                                  by {receiverName} ({req.returnLocation || 'Store'})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-2xs italic">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                <span>
                  Page {page} of {totalPages} ({totalCount} total)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Return Request Details */}
        <ReturnRequestDetailsModal
          request={selectedRequestForDetails}
          isOpen={Boolean(selectedRequestForDetails)}
          onClose={() => setSelectedRequestForDetails(null)}
          canReceive={canReceive}
          onReceiveAndInspect={(req) => {
            setSelectedRequestForDetails(null);
            setSelectedRequestForReceipt(req);
          }}
        />

        {/* Modal: Store Keeper Receive & Inspect */}
        <ReceiveReturnModal
          request={selectedRequestForReceipt}
          isOpen={Boolean(selectedRequestForReceipt)}
          onClose={() => setSelectedRequestForReceipt(null)}
          onSuccess={() => {
            fetchReturns(true);
          }}
        />

        {/* Modal: Direct Walk-in Return */}
        <WalkInReturnModal
          isOpen={isWalkInModalOpen}
          onClose={() => setIsWalkInModalOpen(false)}
          onSuccess={() => {
            fetchReturns(true);
          }}
        />
      </div>
    </PermissionGuard>
  );
}
