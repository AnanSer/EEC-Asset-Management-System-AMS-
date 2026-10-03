'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  SendHorizontal,
  Plus,
  Search,
  ExternalLink,
  Ban,
  Clock,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';
import requestService from '@/services/request.service';
import { AssetRequest, RequestStatus } from '@/constants/requests';
import { ASSET_CATEGORY_LABELS } from '@/constants/assets';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import NewRequestModal from '@/components/requests/NewRequestModal';

export default function MyRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState<AssetRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchMyRequests = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await requestService.getMyRequests(
        {
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? (statusFilter as RequestStatus) : undefined,
          page,
          limit: 15,
        },
        forceRefresh
      );

      if (res.success) {
        setRequests(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch your asset requests';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleCancelConfirm = async () => {
    if (!cancellingRequest) return;
    try {
      setIsCancelling(true);
      await requestService.cancel(cancellingRequest.id);
      toast.info(`Request ${cancellingRequest.requestNumber} cancelled.`);
      setCancellingRequest(null);
      fetchMyRequests(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to cancel request';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ASSET_REQUESTS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="My Asset Requests"
          description="Request company hardware, track approval status, and prepare for physical store handover."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Requests' },
          ]}
          action={{
            label: 'New Asset Request',
            icon: Plus,
            onClick: () => setIsNewModalOpen(true),
          }}
        />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by request # or details..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700 w-full sm:w-48"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved (Awaiting Handover)</option>
              <option value="FULFILLED">Fulfilled (Assigned)</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              onClick={() => fetchMyRequests(true)}
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
                icon={SendHorizontal}
                title="No asset requests found"
                description={
                  statusFilter !== 'all' || search
                    ? 'No requests match your current filters.'
                    : 'You have not submitted any equipment requests yet.'
                }
                action={
                  <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-eec-primary hover:bg-eec-primary/90 rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Your First Request</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description / Justification</th>
                    <th className="py-3 px-4">Date Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Resolution / Handover</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {requests.map((req) => {
                    const categoryLabel = ASSET_CATEGORY_LABELS[req.category] || req.category;
                    const dateFormatted = new Date(req.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {req.requestNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-medium text-slate-800 line-clamp-1">{req.description}</p>
                          {req.notes && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-1">
                              Note: {req.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-4">
                          <RequestStatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {req.status === 'PENDING' && (
                            <span className="text-[11px] text-amber-700 flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              Awaiting admin review
                            </span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span className="text-[11px] text-blue-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              Ready for Store Keeper handover
                            </span>
                          )}
                          {req.status === 'FULFILLED' && (
                            <div className="text-[11px] text-emerald-800">
                              <div className="font-semibold flex items-center gap-1">
                                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                                {req.asset?.assetCode}
                              </div>
                              <span className="text-slate-500 text-[10px]">
                                {req.asset?.name}
                              </span>
                            </div>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="text-[11px] text-rose-700 block truncate" title={req.rejectionReason || ''}>
                              Reason: {req.rejectionReason || 'No reason provided'}
                            </span>
                          )}
                          {req.status === 'CANCELLED' && (
                            <span className="text-[11px] text-slate-400 italic">Cancelled by requester</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => setCancellingRequest(req)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold border border-rose-200 transition-colors"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          )}
                          {req.status === 'FULFILLED' && req.asset && (
                            <Link
                              href="/my-assets"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold border border-emerald-200 transition-colors"
                            >
                              <span>View Asset</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
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
                Page {page} of {totalPages}
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

        {/* Modals */}
        <NewRequestModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={() => fetchMyRequests(true)}
        />

        <ConfirmationModal
          isOpen={!!cancellingRequest}
          onClose={() => setCancellingRequest(null)}
          onConfirm={handleCancelConfirm}
          title="Cancel Asset Request"
          message={
            <span>
              Are you sure you want to cancel request{' '}
              <strong className="font-mono">{cancellingRequest?.requestNumber}</strong> for a{' '}
              {cancellingRequest && ASSET_CATEGORY_LABELS[cancellingRequest.category]}? This action cannot be undone.
            </span>
          }
          confirmLabel="Yes, Cancel Request"
          variant="danger"
          isLoading={isCancelling}
        />
      </div>
    </PermissionGuard>
  );
}
