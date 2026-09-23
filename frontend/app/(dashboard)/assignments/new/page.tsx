'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import AssignmentForm from '@/components/assignments/AssignmentForm';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

function AssignmentFormContent() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  const employeeId = searchParams.get('employeeId') || undefined;

  return (
    <AssignmentForm
      preselectedAssetId={assetId}
      preselectedEmployeeId={employeeId}
    />
  );
}

export default function NewAssignmentPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.ASSETS_ASSIGN}>
      <div className="space-y-6">
        <PageHeader
          title="New Asset Assignment"
          description="Assign an available corporate asset to an authorized EEC staff member."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assignments', href: '/assignments' },
            { label: 'New Assignment' },
          ]}
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <AssignmentFormContent />
        </Suspense>
      </div>
    </PermissionGuard>
  );
}
