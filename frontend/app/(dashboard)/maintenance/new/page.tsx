'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';

function MaintenanceFormContent() {
  const searchParams = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId') || undefined;

  return (
    <MaintenanceForm
      mode="create"
      preselectedAssetId={preselectedAssetId}
    />
  );
}

export default function NewMaintenanceTicketPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="New Maintenance Request"
        description="Submit a defect or failure ticket to initiate technical diagnosis and repair"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'New Request' },
        ]}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <MaintenanceFormContent />
      </Suspense>
    </div>
  );
}
