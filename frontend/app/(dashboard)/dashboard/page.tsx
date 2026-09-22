'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ClipboardList,
  Wrench,
  FlaskConical,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import assignmentService from '@/services/assignment.service';
import { AssignmentStats } from '@/constants/assignments';

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

  useEffect(() => {
    assignmentService
      .getStats()
      .then((res) => {
        if (res.success) setStats(res.data);
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

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <StatCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Middle Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recently Assigned Assets */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recently Assigned Assets"
            icon={Clock}
            action={
              <Link
                href="/assignments"
                className="text-xs text-eec-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {stats && stats.recentAssignments.length > 0 ? (
              <ul className="space-y-3">
                {stats.recentAssignments.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-eec-accent/10 transition-colors">
                      <ClipboardList className="w-3.5 h-3.5 text-slate-500 group-hover:text-eec-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-eec-text leading-snug truncate">
                        <Link
                          href={`/assets/${item.assetId}`}
                          className="font-semibold hover:text-eec-primary transition"
                        >
                          {item.asset?.assetCode}
                        </Link>{' '}
                        ({item.asset?.name}) assigned to{' '}
                        <strong className="text-slate-700">
                          {item.employee?.fullName || 'Staff Member'}
                        </strong>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.assignedDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        · {item.employee?.department?.name || 'Unassigned Directorate'}
                      </p>
                    </div>
                    <StatusBadge
                      status={item.isCurrent ? 'assigned' : 'available'}
                      label={item.isCurrent ? 'Active Custody' : 'Returned'}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No recent assignment events recorded yet.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Operational Guidelines & Quick Links */}
        <div>
          <SectionCard title="Quick Allocations" icon={TrendingUp}>
            <div className="space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                Equipment allocation workflow automatically maintains synchronization between asset status and personnel custody.
              </p>
              <div className="space-y-2 pt-2">
                <Link
                  href="/assignments/new"
                  className="flex items-center justify-between p-3 rounded-lg bg-eec-primary/5 hover:bg-eec-primary/10 text-eec-primary font-semibold transition"
                >
                  <span>New Equipment Assignment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/assets"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                >
                  <span>Browse Available Assets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/employees"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                >
                  <span>Staff Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
