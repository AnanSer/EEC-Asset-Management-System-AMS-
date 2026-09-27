'use client';

import React from 'react';
import clsx from 'clsx';

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showFilters?: boolean;
  className?: string;
}

export default function TableSkeleton({
  rows = 6,
  cols = 5,
  showFilters = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header / Filter Toolbar Skeleton */}
      {showFilters && (
        <div className="eec-card p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="skeleton h-9 w-full sm:w-72 rounded-lg" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="skeleton h-9 w-24 rounded-lg" />
              <div className="skeleton h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Table Container Skeleton */}
      <div className="eec-card p-0 overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Head */}
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                {Array.from({ length: cols }).map((_, idx) => (
                  <th key={idx} className="px-5 py-3.5">
                    <div
                      className="skeleton h-3.5 rounded"
                      style={{ width: `${60 + (idx % 3) * 15}%` }}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {Array.from({ length: rows }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50">
                  {Array.from({ length: cols }).map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-3.5">
                      <div
                        className="skeleton h-3.5 rounded"
                        style={{
                          width:
                            cIdx === 0
                              ? '80%'
                              : cIdx === cols - 1
                              ? '45%'
                              : `${50 + ((rIdx + cIdx) % 4) * 12}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/40">
          <div className="skeleton h-3 w-40 rounded" />
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-20 rounded-lg" />
            <div className="skeleton h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
