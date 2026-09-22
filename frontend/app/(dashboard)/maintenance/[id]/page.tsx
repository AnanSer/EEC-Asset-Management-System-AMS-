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
import MaintenanceDetails from '@/components/maintenance/MaintenanceDetails';

export default function MaintenanceDetailPage() {
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
      <div className="space-y-6">
        <PageHeader
          title="Maintenance Ticket"
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
      <div className="space-y-6">
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
          description="The requested maintenance ticket does not exist or has been removed."
          action={{
            label: 'Back to Maintenance',
            href: '/maintenance',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.ticketNumber}
        description={`Asset: ${ticket.asset?.name || 'N/A'} (${ticket.asset?.assetCode || ''})`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: ticket.ticketNumber },
        ]}
      />

      <MaintenanceDetails ticket={ticket} onRefresh={loadTicket} />
    </div>
  );
}
