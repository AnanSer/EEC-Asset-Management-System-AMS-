'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, MapPin, User } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Asset, ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS, ASSET_CONDITION_LABELS } from '@/constants/assets';
import AssetThumbnail from './AssetThumbnail';

interface AssetTableProps {
  assets: Asset[];
}

export default function AssetTable({ assets }: AssetTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="w-12 px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Item
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Asset
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Category
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Current Location
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Assigned To
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Condition
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
              {/* Thumbnail / Avatar */}
              <td className="px-3 py-3 text-center">
                <Link href={`/assets/${asset.id}`} className="inline-block" title={asset.name}>
                  <AssetThumbnail
                    category={asset.category}
                    alt={asset.name}
                    size="sm"
                    className="w-10 h-10 p-1 rounded-lg border border-slate-200 bg-slate-50/80 shadow-xs hover:border-eec-primary/40 transition"
                  />
                </Link>
              </td>

              {/* Asset Name + Code & Serial */}
              <td className="px-4 py-3">
                <Link
                  href={`/assets/${asset.id}`}
                  className="font-semibold text-eec-text hover:text-eec-primary transition leading-tight block"
                >
                  {asset.name}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono text-xs font-semibold px-1.5 py-0.2 rounded bg-eec-primary/10 text-eec-primary border border-eec-primary/20">
                    {asset.assetCode}
                  </span>
                  <span>·</span>
                  <span className="text-slate-400 font-mono text-[11px]">{asset.serialNumber}</span>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="text-xs font-medium text-slate-700">
                  {ASSET_CATEGORY_LABELS[asset.category] ?? asset.category}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge
                  status={asset.status.toLowerCase()}
                  label={ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                />
              </td>

              {/* Current Location */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{asset.location || '—'}</span>
                </div>
                {asset.department?.name && (
                  <p className="text-[11px] text-slate-400 ml-5 truncate max-w-[150px]">
                    {asset.department.name}
                  </p>
                )}
              </td>

              {/* Assigned To */}
              <td className="px-4 py-3">
                {asset.currentAssignment ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-eec-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-eec-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {asset.currentAssignment.employeeName}
                      </p>
                      {asset.currentAssignment.employeeBadgeId && (
                        <p className="text-[10px] font-mono text-slate-400">
                          {asset.currentAssignment.employeeBadgeId}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>

              {/* Condition */}
              <td className="px-4 py-3">
                <StatusBadge
                  status={asset.condition.toLowerCase()}
                  label={ASSET_CONDITION_LABELS[asset.condition] ?? asset.condition}
                />
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-eec-primary/10 text-eec-primary hover:bg-eec-primary/20 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
