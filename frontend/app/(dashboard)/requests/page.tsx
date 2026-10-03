'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  RefreshCw,
  Inbox,
  User,
  Building2,
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
import ApproveRequestModal from '@/components/requests/ApproveRequestModal';
import RejectRequestModal from '@/components/requests/RejectRequestModal';

const CATEGORIES = Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[];

export default function RequestsPage() {
  const toast = useToast();
  const { role } = usePermissions();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [approvingRequest, setApprovingRequest] = useState<AssetRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<AssetRequest | null>(null);

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
      const msg = err?.response?.data?.message || 'Failed to fetch asset requests';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Derived counts from current requests list for quick dashboard cards
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const fulfilledCount = requests.filter((r) => r.status === 'FULFILLED').length;

  const canApproveOrReject = role === ROLES.ADMIN;

  return (
    <PermissionGuard permission={PERMISSIONS.ASSET_REQUESTS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="Asset Requests"
          description="Review employee equipment requests, authorize approvals, or reject with feedback."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Asset Requests' },
          ]}
        />

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Requests"
            value={totalCount}
            icon={Inbox}
            accent="accent"
          />
          <StatCard
            title="Pending Review"
            value={pendingCount}
            icon={Clock}
            accent="warning"
          />
          <StatCard
            title="Approved (Awaiting Store)"
            value={approvedCount}
            icon={CheckCircle2}
            accent="primary"
          />
          <StatCard
            title="Fulfilled Handovers"
            value={fulfilledCount}
            icon={PackageCheck}
            accent="success"
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

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved (Awaiting Store)</option>
              <option value="FULFILLED">Fulfilled (Assigned)</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
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
                icon={ClipboardCheck}
                title="No asset requests found"
                description={
                  statusFilter !== 'all' || categoryFilter !== 'all' || search
                    ? 'No requests match your current filters.'
                    : 'There are currently no employee asset requests in the system.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Requester</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Category & Justification</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Resolution Details</th>
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
                    const requesterName = `${req.requester.firstName} ${req.requester.lastName}`;

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
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                              {categoryLabel}
                            </span>
                          </div>
                          <p className="font-medium text-slate-700 line-clamp-1">{req.description}</p>
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
                        <td className="py-3.5 px-4 max-w-xs text-[11px]">
                          {req.status === 'PENDING' && (
                            <span className="text-amber-700 font-medium">Pending Admin Decision</span>
                          )}
                          {req.status === 'APPROVED' && (
                            <div className="text-blue-800">
                              <span className="font-semibold">Approved</span>
                              {req.approvalRemarks && (
                                <p className="text-slate-500 italic truncate">{req.approvalRemarks}</p>
                              )}
                              <span className="text-[10px] text-blue-600 block mt-0.5">
                                Awaiting Store Handover
                              </span>
                            </div>
                          )}
                          {req.status === 'FULFILLED' && (
                            <div className="text-emerald-800">
                              <span className="font-semibold">Assigned: {req.asset?.assetCode}</span>
                              <span className="text-slate-500 text-[10px] block">
                                {req.asset?.name}
                              </span>
                            </div>
                          )}
                          {req.status === 'REJECTED' && (
                            <div className="text-rose-700">
                              <span className="font-semibold">Rejected</span>
                              <p className="text-slate-500 text-[10px] truncate" title={req.rejectionReason || ''}>
                                {req.rejectionReason}
                              </p>
                            </div>
                          )}
                          {req.status === 'CANCELLED' && (
                            <span className="text-slate-400 italic">Cancelled by requester</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {req.status === 'PENDING' && canApproveOrReject && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setApprovingRequest(req)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-blue-700 hover:bg-blue-50 text-[11px] font-bold border border-blue-200 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setRejectingRequest(req)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-50 text-[11px] font-bold border border-rose-200 transition-colors"
                              >
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Reject</span>
                              </button>
                            </div>
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

        {/* Approve & Reject Modals */}
        <ApproveRequestModal
          request={approvingRequest}
          isOpen={!!approvingRequest}
          onClose={() => setApprovingRequest(null)}
          onSuccess={() => fetchRequests(true)}
        />

        <RejectRequestModal
          request={rejectingRequest}
          isOpen={!!rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onSuccess={() => fetchRequests(true)}
        />
      </div>
    </PermissionGuard>
  );
}
