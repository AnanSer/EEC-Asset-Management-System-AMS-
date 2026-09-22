'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Play,
  FlaskConical,
  CheckCircle2,
  Edit,
  User,
  Package,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';
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
} from '@/constants/maintenance';
import TestingResultCard from './TestingResultCard';

interface MaintenanceDetailsProps {
  ticket: MaintenanceTicket;
  onRefresh?: () => void;
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

export default function MaintenanceDetails({
  ticket,
  onRefresh,
}: MaintenanceDetailsProps) {
  const router = useRouter();
  const toast = useToast();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const asset = ticket.asset;
  const categoryLabel =
    ISSUE_CATEGORY_LABELS[ticket.category as IssueCategory] ||
    ticket.title ||
    ticket.category;
  const priorityLabel =
    MAINTENANCE_PRIORITY_LABELS[ticket.priority] || ticket.priority;
  const statusLabel =
    MAINTENANCE_STATUS_LABELS[ticket.status] || ticket.status;

  const handleStatusChange = async (newStatus: MaintenanceStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await maintenanceService.updateStatus(ticket.id, {
        status: newStatus,
      });
      if (res.success) {
        toast.success(`Status updated to ${MAINTENANCE_STATUS_LABELS[newStatus] || newStatus}`);
        if (onRefresh) onRefresh();
        else router.refresh();
      } else {
        toast.error(res.message || 'Status transition failed');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Status transition failed';
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-eec-primary/10 text-eec-primary flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  {ticket.ticketNumber}
                </span>
                <StatusBadge
                  status={ticket.status.toLowerCase()}
                  label={statusLabel}
                />
                <StatusBadge
                  status={ticket.priority.toLowerCase()}
                  label={priorityLabel}
                />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                {categoryLabel} Maintenance
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={`/maintenance/${ticket.id}/edit`}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Ticket
            </Link>

            {ticket.status === 'OPEN' && (
              <button
                type="button"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Start Work
              </button>
            )}

            {ticket.status === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={() => handleStatusChange('TESTING')}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FlaskConical className="w-3.5 h-3.5" />
                )}
                Move to Testing
              </button>
            )}

            {ticket.status === 'TESTING' && (
              <Link
                href={`/testing/${ticket.id}`}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Conduct Inspection
              </Link>
            )}

            {(ticket.status === 'TESTING' || ticket.status === 'IN_PROGRESS') && (
              <button
                type="button"
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Issue Description, Inspections, Resolution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-eec-primary" />
              Incident Description
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/80 p-4 rounded-lg border border-slate-100">
              {ticket.description}
            </p>
          </div>

          {/* Resolution Notes Card (if present) */}
          {ticket.resolutionNotes && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Resolution & Repair Summary
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-emerald-50/40 p-4 rounded-lg border border-emerald-100">
                {ticket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Quality Inspection & Testing History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                Inspection & Quality Tests
              </h3>
              <Link
                href={`/testing/${ticket.id}`}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1"
              >
                + New Inspection
              </Link>
            </div>

            {ticket.inspectionTests && ticket.inspectionTests.length > 0 ? (
              <div className="space-y-3">
                {ticket.inspectionTests.map((t) => (
                  <TestingResultCard key={t.id} test={t} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">
                  No inspection tests recorded yet.
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  When maintenance is completed, an inspector can record verification results.
                </p>
                <Link
                  href={`/testing/${ticket.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
                >
                  Conduct Quality Test
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Asset Details & Personnel */}
        <div className="space-y-6">
          {/* Asset Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-eec-primary" />
                Asset Information
              </h3>
              {asset && (
                <Link
                  href={`/assets/${asset.id}`}
                  className="text-xs font-semibold text-eec-primary hover:underline flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {asset ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Asset Name:</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {asset.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Asset Code:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    {asset.assetCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Brand & Model:</span>
                  <span className="font-medium text-slate-700">
                    {asset.brand || '—'} {asset.model || ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Serial Number:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {asset.serialNumber || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category:</span>
                  <span className="font-medium text-slate-700">{asset.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Department:</span>
                  <span className="font-medium text-slate-700">
                    {asset.department?.name || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Holder / Custody:</span>
                  <span className="font-medium text-slate-700">
                    {asset.currentHolder?.fullName || 'In Stock / Warehouse'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Asset Status:</span>
                  <StatusBadge status={asset.status.toLowerCase()} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No asset linked</p>
            )}
          </div>

          {/* Personnel & Dates Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-eec-primary" />
              Ticket Personnel
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Reported By:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {ticket.reportedBy || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Assigned IT Technician:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {ticket.assignedTechnician || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reported Date:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(ticket.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed Date:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(ticket.completedDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Repair Cost:</span>
                <span className="font-semibold text-slate-900">
                  {ticket.cost ? `${Number(ticket.cost).toLocaleString()} ETB` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
