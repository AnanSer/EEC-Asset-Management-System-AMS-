'use client';

import React from 'react';
import { ClipboardList, CheckCircle2, RotateCcw, Users } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface AssignmentSummaryProps {
  total: number;
  active: number;
  returned: number;
  employeesWithAssets?: number;
}

export default function AssignmentSummary({
  total,
  active,
  returned,
  employeesWithAssets,
}: AssignmentSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Assignments"
        value={total}
        subtitle="All recorded events"
        icon={ClipboardList}
        accent="primary"
      />
      <StatCard
        title="Active Assignments"
        value={active}
        subtitle="Currently deployed assets"
        icon={CheckCircle2}
        accent="active"
      />
      <StatCard
        title="Returned Assets"
        value={returned}
        subtitle="Completed lifecycles"
        icon={RotateCcw}
        accent="warning"
      />
      <StatCard
        title="Assigned Custodians"
        value={employeesWithAssets ?? '—'}
        subtitle="Staff holding equipment"
        icon={Users}
        accent="accent"
      />
    </div>
  );
}
