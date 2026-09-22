'use client';

import React from 'react';
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
  RefreshCw,
  Package,
  Wrench,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Asset,
  AssetStatus,
  ASSET_CATEGORY_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_CONDITION_LABELS,
} from '@/constants/assets';

interface AssetDetailsProps {
  asset: Asset;
  onChangeStatus: () => void;
  statusLoading?: boolean;
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || '—'}</p>
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

const ALL_STATUSES: AssetStatus[] = [
  'AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED',
];

export default function AssetDetails({
  asset,
  onChangeStatus,
  statusLoading = false,
}: AssetDetailsProps) {
  const assignmentsCount = asset._count?.assignments ?? 0;
  const maintenanceCount = asset._count?.maintenanceTickets ?? 0;

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
              <StatusBadge
                status={asset.condition.toLowerCase()}
                label={`Condition: ${ASSET_CONDITION_LABELS[asset.condition] ?? asset.condition}`}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {[asset.brand, asset.model].filter(Boolean).join(' · ') || 'No brand / model specified'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onChangeStatus}
            disabled={statusLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
            Change Status
          </button>
          <Link
            href={`/assets/${asset.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eec-primary text-white text-sm font-medium hover:bg-eec-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
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
            <p className="text-xs text-slate-500 font-medium">Assignments</p>
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
        <InfoCard title="Location &amp; Assignment">
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
    </div>
  );
}
