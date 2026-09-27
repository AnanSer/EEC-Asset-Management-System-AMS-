'use client';

import React from 'react';
import clsx from 'clsx';
import CardSkeleton, { StatCardSkeleton } from './CardSkeleton';
import ChartSkeleton from './ChartSkeleton';
import TableSkeleton from './TableSkeleton';

export interface DashboardSkeletonProps {
  className?: string;
}

export default function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-48 rounded-lg" />
          <div className="skeleton h-3.5 w-72 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-9 w-28 rounded-lg" />
          <div className="skeleton h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Middle Row: Analytics Chart + Activity Feed Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton height={280} />
        </div>
        <div className="space-y-6">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={3} />
        </div>
      </div>

      {/* Bottom Row: Recent Assets / Maintenance Activity Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-44 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
        <TableSkeleton rows={4} cols={5} showFilters={false} />
      </div>
    </div>
  );
}
