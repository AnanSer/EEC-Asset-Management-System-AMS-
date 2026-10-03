'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  Building2,
  Package,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS, ROLES } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import requestService from '@/services/request.service';
import { AssetRequest, RequestStatus } from '@/constants/requests';
import { ASSET_CATEGORY_LABELS, AssetCategory } from '@/constants/assets';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import FulfillHandoverModal from '@/components/requests/FulfillHandoverModal';

const CATEGORIES = Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[];

export default function StoreRequestsPage() {
  const toast = useToast();
  const { role } = usePermissions();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('APPROVED');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal state
  const [fulfillingRequest, setFulfillingRequest] = useState<AssetRequest | null>(null);

  const fetchRequests = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await requestService.getAll(
        {
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? (statusFilter as RequestStatus) : undefined,
          category: categoryFilter !== 'all' ? (categoryFilter as AssetCategory) : undefined,
          page,
          limit: 15,
        },
        forceRefresh
      );

      if (res.success) {
        setRequests(res.data);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total || 0);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch store handover requests';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const canFulfill = role === ROLES.STORE_KEEPER || role === ROLES.ADMIN;

  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const fulfilledCount = requests.filter((r) => r.status === 'FULFILLED').length;

  return (
    <PermissionGuard permission={PERMISSIONS.ASSET_REQUESTS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="Store Handover Requests"
          description="Approved asset requests awaiting physical inventory assignment and handover to recipients."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Inventory', href: '/store/inventory' },
            { label: 'Store Requests' },
          ]}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Ready for Handover"
            value={statusFilter === 'APPROVED' ? totalCount : approvedCount}
            icon={PackageCheck}
            accent="warning"
          />
          <StatCard
            title="Fulfilled Handovers"
            value={statusFilter === 'FULFILLED' ? totalCount : fulfilledCount}
            icon={CheckCircle2}
            accent="success"
          />
          <StatCard
            title="Total in View"
            value={totalCount}
            icon={Package}
            accent="primary"
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search request #, employee, dept..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {ASSET_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>

            {/* Status filter: default to APPROVED for store keepers */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700 font-medium"
            >
              <option value="APPROVED">Ready for Handover (Approved)</option>
              <option value="FULFILLED">Completed Handovers (Fulfilled)</option>
              <option value="all">All Store Requests</option>
            </select>

            <button
              onClick={() => fetchRequests(true)}
              title="Refresh requests"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading && requests.length === 0 ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon={PackageCheck}
                title="No handover requests found"
                description={
                  statusFilter === 'APPROVED'
                    ? 'There are currently no approved requests waiting for store handover.'
                    : 'No requests match your current filters.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Requested Category</th>
                    <th className="py-3 px-4">Approval Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Handover Result</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {requests.map((req) => {
                    const categoryLabel = ASSET_CATEGORY_LABELS[req.category] || req.category;
                    const requesterName = `${req.requester.firstName} ${req.requester.lastName}`;
                    const approvedDate = req.approvedAt
                      ? new Date(req.approvedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {req.requestNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {requesterName}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {req.requester.employeeId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {req.department?.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            {categoryLabel}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate" title={req.description}>
                            {req.description}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          <div>Approved on {approvedDate}</div>
                          {req.approvalRemarks && (
                            <p className="text-slate-500 italic max-w-xs truncate" title={req.approvalRemarks}>
                              "{req.approvalRemarks}"
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <RequestStatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {req.status === 'APPROVED' && (
                            <span className="text-blue-700 font-medium text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              Ready for unit selection
                            </span>
                          )}
                          {req.status === 'FULFILLED' && (
                            <div className="text-emerald-800 text-[11px]">
                              <span className="font-semibold">Assigned: {req.asset?.assetCode}</span>
                              <span className="text-slate-500 text-[10px] block truncate">
                                {req.asset?.name}
                              </span>
                              {req.handoverNotes && (
                                <span className="text-slate-400 text-[10px] italic block truncate">
                                  Notes: {req.handoverNotes}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {req.status === 'APPROVED' && canFulfill && (
                            <button
                              onClick={() => setFulfillingRequest(req)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 text-xs font-bold transition-all shadow-xs"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Fulfill Handover</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
              <span>
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fulfill Modal */}
        <FulfillHandoverModal
          request={fulfillingRequest}
          isOpen={!!fulfillingRequest}
          onClose={() => setFulfillingRequest(null)}
          onSuccess={() => fetchRequests(true)}
        />
      </div>
    </PermissionGuard>
  );
}
