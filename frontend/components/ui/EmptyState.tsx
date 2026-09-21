import React from 'react';
import Link from 'next/link';
import { type LucideIcon, Inbox } from 'lucide-react';

export interface EmptyStateActionConfig {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode | EmptyStateActionConfig;
}

export default function EmptyState({
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;

    if (React.isValidElement(action)) {
      return action;
    }

    if (typeof action === 'object' && 'label' in action) {
      const config = action as EmptyStateActionConfig;
      if (config.href) {
        return (
          <Link
            href={config.href}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {config.label}
          </Link>
        );
      }
      return (
        <button
          type="button"
          onClick={config.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eec-primary hover:bg-eec-primary-dark text-white text-xs font-semibold shadow-xs transition-colors"
        >
          {config.label}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-eec-text mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      {action && <div className="mt-5">{renderAction()}</div>}
    </div>
  );
}
