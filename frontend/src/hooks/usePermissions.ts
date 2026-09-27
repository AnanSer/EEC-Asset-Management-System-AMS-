/**
 * EEC EAMS – usePermissions Hook (Phase 9D.1)
 * Provides current user role, convenience boolean flags, and permission checks.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ROLES,
  type Role,
  type Permission,
  can as checkPermission,
} from '@/lib/authorization';
import { fetchAuthSession } from '@/context/AuthSessionContext';

export interface UsePermissionsReturn {
  role: Role | null;
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isTechnician: boolean;
  isDepartmentManager: boolean;
  isEmployee: boolean;
  refetch: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRole = useCallback(async (force = false) => {
    try {
      const session = await fetchAuthSession(force);
      const businessRole = session?.businessUser?.role as Role | undefined;
      if (businessRole && (Object.values(ROLES) as Role[]).includes(businessRole)) {
        setRole(businessRole);
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRole(false);
  }, [fetchRole]);

  const can = useCallback(
    (permission: Permission): boolean => {
      return checkPermission(role, permission);
    },
    [role]
  );

  return {
    role,
    isLoading,
    can,
    isAdmin: role === ROLES.ADMIN,
    isTechnician: role === ROLES.IT_TECHNICIAN,
    isDepartmentManager: role === ROLES.DEPARTMENT_MANAGER,
    isEmployee: role === ROLES.EMPLOYEE,
    refetch: fetchRole,
  };
}

export default usePermissions;
