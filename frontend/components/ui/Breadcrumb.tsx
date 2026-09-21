'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className={`flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 ${className}`}>
      {items.map((b, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {b.href && !isLast ? (
              <Link
                href={b.href}
                className="hover:text-eec-primary hover:underline transition-colors font-medium text-slate-500"
              >
                {b.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-slate-700' : 'text-slate-500'}>
                {b.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
