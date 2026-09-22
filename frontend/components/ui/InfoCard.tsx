'use client';

import React from 'react';
import clsx from 'clsx';

interface InfoCardProps {
  title: string;
  icon?: React.ElementType;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function InfoCard({
  title,
  icon: Icon,
  subtitle,
  action,
  children,
  className,
}: InfoCardProps) {
  return (
    <div className={clsx('eec-card h-full flex flex-col', className)}>
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-eec-primary/5 text-eec-primary flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-eec-primary truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
