'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Wrench,
  Search,
  ExternalLink,
  Play,
  FlaskConical,
  CheckCircle2,
  Loader2,
  Calendar,
  User,
  Building2,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import maintenanceService from '@/services/maintenance.service';
import {
  MaintenanceTicket,
  MaintenanceStatus,
  ISSUE_CATEGORY_LABELS,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_STATUS_LABELS,
  IssueCategory,
  MaintenancePriority,
} from '@/constants/maintenance';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';

const PRIORITY_BADGE_STYLES: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
};

export default function MyMaintenancePage() {
  const toast = useToast();
  const { isTechnician, isAdmin } = usePermissions();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const canPerformTechActions = isTechnician || isAdmin;

  const fetchMyTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await maintenanceService.getAll({
        personal: true,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        limit: 50,
      });
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to fetch maintenance tickets';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, toast]);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const handleStatusUpdate = async (ticketId: string, newStatus: MaintenanceStatus) => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await maintenanceService.updateStatus(ticketId, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${MAINTENANCE_STATUS_LABELS[newStatus] || newStatus}`);
        fetchMyTickets();
      } else {
        toast.error(res.message || 'Status transition failed');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Status transition failed';
      toast.error(msg);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ticket.ticketNumber.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        (ticket.asset?.name && ticket.asset.name.toLowerCase().includes(q)) ||
        (ticket.asset?.assetCode && ticket.asset.assetCode.toLowerCase().includes(q)) ||
        (ticket.reportedBy && ticket.reportedBy.toLowerCase().includes(q)) ||
        (ticket.assignedTechnician && ticket.assignedTechnician.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <PermissionGuard permission={PERMISSIONS.MAINTENANCE_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title={isTechnician ? 'My Assigned Maintenance Tasks' : 'My Maintenance Requests'}
          description={
            isTechnician
              ? 'Diagnose, service, and complete hardware repairs assigned to your technical workbench.'
              : 'Track and submit service requests and hardware repairs for your assigned company equipment.'
          }
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Maintenance' },
          ]}
          action={{
            label: 'New Request',
            href: '/maintenance/new',
            icon: Plus,
          }}
        />

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket, asset, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700 w-full sm:w-36"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="TESTING">In Testing</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary bg-white text-slate-700 w-full sm:w-36"
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={
              search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No Matching Tickets'
                : isTechnician
                ? 'No Maintenance Tasks Assigned'
                : 'No Maintenance Requests'
            }
            description={
              search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No maintenance tickets match your current filters.'
                : isTechnician
                ? 'You currently have no active maintenance tickets assigned to your technician profile.'
                : 'You have not reported any maintenance issues and none of your assigned assets have active service tickets.'
            }
            action={{
              label: 'Submit New Request',
              href: '/maintenance/new',
            }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Ticket #</th>
                    <th className="px-5 py-3.5">Asset</th>
                    <th className="px-5 py-3.5">Reported By</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => {
                    const asset = ticket.asset;
                    const priorityLabel =
                      MAINTENANCE_PRIORITY_LABELS[ticket.priority as MaintenancePriority] || ticket.priority;
                    const priorityStyle =
                      PRIORITY_BADGE_STYLES[ticket.priority] || 'bg-slate-100 text-slate-700';

                    const formattedDate = ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';

                    const isUpdating = updatingTicketId === ticket.id;

                    return (
                      <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-xs text-eec-primary whitespace-nowrap">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-5 py-4">
                          {asset ? (
                            <div>
                              <div className="font-medium text-slate-900 truncate max-w-[200px]" title={asset.name}>
                                {asset.name}
                              </div>
                              <div className="text-xs font-mono text-slate-500">{asset.assetCode}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No asset linked</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ticket.reportedBy || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{asset?.department?.name || 'ICT Directorate'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${priorityStyle}`}
                          >
                            {priorityLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Technician Quick Action Workflow */}
                            {canPerformTechActions && (
                              <>
                                {ticket.status === 'OPEN' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                                    disabled={isUpdating}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs disabled:opacity-50"
                                    title="Start Work"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                    <span>Start Work</span>
                                  </button>
                                )}

                                {ticket.status === 'IN_PROGRESS' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(ticket.id, 'TESTING')}
                                      disabled={isUpdating}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs disabled:opacity-50"
                                      title="Move to Testing"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <FlaskConical className="w-3 h-3" />
                                      )}
                                      <span>Move to Testing</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(ticket.id, 'COMPLETED')}
                                      disabled={isUpdating}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
                                      title="Mark Completed"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3 h-3" />
                                      )}
                                      <span>Complete</span>
                                    </button>
                                  </>
                                )}

                                {ticket.status === 'TESTING' && (
                                  <>
                                    <Link
                                      href={`/testing/${ticket.id}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs"
                                      title="Conduct Inspection"
                                    >
                                      <FlaskConical className="w-3 h-3" />
                                      <span>Conduct Inspection</span>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(ticket.id, 'COMPLETED')}
                                      disabled={isUpdating}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
                                      title="Mark Completed"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3 h-3" />
                                      )}
                                      <span>Complete</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* View Details Link */}
                            <Link
                              href={`/maintenance/${ticket.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-eec-primary bg-eec-primary/10 hover:bg-eec-primary hover:text-white transition-colors"
                            >
                              <span>View Details</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
