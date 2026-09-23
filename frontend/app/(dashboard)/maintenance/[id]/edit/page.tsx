'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Wrench } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import maintenanceService from '@/services/maintenance.service';
import { MaintenanceTicket } from '@/constants/maintenance';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

export default function EditMaintenanceTicketPage() {
  const params = useParams();
  const id = String(params.id);
  const toast = useToast();

  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await maintenanceService.getById(id);
      if (res.success) {
        setTicket(res.data);
      }
    } catch {
      toast.error('Maintenance ticket not found');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Edit Maintenance Ticket"
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Maintenance Ticket Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Maintenance', href: '/maintenance' },
            { label: 'Not Found' },
          ]}
        />
        <EmptyState
          icon={Wrench}
          title="Ticket Not Found"
          description="The requested maintenance ticket does not exist."
          action={{
            label: 'Back to Maintenance',
            href: '/maintenance',
          }}
        />
      </div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.MAINTENANCE_UPDATE}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title={`Edit Ticket: ${ticket.ticketNumber}`}
          description={`Update diagnostic notes, repair details, or assignees for ${ticket.asset?.name || 'Asset'}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Maintenance', href: '/maintenance' },
            { label: ticket.ticketNumber, href: `/maintenance/${ticket.id}` },
            { label: 'Edit' },
          ]}
        />

        <MaintenanceForm mode="edit" initialData={ticket} />
      </div>
    </PermissionGuard>
  );
}
