'use client';

import React from 'react';
import clsx from 'clsx';

export interface ChartSkeletonProps {
  height?: number | string;
  className?: string;
  title?: string;
}

export default function ChartSkeleton({
  height = 280,
  className,
  title,
}: ChartSkeletonProps) {
  // Mock varied bar heights for realistic shimmer chart appearance
  const barHeights = [40, 65, 30, 85, 50, 70, 95, 45, 60, 80, 55, 75];

  return (
    <div className={clsx('eec-card p-6 space-y-5', className)}>
      {/* Chart Title and Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-3 w-60 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Chart Bars Visual Area */}
      <div
        className="flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {barHeights.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div
              className="skeleton w-full max-w-[28px] rounded-t-md"
              style={{ height: `${h}%` }}
            />
            <div className="skeleton h-2 w-4 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Legend Skeleton */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="skeleton w-3 h-3 rounded-full" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton w-3 h-3 rounded-full" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}
