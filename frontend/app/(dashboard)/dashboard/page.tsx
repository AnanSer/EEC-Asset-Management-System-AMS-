'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ClipboardList,
  Wrench,
  FlaskConical,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  Plus,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import assignmentService from '@/services/assignment.service';
import maintenanceService from '@/services/maintenance.service';
import { AssignmentStats } from '@/constants/assignments';
import { MaintenanceStats as MaintenanceStatsType } from '@/constants/maintenance';

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  icon: Icon,
  action,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="eec-card h-full">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-eec-accent" />}
          <h2 className="text-sm font-semibold text-eec-primary">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Dashboard Page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [maintenanceStats, setMaintenanceStats] = useState<MaintenanceStatsType | null>(null);

  useEffect(() => {
    assignmentService
      .getStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});

    maintenanceService
      .getStats()
      .then((res) => {
        if (res.success) setMaintenanceStats(res.data);
      })
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const kpis = [
    {
      title: 'Available Assets',
      value: stats ? stats.availableAssets : '—',
      icon: Package,
      accent: 'success' as const,
      subtitle: 'In inventory, ready for allocation',
    },
    {
      title: 'Assigned Assets',
      value: stats ? stats.assignedAssets : '—',
      icon: ClipboardList,
      accent: 'primary' as const,
      subtitle: 'Currently deployed with personnel',
    },
    {
      title: 'Employees With Assets',
      value: stats ? stats.employeesWithAssets : '—',
      icon: Users,
      accent: 'accent' as const,
      subtitle: 'Active staff holding corporate equipment',
    },
    {
      title: 'Total Assignments',
      value: stats ? stats.totalAssignments : '—',
      icon: CheckCircle2,
      accent: 'active' as const,
      subtitle: 'All historical & active custody events',
    },
  ];

  const maintenanceKpis = [
    {
      title: 'Open Tickets',
      value: maintenanceStats ? maintenanceStats.openTickets : '—',
      icon: Clock,
      accent: 'warning' as const,
      subtitle: 'Defects awaiting technician review',
    },
    {
      title: 'Under Repair',
      value: maintenanceStats ? maintenanceStats.inProgress : '—',
      icon: Wrench,
      accent: 'primary' as const,
      subtitle: 'Currently being serviced by IT',
    },
    {
      title: 'Under Testing',
      value: maintenanceStats ? maintenanceStats.testing : '—',
      icon: FlaskConical,
      accent: 'accent' as const,
      subtitle: 'Benchmarked for quality pass/fail',
    },
    {
      title: 'Repairs This Month',
      value: maintenanceStats ? maintenanceStats.completedThisMonth : '—',
      icon: CheckCircle2,
      accent: 'success' as const,
      subtitle: 'Completed and restored to inventory',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={today}
        actions={
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-emerald-700">System Operational</span>
          </div>
        }
      />

      {/* ── Asset Inventory KPIs ────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Asset Inventory & Custody Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {kpis.map((kpi) => (
            <StatCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </div>

      {/* ── Maintenance KPIs ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Maintenance & Quality Testing
          </h3>
          <Link
            href="/maintenance/new"
            className="text-xs font-semibold text-eec-primary hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New Ticket
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {maintenanceKpis.map((kpi) => (
            <StatCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </div>

      {/* ── Activity Grids: Assignments & Maintenance ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Asset Assignments */}
        <div>
          <SectionCard
            title="Recent Asset Assignments"
            icon={Clock}
            action={
              <Link
                href="/assignments"
                className="text-xs text-eec-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {stats && stats.recentAssignments.length > 0 ? (
              <div className="overflow-x-auto -mx-4 -mb-4 sm:mx-0 sm:mb-0">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Asset</th>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Assigned Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentAssignments.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <Link
                            href={`/assets/${item.assetId}`}
                            className="font-semibold text-eec-primary hover:underline block truncate max-w-[170px]"
                          >
                            {item.asset?.assetCode}
                          </Link>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[170px]">
                            {item.asset?.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.employee ? (
                            <Link
                              href={`/employees/${item.employeeId}`}
                              className="hover:text-eec-primary hover:underline block truncate max-w-[150px]"
                            >
                              {item.employee.fullName}
                            </Link>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="truncate block max-w-[150px]">
                            {item.employee?.department?.name || 'Unassigned Directorate'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-mono whitespace-nowrap">
                          {new Date(item.assignedDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No recent assignment events recorded yet.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Recent Maintenance Requests */}
        <div>
          <SectionCard
            title="Recent Maintenance Requests"
            icon={Wrench}
            action={
              <Link
                href="/maintenance"
                className="text-xs text-eec-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {maintenanceStats && maintenanceStats.recentTickets.length > 0 ? (
              <div className="overflow-x-auto -mx-4 -mb-4 sm:mx-0 sm:mb-0">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Ticket #</th>
                      <th className="py-2.5 px-3">Asset</th>
                      <th className="py-2.5 px-3">Technician</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {maintenanceStats.recentTickets.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-eec-primary">
                          <Link href={`/maintenance/${t.id}`} className="hover:underline">
                            {t.ticketNumber}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3">
                          <Link
                            href={`/assets/${t.assetId}`}
                            className="font-medium text-slate-800 hover:text-eec-primary block truncate max-w-[140px]"
                          >
                            {t.asset?.name || 'Asset'}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {t.asset?.assetCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          <span className="truncate block max-w-[120px]">
                            {t.assignedTechnician || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <StatusBadge status={t.status.toLowerCase()} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No active maintenance requests recorded yet.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
