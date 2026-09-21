import {
  Package,
  ClipboardList,
  Wrench,
  FlaskConical,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';

// ─── Static Placeholder Data ────────────────────────────────────────────────

const kpiData = [
  {
    title: 'Total Assets',
    value: '1,248',
    icon: Package,
    accent: 'accent' as const,
    trend: { value: 8, label: 'vs last month', direction: 'up' as const },
  },
  {
    title: 'Assigned Assets',
    value: '934',
    icon: ClipboardList,
    accent: 'primary' as const,
    trend: { value: 3, label: 'vs last month', direction: 'up' as const },
  },
  {
    title: 'Pending Maintenance',
    value: '47',
    icon: Wrench,
    accent: 'active' as const,
    trend: { value: 12, label: 'vs last month', direction: 'up' as const },
  },
  {
    title: 'Assets Under Testing',
    value: '23',
    icon: FlaskConical,
    accent: 'warning' as const,
    trend: { value: 5, label: 'vs last month', direction: 'down' as const },
  },
];

const recentActivity = [
  { id: 1, action: 'Asset #LAP-0042 assigned to Abebe Girma', time: '2 mins ago',   status: 'assigned'    as const, icon: ClipboardList },
  { id: 2, action: 'Maintenance request for Printer #PRT-007',  time: '18 mins ago',  status: 'maintenance' as const, icon: Wrench        },
  { id: 3, action: 'Asset #CAM-0015 returned from Testing',     time: '1 hour ago',   status: 'available'   as const, icon: FlaskConical   },
  { id: 4, action: 'New asset Dell Laptop registered',          time: '3 hours ago',  status: 'active'      as const, icon: Package        },
  { id: 5, action: 'Asset #PROJ-002 decommissioned',            time: 'Yesterday',    status: 'retired'     as const, icon: Package        },
];

const departmentDistribution = [
  { dept: 'Engineering',    total: 320, assigned: 298, pct: 93 },
  { dept: 'IT Department',  total: 215, assigned: 210, pct: 98 },
  { dept: 'Finance',        total: 140, assigned: 126, pct: 90 },
  { dept: 'HR',             total: 98,  assigned: 82,  pct: 84 },
  { dept: 'Operations',     total: 475, assigned: 218, pct: 46 },
];

const warrantyAlerts = [
  { id: 1, asset: 'Dell PowerEdge R740', tag: 'SRV-0011', expiry: '2026-10-15', daysLeft: 24, severity: 'critical' },
  { id: 2, asset: 'HP LaserJet Pro MFP', tag: 'PRT-0034', expiry: '2026-11-02', daysLeft: 42, severity: 'warning'  },
  { id: 3, asset: 'Cisco Catalyst 9200', tag: 'NET-0007', expiry: '2026-11-30', daysLeft: 70, severity: 'info'     },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="eec-card h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        {Icon && <Icon className="w-4 h-4 text-eec-accent" />}
        <h2 className="text-sm font-semibold text-eec-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Dashboard Page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

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
        {kpiData.map((kpi) => (
          <StatCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Middle Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <SectionCard title="Recent Activity" icon={Clock}>
            <ul className="space-y-3">
              {recentActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-eec-accent/10 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-eec-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-eec-text leading-snug truncate">{item.action}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

        {/* Department Distribution */}
        <div>
          <SectionCard title="Department Distribution" icon={TrendingUp}>
            <ul className="space-y-4">
              {departmentDistribution.map((d) => (
                <li key={d.dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-eec-text truncate max-w-[120px]">{d.dept}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                      {d.assigned}/{d.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-eec-accent transition-all duration-500"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 text-right">{d.pct}% utilized</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      {/* ── Warranty Alerts ────────────────────────────────────────────── */}
      <SectionCard title="Warranty Expiry Alerts" icon={AlertTriangle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag</th>
                <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Left</th>
                <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {warrantyAlerts.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-medium text-eec-text">{w.asset}</td>
                  <td className="py-3 font-mono text-xs text-slate-500">{w.tag}</td>
                  <td className="py-3 text-slate-600">{w.expiry}</td>
                  <td className="py-3">
                    <span className={
                      w.daysLeft <= 30
                        ? 'font-bold text-red-600'
                        : w.daysLeft <= 60
                        ? 'font-semibold text-amber-600'
                        : 'text-slate-600'
                    }>
                      {w.daysLeft}d
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                      w.severity === 'critical'
                        ? 'bg-red-50 text-red-700 ring-red-200'
                        : w.severity === 'warning'
                        ? 'bg-amber-50 text-amber-700 ring-amber-200'
                        : 'bg-blue-50 text-blue-700 ring-blue-200'
                    }`}>
                      {w.severity === 'critical' ? '🔴 Critical' : w.severity === 'warning' ? '🟡 Warning' : '🔵 Info'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
