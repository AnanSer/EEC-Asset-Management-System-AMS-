'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Tag, Hash } from 'lucide-react';
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
              Asset Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Code / Serial
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Category
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Department
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
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

              {/* Asset Name */}
              <td className="px-4 py-3">
                <Link
                  href={`/assets/${asset.id}`}
                  className="font-semibold text-eec-text hover:text-eec-primary transition leading-tight block"
                >
                  {asset.name}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5">
                  {[asset.brand, asset.model].filter(Boolean).join(' · ') || '—'}
                </p>
              </td>

              {/* Code / Serial */}
              <td className="px-4 py-3">
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-eec-primary/10 text-eec-primary border border-eec-primary/20">
                  {asset.assetCode}
                </span>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {asset.serialNumber}
                </p>
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="text-xs font-medium text-slate-600">
                  {ASSET_CATEGORY_LABELS[asset.category] ?? asset.category}
                </span>
              </td>

              {/* Department */}
              <td className="px-4 py-3">
                <p className="text-xs font-medium text-slate-700">{asset.department?.name ?? '—'}</p>
                <p className="text-xs text-slate-400">{asset.location ?? asset.department?.officeLocation ?? ''}</p>
              </td>

              {/* Status — read-only badge */}
              <td className="px-4 py-3">
                <StatusBadge
                  status={asset.status.toLowerCase()}
                  label={ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                />
              </td>

              {/* Condition — read-only badge */}
              <td className="px-4 py-3">
                <StatusBadge
                  status={asset.condition.toLowerCase()}
                  label={ASSET_CONDITION_LABELS[asset.condition] ?? asset.condition}
                />
              </td>

              {/* Actions — View only */}
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
