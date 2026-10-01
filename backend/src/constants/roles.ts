/**
 * EEC EAMS – Centralized Roles Definition (Phase 9D.0)
 * Standardized system roles for the EEC Asset Management System.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  IT_TECHNICIAN: 'IT_TECHNICIAN',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  STORE_KEEPER: 'STORE_KEEPER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST = [
  ROLES.ADMIN,
  ROLES.IT_TECHNICIAN,
  ROLES.DEPARTMENT_MANAGER,
  ROLES.EMPLOYEE,
  ROLES.STORE_KEEPER,
] as const;
