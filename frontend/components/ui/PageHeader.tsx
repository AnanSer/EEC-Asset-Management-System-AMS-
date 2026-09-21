import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: PageHeaderAction;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            {breadcrumbs.map((b, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  {b.href && !isLast ? (
                    <Link
                      href={b.href}
                      className="hover:text-eec-primary hover:underline transition-colors"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'font-medium text-slate-700' : ''}>
                      {b.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-eec-primary tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {actions}
        {children}
        {action &&
          (action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          ))}
      </div>
    </div>
  );
}
