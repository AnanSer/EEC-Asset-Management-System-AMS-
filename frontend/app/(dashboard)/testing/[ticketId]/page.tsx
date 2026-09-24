'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { FlaskConical } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';
import maintenanceService from '@/services/maintenance.service';
import { MaintenanceTicket } from '@/constants/maintenance';
import TestingForm from '@/components/maintenance/TestingForm';

export default function TicketTestingPage() {
  const params = useParams();
  const ticketId = String(params.ticketId);
  const toast = useToast();

  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await maintenanceService.getById(ticketId);
      if (res.success) {
        setTicket(res.data);
      }
    } catch {
      toast.error('Maintenance ticket not found');
    } finally {
      setLoading(false);
    }
  }, [ticketId, toast]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          title="Asset Quality Testing"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Maintenance', href: '/maintenance' },
            { label: 'Loading...' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          title="Ticket Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Maintenance', href: '/maintenance' },
            { label: 'Not Found' },
          ]}
        />
        <EmptyState
          icon={FlaskConical}
          title="Maintenance Ticket Not Found"
          description="Could not locate the ticket to conduct testing for."
          action={{
            label: 'Back to Maintenance',
            href: '/maintenance',
          }}
        />
      </div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.TESTING_EXECUTE}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          title={`Quality Inspection: ${ticket.ticketNumber}`}
          description={`Conduct functional and diagnostic verification for ${ticket.asset?.name || 'Asset'} (${ticket.asset?.assetCode || ''})`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Maintenance', href: '/maintenance' },
            { label: ticket.ticketNumber, href: `/maintenance/${ticket.id}` },
            { label: 'Quality Testing' },
          ]}
        />

        {/* Asset Defect Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Reported Problem:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5 line-clamp-1">
              {ticket.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-slate-400 block font-medium">Technician:</span>
            <span className="font-semibold text-slate-800">
              {ticket.assignedTechnician || 'Unassigned'}
            </span>
          </div>
        </div>

        <TestingForm ticket={ticket} />
      </div>
    </PermissionGuard>
  );
}
