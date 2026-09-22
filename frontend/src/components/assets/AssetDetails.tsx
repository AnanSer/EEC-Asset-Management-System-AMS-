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
  Package,
  Wrench,
  User,
  Clock,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Asset,
  ASSET_CATEGORY_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_CONDITION_LABELS,
} from '@/constants/assets';

interface AssetDetailsProps {
  asset: Asset;
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

function warrantyLabel(warrantyExpiry?: string | null): { label: string; status: string } {
  if (!warrantyExpiry) return { label: 'No Warranty', status: 'inactive' };
  const expiry = new Date(warrantyExpiry);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: 'Expired', status: 'disposed' };
  if (daysLeft < 90) return { label: `Expiring in ${daysLeft}d`, status: 'maintenance' };
  return { label: `Valid until ${formatDate(warrantyExpiry)}`, status: 'available' };
}

export default function AssetDetails({ asset }: AssetDetailsProps) {
  const assignmentsCount = asset._count?.assignments ?? 0;
  const maintenanceCount = asset._count?.maintenanceTickets ?? 0;
  const warranty = warrantyLabel(asset.warrantyExpiry);

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
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {[asset.brand, asset.model].filter(Boolean).join(' · ') || 'No brand / model specified'}
            </p>
          </div>
        </div>

        {/* Edit Button only */}
        <div className="flex items-center gap-3 shrink-0">
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
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-400 italic">Not Assigned Yet</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {formatDate(asset.updatedAt) ?? '—'}
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
