'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ClipboardList,
  CheckCircle2,
  Users,
  Building2,
  Wrench,
  FlaskConical,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  Printer,
  FileText,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatCard from '@/components/ui/StatCard';
import LoadingSkeleton, { StatCardSkeleton } from '@/components/ui/LoadingSkeleton';
import reportService, { DashboardReportMetrics } from '@/services/report.service';
import {
  AssetsByDepartmentChart,
  AssetsByCategoryChart,
  MaintenanceByStatusChart,
  MaintenanceByPriorityChart,
  MonthlyMaintenanceChart,
} from '@/src/components/reports/ReportCharts';
import { printReport } from '@/src/utils/export';

export default function ReportsDashboardPage() {
  const [data, setData] = useState<DashboardReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .getDashboard()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load reports dashboard:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reports & Analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbs} />

      {/* ─── Header & Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eec-primary tracking-tight">
            Executive Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise overview of capital equipment, asset lifecycle, personnel custody, and maintenance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={printReport}
            className="eec-btn-secondary flex items-center gap-1.5 text-xs py-2 px-3 bg-white"
            title="Print Executive Dashboard"
          >
            <Printer size={15} />
            <span>Print Dashboard</span>
          </button>
        </div>
      </div>

      {/* ─── 8 KPI Cards ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Assets */}
          <StatCard
            title="Total Assets"
            value={data.kpis.totalAssets}
            icon={Package}
            accent="primary"
            subtitle="Registered capital inventory"
          />

          {/* 2. Assigned Assets */}
          <StatCard
            title="Assigned Assets"
            value={data.kpis.assignedAssets}
            icon={ClipboardList}
            accent="accent"
            subtitle="In active custody with staff"
          />

          {/* 3. Available Assets */}
          <StatCard
            title="Available Assets"
            value={data.kpis.availableAssets}
            icon={CheckCircle2}
            accent="success"
            subtitle="In stock, ready for deployment"
          />

          {/* 4. Active Employees */}
          <StatCard
            title="Active Employees"
            value={data.kpis.activeEmployees}
            icon={Users}
            accent="primary"
            subtitle="Authorized corporation staff"
          />

          {/* 5. Departments */}
          <StatCard
            title="Departments"
            value={data.kpis.totalDepartments}
            icon={Building2}
            accent="accent"
            subtitle="Active directorates & sectors"
          />

          {/* 6. Open Maintenance Tickets */}
          <StatCard
            title="Open Maintenance Tickets"
            value={data.kpis.openMaintenanceTickets}
            icon={Wrench}
            accent="warning"
            subtitle="Under active service or testing"
          />

          {/* 7. Assets Under Testing */}
          <StatCard
            title="Assets Under Testing"
            value={data.kpis.assetsUnderTesting}
            icon={FlaskConical}
            accent="active"
            subtitle="QA inspection in progress"
          />

          {/* 8. Warranty Expiring Soon */}
          <StatCard
            title="Warranty Expiring Soon"
            value={data.kpis.warrantyExpiringSoon}
            icon={ShieldAlert}
            accent="warning"
            subtitle="Expiring within next 90 days"
          />
        </div>
      ) : null}

      {/* ─── Specialized Sub-Report Directory Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Link
          href="/reports/assets"
          className="eec-card p-4 hover:border-eec-accent/50 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                Asset Inventory
              </p>
              <p className="text-[11px] text-slate-400">Values & status audit</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-blue-600">
            <span>View Full Report</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/reports/employees"
          className="eec-card p-4 hover:border-emerald-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                Employee Custody
              </p>
              <p className="text-[11px] text-slate-400">Staff holdings & counts</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-emerald-600">
            <span>View Full Report</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/reports/departments"
          className="eec-card p-4 hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                Department Assets
              </p>
              <p className="text-[11px] text-slate-400">Sector allocations</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-purple-600">
            <span>View Full Report</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/reports/maintenance"
          className="eec-card p-4 hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                Maintenance & Cost
              </p>
              <p className="text-[11px] text-slate-400">Repair orders & expenses</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-amber-600">
            <span>View Full Report</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/reports/warranty"
          className="eec-card p-4 hover:border-rose-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
                Warranty Center
              </p>
              <p className="text-[11px] text-slate-400">30 / 60 / 90 day alerts</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-rose-600">
            <span>View Full Report</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ─── Exactly 5 Analytics Charts ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="eec-card h-72 animate-pulse bg-slate-50" />
          <div className="eec-card h-72 animate-pulse bg-slate-50" />
          <div className="eec-card h-72 animate-pulse bg-slate-50" />
          <div className="eec-card h-72 animate-pulse bg-slate-50" />
          <div className="eec-card h-72 animate-pulse bg-slate-50 lg:col-span-2" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Assets by Department */}
          <AssetsByDepartmentChart data={data.charts.assetsByDepartment} />

          {/* Chart 2: Assets by Category */}
          <AssetsByCategoryChart data={data.charts.assetsByCategory} />

          {/* Chart 3: Maintenance by Status */}
          <MaintenanceByStatusChart data={data.charts.maintenanceByStatus} />

          {/* Chart 4: Maintenance by Priority */}
          <MaintenanceByPriorityChart data={data.charts.maintenanceByPriority} />

          {/* Chart 5: Monthly Maintenance Tickets (Spans full width) */}
          <div className="lg:col-span-2">
            <MonthlyMaintenanceChart data={data.charts.monthlyMaintenance} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
