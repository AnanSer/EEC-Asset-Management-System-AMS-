/**
 * EEC EAMS – PermissionGuard Component (Phase 9D.1)
 * Protects client components/pages by verifying current user permissions.
 * Redirects unauthorized users to /unauthorized or displays a custom fallback.
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Permission } from '@/lib/authorization';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/ui/AccessDenied';

export interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export function PermissionGuard({
  permission,
  children,
  fallback,
  redirectTo = '/unauthorized',
  showAccessDenied = false,
}: PermissionGuardProps) {
  const router = useRouter();
  const { can, isLoading } = usePermissions();

  const isAuthorized = can(permission);

  useEffect(() => {
    if (!isLoading && !isAuthorized && redirectTo && !fallback && !showAccessDenied) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthorized, redirectTo, fallback, showAccessDenied, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[200px]">
        <div className="w-8 h-8 border-4 border-eec-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    if (fallback) return <>{fallback}</>;
    if (showAccessDenied) {
      return <AccessDenied requiredPermission={permission} />;
    }
    return null;
  }

  return <>{children}</>;
}

export default PermissionGuard;
