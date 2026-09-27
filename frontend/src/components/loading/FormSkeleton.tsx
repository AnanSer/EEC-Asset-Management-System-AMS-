'use client';

import React from 'react';
import clsx from 'clsx';

export interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export default function FormSkeleton({ fields = 6, className }: FormSkeletonProps) {
  return (
    <div className={clsx('space-y-6 max-w-4xl mx-auto', className)}>
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-7 w-56 rounded-lg" />
        <div className="skeleton h-3.5 w-80 rounded" />
      </div>

      {/* Main Form Card Skeleton */}
      <div className="eec-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: fields }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="skeleton h-3.5 w-28 rounded" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Textarea field skeleton */}
        <div className="space-y-2 pt-2">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-24 w-full rounded-lg" />
        </div>

        {/* Form Action Buttons Skeleton */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <div className="skeleton h-9 w-24 rounded-lg" />
          <div className="skeleton h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
