'use client';

import React from 'react';
import { Package, CheckCircle, Wrench, Archive, AlertTriangle, Monitor } from 'lucide-react';
import { Asset } from '@/constants/assets';

interface AssetStatsProps {
  assets: Asset[];
  total: number;
}

export default function AssetStats({ assets, total }: AssetStatsProps) {
  const available = assets.filter((a) => a.status === 'AVAILABLE').length;
  const assigned = assets.filter((a) => a.status === 'ASSIGNED').length;
  const maintenance = assets.filter((a) => a.status === 'MAINTENANCE').length;
  const retired = assets.filter((a) => a.status === 'RETIRED').length;

  const stats = [
    {
      label: 'Total Assets',
      value: total,
      icon: Package,
      color: 'text-eec-primary',
      bg: 'bg-eec-primary/10',
    },
    {
      label: 'Available',
      value: available,
      icon: CheckCircle,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Assigned',
      value: assigned,
      icon: Monitor,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Maintenance',
      value: maintenance,
      icon: Wrench,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Retired',
      value: retired,
      icon: Archive,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-eec-text">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
