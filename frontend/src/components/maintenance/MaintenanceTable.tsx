'use client';

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  FlaskConical,
  Edit,
  User,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  MaintenanceTicket,
  ISSUE_CATEGORY_LABELS,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_STATUS_LABELS,
  IssueCategory,
} from '@/constants/maintenance';

interface MaintenanceTableProps {
  tickets: MaintenanceTicket[];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function MaintenanceTable({
  tickets,
}: MaintenanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="px-5 py-3.5">Ticket #</th>
            <th className="px-5 py-3.5">Asset</th>
            <th className="px-5 py-3.5">Reported By</th>
            <th className="px-5 py-3.5">Technician</th>
            <th className="px-5 py-3.5">Category</th>
            <th className="px-5 py-3.5">Priority</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Created Date</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => {
            const asset = ticket.asset;
            const categoryLabel =
              ISSUE_CATEGORY_LABELS[ticket.category as IssueCategory] ||
              ticket.title ||
              ticket.category;
            const priorityLabel =
              MAINTENANCE_PRIORITY_LABELS[ticket.priority] || ticket.priority;
            const statusLabel =
              MAINTENANCE_STATUS_LABELS[ticket.status] || ticket.status;

            return (
              <tr
                key={ticket.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Ticket Number */}
                <td className="px-5 py-4">
                  <Link
                    href={`/maintenance/${ticket.id}`}
                    className="font-mono font-semibold text-eec-primary hover:underline flex items-center gap-1.5"
                  >
                    {ticket.ticketNumber}
                  </Link>
                </td>

                {/* Asset */}
                <td className="px-5 py-4">
                  {asset ? (
                    <div>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium text-slate-800 hover:text-eec-primary line-clamp-1"
                      >
                        {asset.name}
                      </Link>
                      <span className="text-xs font-mono text-slate-400">
                        {asset.assetCode}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No asset linked</span>
                  )}
                </td>

                {/* Reported By */}
                <td className="px-5 py-4">
                  <span className="text-slate-700 text-sm">
                    {ticket.reportedBy || '—'}
                  </span>
                </td>

                {/* Technician */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[140px]">
                      {ticket.assignedTechnician || 'Unassigned'}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-5 py-4">
                  <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    {categoryLabel}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-5 py-4">
                  <StatusBadge
                    status={ticket.priority.toLowerCase()}
                    label={priorityLabel}
                  />
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <StatusBadge
                    status={ticket.status.toLowerCase()}
                    label={statusLabel}
                  />
                </td>

                {/* Created Date */}
                <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(ticket.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/maintenance/${ticket.id}`}
                      className="p-1.5 text-slate-500 hover:text-eec-primary hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Ticket Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/maintenance/${ticket.id}/edit`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Ticket"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    {ticket.status === 'TESTING' && (
                      <Link
                        href={`/testing/${ticket.id}`}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Open Quality Inspection"
                      >
                        <FlaskConical className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
