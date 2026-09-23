/**
 * EEC EAMS – Frontend Permission Checker (Phase 9D.0)
 * Reusable helper: can(userRole, permission)
 */

import { type Role } from './roles';
import { type Permission, ROLE_PERMISSIONS } from './permissions';

/**
 * Checks whether a given user role has the requested permission.
 *
 * @param userRole - Role string or undefined/null
 * @param permission - Permission key to verify
 * @returns boolean
 */
export function can(userRole: Role | string | undefined | null, permission: Permission): boolean {
  if (!userRole) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole as Role];
  if (!rolePermissions) return false;
  return rolePermissions.includes(permission);
}
