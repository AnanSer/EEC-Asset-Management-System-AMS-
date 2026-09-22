'use client';

import React from 'react';
import { Building2, Package, Wrench, AlertTriangle, Calendar } from 'lucide-react';
import InfoCard from '@/components/ui/InfoCard';

// ─── 1. Assets by Department Chart ──────────────────────────────────────────

export function AssetsByDepartmentChart({
  data = [],
}: {
  data: Array<{ departmentName: string; code: string; count: number }>;
}) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <InfoCard
      title="Assets by Department"
      icon={Building2}
      subtitle="Asset allocation distribution across corporation sectors"
    >
      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No department asset data available</div>
      ) : (
        <div className="space-y-3.5 pt-1">
          {data.slice(0, 6).map((item, idx) => {
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const barWidth = Math.max(4, Math.round((item.count / max) * 100));

            return (
              <div key={item.code || idx} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-mono font-bold text-eec-primary text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.code}
                    </span>
                    <span className="text-slate-700 font-medium truncate" title={item.departmentName}>
                      {item.departmentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-400 text-[11px]">{percent}%</span>
                    <span className="font-bold text-eec-primary font-mono text-xs w-6 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-eec-primary to-eec-accent rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </InfoCard>
  );
}

// ─── 2. Assets by Category Chart ────────────────────────────────────────────

const categoryColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-orange-500',
];

export function AssetsByCategoryChart({
  data = [],
}: {
  data: Array<{ category: string; count: number }>;
}) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <InfoCard
      title="Assets by Category"
      icon={Package}
      subtitle="Inventory breakdown by hardware and equipment classification"
    >
      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No category data available</div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Segmented Progress Bar */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {data.map((cat, idx) => {
              const pct = total > 0 ? (cat.count / total) * 100 : 0;
              const color = categoryColors[idx % categoryColors.length];
              return (
                <div
                  key={cat.category}
                  style={{ width: `${pct}%` }}
                  className={`${color} h-full transition-all duration-500 hover:opacity-85`}
                  title={`${cat.category}: ${cat.count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* Category Badges & Legend Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {data.map((cat, idx) => {
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              const color = categoryColors[idx % categoryColors.length];

              return (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                    <span className="font-medium text-slate-700 truncate">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-bold text-slate-900 font-mono">{cat.count}</span>
                    <span className="text-[10px] text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </InfoCard>
  );
}

// ─── 3. Maintenance by Status Chart ─────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  OPEN: { label: 'Open', color: 'bg-sky-500', bg: 'bg-sky-50 border-sky-200 text-sky-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  TESTING: { label: 'Testing', color: 'bg-purple-500', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  ON_HOLD: { label: 'On Hold', color: 'bg-slate-500', bg: 'bg-slate-50 border-slate-200 text-slate-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-500', bg: 'bg-rose-50 border-rose-200 text-rose-700' },
};

export function MaintenanceByStatusChart({
  data = [],
}: {
  data: Array<{ status: string; count: number }>;
}) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <InfoCard
      title="Maintenance by Status"
      icon={Wrench}
      subtitle="Lifecycle status of all work orders and repair tickets"
    >
      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No maintenance tickets recorded</div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Progress Stack */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {data.map((item) => {
              const cfg = statusConfig[item.status] || { color: 'bg-slate-400' };
              const pct = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div
                  key={item.status}
                  style={{ width: `${pct}%` }}
                  className={`${cfg.color} h-full transition-all duration-500`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {data.map((item) => {
              const cfg = statusConfig[item.status] || {
                label: item.status,
                color: 'bg-slate-500',
                bg: 'bg-slate-50 border-slate-200 text-slate-700',
              };
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <div
                  key={item.status}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between ${cfg.bg}`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                    <span>{cfg.label}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono">{item.count}</span>
                    <span className="text-[11px] opacity-75">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </InfoCard>
  );
}

// ─── 4. Maintenance by Priority Chart ───────────────────────────────────────

const priorityConfig: Record<string, { label: string; barColor: string; textColor: string }> = {
  CRITICAL: { label: 'Critical', barColor: 'bg-rose-500', textColor: 'text-rose-700' },
  HIGH: { label: 'High', barColor: 'bg-amber-500', textColor: 'text-amber-700' },
  MEDIUM: { label: 'Medium', barColor: 'bg-sky-500', textColor: 'text-sky-700' },
  LOW: { label: 'Low', barColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
};

export function MaintenanceByPriorityChart({
  data = [],
}: {
  data: Array<{ priority: string; count: number }>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // Standard 4 priority levels ordered
  const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const sorted = order.map((pri) => {
    const found = data.find((d) => d.priority === pri);
    return { priority: pri, count: found ? found.count : 0 };
  });

  return (
    <InfoCard
      title="Maintenance by Priority"
      icon={AlertTriangle}
      subtitle="Severity ranking of recorded service requests"
    >
      {total === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No priority data available</div>
      ) : (
        <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 pb-2">
          {sorted.map((item) => {
            const cfg = priorityConfig[item.priority] || {
              label: item.priority,
              barColor: 'bg-slate-400',
              textColor: 'text-slate-700',
            };
            const heightPercent = max > 0 ? Math.max(12, Math.round((item.count / max) * 100)) : 12;

            return (
              <div key={item.priority} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-xs font-bold font-mono text-slate-700 mb-1 group-hover:scale-110 transition-transform">
                  {item.count}
                </span>
                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full ${cfg.barColor} rounded-t-lg transition-all duration-500 group-hover:opacity-90`}
                  />
                </div>
                <span className={`mt-2 text-xs font-semibold ${cfg.textColor}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </InfoCard>
  );
}

// ─── 5. Monthly Maintenance Tickets Chart ───────────────────────────────────

export function MonthlyMaintenanceChart({
  data = [],
}: {
  data: Array<{ month: string; count: number }>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <InfoCard
      title="Monthly Maintenance Tickets"
      icon={Calendar}
      subtitle="Timeline trend of maintenance incidents logged over recent months"
    >
      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No monthly data available</div>
      ) : (
        <div className="pt-2">
          <div className="h-44 flex items-end justify-between gap-3 px-2 pb-2 border-b border-slate-100">
            {data.map((item, idx) => {
              const heightPercent = max > 0 ? Math.max(10, Math.round((item.count / max) * 100)) : 10;

              return (
                <div key={item.month || idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-bold font-mono text-slate-600 mb-1">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md h-28 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-eec-primary to-eec-accent rounded-t-md transition-all duration-500 group-hover:brightness-110"
                    />
                  </div>
                  <span className="mt-2 text-[11px] font-medium text-slate-500 truncate text-center max-w-[54px]">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
            <span>6-Month Activity</span>
            <span className="font-semibold text-eec-primary">
              Total Logged: {total} ticket{total === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      )}
    </InfoCard>
  );
}
