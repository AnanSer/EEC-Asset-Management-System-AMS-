'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import maintenanceService from '@/services/maintenance.service';
import { MaintenanceTicket } from '@/constants/maintenance';

export default function TestingPage() {
  const { isTechnician, isAdmin } = usePermissions();
  const [testingTickets, setTestingTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestingQueue = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams: any = { status: 'TESTING', limit: 50 };
      if (isTechnician && !isAdmin) {
        queryParams.personal = 'true';
      }
      const res = await maintenanceService.getAll(queryParams);
      if (res.success) {
        setTestingTickets(res.data);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, [isTechnician, isAdmin]);

  useEffect(() => {
    fetchTestingQueue();
  }, [fetchTestingQueue]);

  return (
    <PermissionGuard permission={PERMISSIONS.TESTING_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="Quality & Acceptance Testing"
          description="Verify repaired and serviced equipment before return to active department custody"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Testing' },
          ]}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Active Testing Queue ({testingTickets.length})
              </h3>
            </div>
            <Link
              href="/maintenance"
              className="text-xs font-semibold text-eec-primary hover:underline flex items-center gap-1"
            >
              All Maintenance Tickets <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={6} />
            </div>
          ) : testingTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Ticket #</th>
                    <th className="px-5 py-3.5">Asset</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Technician</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testingTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-semibold text-purple-700">
                        <Link href={`/maintenance/${t.id}`} className="hover:underline">
                          {t.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">{t.asset?.name}</div>
                        <div className="text-xs font-mono text-slate-400">
                          {t.asset?.assetCode}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {t.assignedTechnician || 'Unassigned'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status="testing" label="In Testing" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/testing/${t.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Inspect & Verify
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={FlaskConical}
                title="Testing Queue Clear"
                description="No assets are currently awaiting acceptance or quality testing."
                action={{
                  label: 'View Maintenance Tickets',
                  href: '/maintenance',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
