'use client';

import React from 'react';
import { Clock, Wrench, CheckCircle2, FlaskConical } from 'lucide-react';
import { MaintenanceStats as StatsData } from '@/constants/maintenance';

interface MaintenanceStatsProps {
  stats: StatsData;
  isLoading?: boolean;
}

export default function MaintenanceStats({ stats, isLoading = false }: MaintenanceStatsProps) {
  const cards = [
    {
      label: 'Open Tickets',
      value: stats.openTickets,
      icon: Clock,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Under Testing',
      value: stats.testing,
      icon: FlaskConical,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'Completed This Month',
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5 transition-all hover:shadow-md"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {isLoading ? '...' : card.value}
              </p>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
