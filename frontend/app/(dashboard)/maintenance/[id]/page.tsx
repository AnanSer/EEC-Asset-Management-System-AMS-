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

import { usePermissions } from '@/hooks/usePermissions';

export default function MaintenanceDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const toast = useToast();
  const { isEmployee } = usePermissions();

  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const parentLabel = isEmployee ? 'My Maintenance' : 'Maintenance';
  const parentHref = isEmployee ? '/my-maintenance' : '/maintenance';

  const loadTicket = useCallback(async () => {
    try {
      setLoading(true);
      setIsForbidden(false);
      const res = await maintenanceService.getById(id);
      if (res.success) {
        setTicket(res.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setIsForbidden(true);
        toast.error('You do not have permission to view this maintenance ticket');
      } else {
        toast.error('Maintenance ticket not found');
      }
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
            { label: parentLabel, href: parentHref },
            { label: 'Loading...' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (isForbidden || !ticket) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={isForbidden ? 'Access Denied' : 'Maintenance Ticket Not Found'}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: parentLabel, href: parentHref },
            { label: isForbidden ? 'Access Denied' : 'Not Found' },
          ]}
        />
        <EmptyState
          icon={Wrench}
          title={isForbidden ? 'Unauthorized' : 'Ticket Not Found'}
          description={
            isForbidden
              ? 'You do not have permission to view this maintenance ticket.'
              : 'The requested maintenance ticket does not exist or has been removed.'
          }
          action={{
            label: `Back to ${parentLabel}`,
            href: parentHref,
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
          { label: parentLabel, href: parentHref },
          { label: ticket.ticketNumber },
        ]}
      />

      <MaintenanceDetails ticket={ticket} onRefresh={loadTicket} />
    </div>
  );
}
