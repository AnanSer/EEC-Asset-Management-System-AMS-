'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  PackageCheck,
  RotateCcw,
  Clock,
  User,
  Building2,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Tag,
  Shield,
  Calendar,
  AlertCircle,
  FileText,
  Mail,
  Layers,
  Info,
} from 'lucide-react';
import { AssetReturnRequest } from '@/constants/returns';
import {
  AssetCondition,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
} from '@/constants/assets';
import ReturnStatusBadge from './ReturnStatusBadge';
import StatusBadge from '@/components/ui/StatusBadge';

interface ReturnRequestDetailsModalProps {
  request: AssetReturnRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onReceiveAndInspect?: (request: AssetReturnRequest) => void;
  canReceive?: boolean;
}

export default function ReturnRequestDetailsModal({
  request,
  isOpen,
  onClose,
  onReceiveAndInspect,
  canReceive = true,
}: ReturnRequestDetailsModalProps) {
  if (!isOpen || !request) return null;

  // Determine custodian from assignments or fallback to requester
  const recentAssignment = request.asset.assignments?.[0];
  const custodianEmployee = recentAssignment?.employee || request.requester;
  const custodianName = custodianEmployee
    ? `${custodianEmployee.firstName} ${custodianEmployee.lastName}`
    : 'Unknown Custodian';
  const custodianEmail =
    recentAssignment?.employee?.user?.email ||
    request.requester?.user?.email ||
    null;
  const custodianDepartment =
    recentAssignment?.employee?.department?.name ||
    request.department?.name ||
    'General Department';

  const requesterName = request.requester
    ? `${request.requester.firstName} ${request.requester.lastName}`
    : 'Unknown Requester';
  const requesterEmail = request.requester?.user?.email || null;

  const receiverName = request.receivedBy?.employeeProfile
    ? `${request.receivedBy.employeeProfile.firstName} ${request.receivedBy.employeeProfile.lastName}`
    : request.receivedBy?.email || 'Store Keeper';

  const isPending = request.status === 'PENDING';
  const isReceived = request.status === 'RECEIVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Ticket Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-eec-primary/10 text-eec-primary shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {request.requestNumber}
                </span>
                <ReturnStatusBadge status={request.status} />
              </div>
              <p className="text-2xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Requested on{' '}
                {new Date(request.requestedAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title="Close ticket details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Ticket Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-600">
          {/* Section 1: Asset Information Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                <Layers className="w-4 h-4 text-eec-primary" />
                <span>Asset Information</span>
              </div>
              <Link
                href={`/assets/${request.assetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-2xs font-semibold text-eec-primary hover:text-eec-primary/80 hover:underline bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs transition-colors"
                title="Open full asset details page"
              >
                <span>View Full Asset Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-2xs text-slate-400 block font-medium">Asset Name</span>
                <span className="font-semibold text-slate-800 text-xs block truncate mt-0.5">
                  {request.asset.name}
                </span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block font-medium">Asset Code / Tag</span>
                <Link
                  href={`/assets/${request.assetId}`}
                  className="font-mono font-bold text-eec-primary hover:underline text-xs block mt-0.5"
                >
                  {request.asset.assetCode}
                </Link>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block font-medium">Category</span>
                <span className="text-slate-700 font-medium block mt-0.5">
                  {ASSET_CATEGORY_LABELS[request.asset.category] || request.asset.category}
                </span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block font-medium">Current Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={request.asset.status} />
                </div>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block font-medium">Condition</span>
                <span className="text-slate-700 font-medium block mt-0.5">
                  {ASSET_CONDITION_LABELS[request.asset.condition] || request.asset.condition}
                </span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block font-medium">Serial Number</span>
                <span className="font-mono text-slate-700 font-medium block mt-0.5 truncate">
                  {request.asset.serialNumber || 'N/A'}
                </span>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-2xs text-slate-400 block font-medium">Current Location</span>
                <span className="text-slate-700 font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {request.asset.location || 'Store / Main Facility'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Custody & Requester Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Custody / Assignment */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-white">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                <User className="w-4 h-4 text-slate-500" />
                <span>Current Custodian</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-2xs text-slate-400 block font-medium">Employee</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {custodianName}
                  </span>
                  {custodianEmail && (
                    <span className="text-2xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {custodianEmail}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-2xs text-slate-400 block font-medium">Department</span>
                  <span className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {custodianDepartment}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-2xs text-slate-400 block font-medium">Assignment Date</span>
                    <span className="text-slate-700 font-medium block mt-0.5">
                      {recentAssignment?.assignedDate
                        ? new Date(recentAssignment.assignedDate).toLocaleDateString()
                        : 'Active Assignment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-slate-400 block font-medium">Condition on Assign</span>
                    <span className="text-slate-700 font-medium block mt-0.5">
                      {recentAssignment?.conditionOnAssign || 'Good'}
                    </span>
                  </div>
                </div>

                {recentAssignment?.notes && (
                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-2xs text-slate-400 block font-medium">Assignment Notes</span>
                    <p className="text-slate-600 text-2xs mt-0.5 italic">
                      {recentAssignment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Return Request Information */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-white">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Return Request Details</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-2xs text-slate-400 block font-medium">Requester</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {requesterName}
                  </span>
                  {requesterEmail && (
                    <span className="text-2xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {requesterEmail}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-2xs text-slate-400 block font-medium">Requesting Department</span>
                  <span className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {request.department?.name || 'Department'}
                  </span>
                </div>

                <div>
                  <span className="text-2xs text-slate-400 block font-medium">Return Reason</span>
                  <p className="text-slate-800 font-medium mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                    {request.reason}
                  </p>
                </div>

                {request.notes && (
                  <div>
                    <span className="text-2xs text-slate-400 block font-medium">Requester Notes</span>
                    <p className="text-slate-600 text-2xs mt-0.5 italic">
                      {request.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Return & Inspection Action / Status */}
          {isPending ? (
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-700 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    Physical Receipt & Inspection Required
                  </h4>
                  <p className="text-2xs text-amber-700 mt-0.5 leading-relaxed">
                    This equipment is awaiting physical receipt by the Store Keeper. The asset remains in{' '}
                    <span className="font-semibold">ASSIGNED</span> status until you physically verify its
                    condition and receive it into store custody.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-amber-200/60 text-2xs text-amber-800">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  Current Location: {request.asset.location || 'With Custodian'}
                </span>
                {canReceive && onReceiveAndInspect && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReceiveAndInspect(request);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    Receive & Inspect Now
                  </button>
                )}
              </div>
            </div>
          ) : isReceived ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-semibold text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed Return & Inspection Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-2xs text-emerald-700/80 block font-medium">Received By</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {receiverName}
                  </span>
                </div>

                <div>
                  <span className="text-2xs text-emerald-700/80 block font-medium">Received Date & Time</span>
                  <span className="text-slate-800 font-medium block mt-0.5">
                    {request.receivedAt
                      ? new Date(request.receivedAt).toLocaleString()
                      : 'Completed'}
                  </span>
                </div>

                <div>
                  <span className="text-2xs text-emerald-700/80 block font-medium">Store Return Location</span>
                  <span className="text-slate-800 font-medium block mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {request.returnLocation || 'Store'}
                  </span>
                </div>

                <div>
                  <span className="text-2xs text-emerald-700/80 block font-medium">Condition on Return</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {request.conditionOnReturn
                      ? ASSET_CONDITION_LABELS[request.conditionOnReturn as AssetCondition] || request.conditionOnReturn
                      : 'Good'}
                  </span>
                </div>

                {request.notes && (
                  <div className="sm:col-span-2 lg:col-span-4 pt-1 border-t border-emerald-200/60">
                    <span className="text-2xs text-emerald-700/80 block font-medium">Inspection Notes</span>
                    <p className="text-slate-700 text-2xs mt-0.5 italic">
                      {request.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs italic">
              This return request was cancelled.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <div className="text-2xs text-slate-400">
            Read-only ticket inspection
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {isPending && canReceive && onReceiveAndInspect && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReceiveAndInspect(request);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Receive & Inspect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
