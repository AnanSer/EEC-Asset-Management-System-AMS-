'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Hash,
  Monitor,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  FileText,
  Edit2,
  Package,
  Wrench,
  User,
  Clock,
  ArrowRightLeft,
  RotateCcw,
  History,
  Plus,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Asset,
  ASSET_CATEGORY_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_CONDITION_LABELS,
} from '@/constants/assets';
import TransferModal from '@/components/assignments/TransferModal';
import ReturnModal from '@/components/assignments/ReturnModal';
import AssignmentTimeline from '@/components/assignments/AssignmentTimeline';

interface AssetDetailsProps {
  asset: Asset;
  onRefresh?: () => void;
}

function InfoCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        {href ? (
          <Link
            href={href}
            className="text-sm font-semibold text-eec-primary hover:underline mt-0.5 block"
          >
            {value || '—'}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || '—'}</p>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
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

function warrantyLabel(warrantyExpiry?: string | null): { label: string; status: string } {
  if (!warrantyExpiry) return { label: 'No Warranty', status: 'inactive' };
  const expiry = new Date(warrantyExpiry);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: 'Expired', status: 'disposed' };
  if (daysLeft < 90) return { label: `Expiring in ${daysLeft}d`, status: 'maintenance' };
  return { label: `Valid until ${formatDate(warrantyExpiry)}`, status: 'available' };
}

