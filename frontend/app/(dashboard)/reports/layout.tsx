'use client';

import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard permission={PERMISSIONS.REPORTS_VIEW}>
      {children}
    </PermissionGuard>
  );
}
