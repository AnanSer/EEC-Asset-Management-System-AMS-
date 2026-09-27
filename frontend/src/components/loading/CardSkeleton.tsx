'use client';

import React from 'react';
import clsx from 'clsx';

export interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('eec-card border-l-4 border-l-slate-200 p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2.5">
          <div className="skeleton h-3 w-28 rounded-md" />
          <div className="skeleton h-8 w-20 rounded-md" />
          <div className="skeleton h-3 w-24 rounded-md" />
        </div>
        <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

export default function CardSkeleton({ className, lines = 3 }: CardSkeletonProps) {
  return (
    <div className={clsx('eec-card space-y-3.5 p-6', className)}>
      <div className="skeleton h-5 w-2/5 rounded-md" />
      <div className="skeleton h-3.5 w-full rounded-md" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-md"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