export default function AssetDetails({ asset, onRefresh }: AssetDetailsProps) {
  const assignmentsCount = asset._count?.assignments ?? 0;
  const maintenanceCount = asset._count?.maintenanceTickets ?? 0;
  const warranty = warrantyLabel(asset.warrantyExpiry);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [refreshTimelineTrigger, setRefreshTimelineTrigger] = useState(0);

  const currentAssignment = asset.currentAssignment;
  const isAssigned = asset.status === 'ASSIGNED' && Boolean(currentAssignment);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-eec-primary/10 text-eec-primary flex items-center justify-center shrink-0">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-eec-text">{asset.name}</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-eec-primary/10 text-eec-primary border border-eec-primary/20">
                {asset.assetCode}
              </span>
              <StatusBadge
                status={asset.status.toLowerCase()}
                label={ASSET_STATUS_LABELS[asset.status] ?? asset.status}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {[asset.brand, asset.model].filter(Boolean).join(' · ') || 'No brand / model specified'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href={`/assignments/history/${asset.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <History className="w-4 h-4 text-slate-500" />
            History ({assignmentsCount})
          </Link>

          {asset.status === 'AVAILABLE' && (
            <Link
              href={`/assignments/new?assetId=${asset.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Assign Asset
            </Link>
          )}

          <Link
            href={`/assets/${asset.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eec-primary text-white text-xs font-semibold hover:bg-eec-primary/90 transition shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Asset
          </Link>
        </div>
      </div>

      {/* Quick Counts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-eec-text">{assignmentsCount}</p>
            <p className="text-xs text-slate-500 font-medium">Assignment Records</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-eec-text">{maintenanceCount}</p>
            <p className="text-xs text-slate-500 font-medium">Maintenance Tickets</p>
          </div>
        </div>
      </div>

      {/* Asset Status Card — read-only */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Asset Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-medium">Operational Status</p>
            <StatusBadge
              status={asset.status.toLowerCase()}
              label={ASSET_STATUS_LABELS[asset.status] ?? asset.status}
            />
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-medium">Physical Condition</p>
            <StatusBadge
              status={asset.condition.toLowerCase()}
              label={ASSET_CONDITION_LABELS[asset.condition] ?? asset.condition}
            />
          </div>

          {/* Warranty */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-medium">Warranty</p>
            <StatusBadge status={warranty.status} label={warranty.label} />
          </div>

          {/* Assigned Employee */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-medium">Assigned To</p>
            {currentAssignment ? (
              <Link
                href={currentAssignment.employeeId ? `/employees/${currentAssignment.employeeId}` : '#'}
                className="flex items-center gap-1.5 group"
              >
                <div className="w-6 h-6 rounded-full bg-eec-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-eec-primary" />
                </div>
                <span className="text-xs font-semibold text-eec-text group-hover:text-eec-primary transition truncate">
                  {currentAssignment.employeeName}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400 italic">Not Assigned Yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {formatDate(asset.updatedAt) ?? '—'}
        </div>
      </div>

      {/* Assignment Information Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-eec-accent" />
            Assignment Information
          </h3>

          {/* Action Buttons: Transfer & Return (only visible when asset is ASSIGNED) */}
          {asset.status === 'ASSIGNED' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Transfer Asset
              </button>
              <button
                type="button"
                onClick={() => setShowReturnModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Return Asset
              </button>
            </div>
          )}
        </div>

        {isAssigned && currentAssignment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <InfoRow
              icon={User}
              label="Current Holder"
              value={currentAssignment.employeeName}
              href={currentAssignment.employeeId ? `/employees/${currentAssignment.employeeId}` : undefined}
            />
            <InfoRow
              icon={Tag}
              label="Employee ID"
              value={currentAssignment.employeeBadgeId || '—'}
            />
            <InfoRow
              icon={Building2}
              label="Department"
              value={currentAssignment.departmentName || '—'}
            />
            <InfoRow
              icon={Calendar}
              label="Assigned Date"
              value={formatDate(currentAssignment.assignedDate)}
            />
            <InfoRow
              icon={FileText}
              label="Remarks"
              value={currentAssignment.remarks || 'No handover remarks provided'}
            />
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <p>
              This equipment is currently stored in <strong>Available</strong> inventory and has no active custodian.
            </p>
            <Link
              href={`/assignments/new?assetId=${asset.id}`}
              className="font-semibold text-eec-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Assign Now
            </Link>
          </div>
        )}
      </div>

      {/* Assignment Timeline Card */}
      <AssignmentTimeline
        assetId={asset.id}
        refreshTrigger={refreshTimelineTrigger}
      />

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Asset Identity */}
        <InfoCard title="Asset Identity">
          <InfoRow icon={Tag} label="Asset Code" value={asset.assetCode} />
          <InfoRow icon={Hash} label="Serial Number" value={asset.serialNumber} />
          <InfoRow icon={Monitor} label="Category" value={ASSET_CATEGORY_LABELS[asset.category] ?? asset.category} />
          <InfoRow icon={Monitor} label="Brand" value={asset.brand} />
          <InfoRow icon={Monitor} label="Model" value={asset.model} />
        </InfoCard>

        {/* Location */}
        <InfoCard title="Location &amp; Facility">
          <InfoRow icon={Building2} label="Department" value={asset.department?.name} />
          <InfoRow icon={MapPin} label="Office Location" value={asset.location || asset.department?.officeLocation} />
          <InfoRow icon={Building2} label="Building" value={asset.department?.building} />
          <InfoRow icon={MapPin} label="Floor" value={asset.department?.floor} />
        </InfoCard>

        {/* Purchase & Warranty */}
        <InfoCard title="Purchase &amp; Warranty">
          <InfoRow icon={Calendar} label="Purchase Date" value={formatDate(asset.purchaseDate)} />
          <InfoRow
            icon={DollarSign}
            label="Purchase Price"
            value={
              asset.purchasePrice != null
                ? `ETB ${Number(asset.purchasePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : null
            }
          />
          <InfoRow icon={Shield} label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
        </InfoCard>

        {/* Notes */}
        <InfoCard title="Notes">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
              {asset.notes || 'No notes recorded for this asset.'}
            </p>
          </div>
        </InfoCard>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && currentAssignment && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          asset={{
            id: asset.id,
            assetCode: asset.assetCode,
            name: asset.name,
            currentHolderName: currentAssignment.employeeName,
            currentEmployeeId: currentAssignment.employeeId,
          }}
          onSuccess={() => {
            setRefreshTimelineTrigger((prev) => prev + 1);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Return Modal */}
      {showReturnModal && currentAssignment && (
        <ReturnModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          asset={{
            id: asset.id,
            assetCode: asset.assetCode,
            name: asset.name,
            currentHolderName: currentAssignment.employeeName,
          }}
          onSuccess={() => {
            setRefreshTimelineTrigger((prev) => prev + 1);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
