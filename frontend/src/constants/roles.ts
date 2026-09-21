/**
 * User roles for EEC EAMS.
 * Business values will be added in Phase 2.
 */

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER',
}

export const ROLES: Role[] = [];

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]:       'Administrator',
  [Role.MANAGER]:     'Manager',
  [Role.EMPLOYEE]:    'Employee',
  [Role.VIEWER]:      'Viewer (Read-only)',
};
