import React from 'react';
import Link from 'next/link';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

export type { BreadcrumbItem };

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
          <Breadcrumb items={breadcrumbs} />
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
