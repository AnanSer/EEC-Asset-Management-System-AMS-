import React from 'react';
import { type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  accent?: 'primary' | 'accent' | 'active' | 'success' | 'warning';
  color?: 'primary' | 'accent' | 'active' | 'success' | 'warning';
}

const accentMap = {
  primary: { bg: 'bg-eec-primary/10', icon: 'text-eec-primary', border: 'border-l-eec-primary' },
  accent:  { bg: 'bg-eec-accent/10',  icon: 'text-eec-accent',  border: 'border-l-eec-accent'  },
  active:  { bg: 'bg-eec-active/10',  icon: 'text-eec-active',  border: 'border-l-eec-active'  },
  success: { bg: 'bg-emerald-50',     icon: 'text-emerald-600', border: 'border-l-emerald-500' },
  warning: { bg: 'bg-amber-50',       icon: 'text-amber-600',   border: 'border-l-amber-500'   },
};

const trendColors = {
  up:      'text-emerald-600 bg-emerald-50',
  down:    'text-red-600 bg-red-50',
  neutral: 'text-slate-500 bg-slate-100',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accent,
  color,
}: StatCardProps) {
  const chosenAccent = accent || color || 'accent';
  const colors = accentMap[chosenAccent] || accentMap.accent;

  return (
    <div
      className={clsx(
        'eec-card border-l-4 hover:shadow-md transition-shadow duration-200',
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-eec-text">{value}</p>
          {subtitle && !trend && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={clsx(
                  'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  trendColors[trend.direction]
                )}
              >
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
                {trend.value}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl flex-shrink-0', colors.bg)}>
          <Icon className={clsx('w-5 h-5', colors.icon)} />
        </div>
      </div>
    </div>
  );
}
