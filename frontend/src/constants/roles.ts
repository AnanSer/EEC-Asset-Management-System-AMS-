/**
 * User roles for EEC EAMS.
 * Cleaned and standardized in Phase 4.1.
 */

export enum Role {
  ADMIN = 'ADMIN',
  IT_TECHNICIAN = 'IT_TECHNICIAN',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export const ROLES: Role[] = [
  Role.ADMIN,
  Role.IT_TECHNICIAN,
  Role.DEPARTMENT_MANAGER,
  Role.EMPLOYEE,
];

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrator',
  [Role.IT_TECHNICIAN]: 'IT Technician',
  [Role.DEPARTMENT_MANAGER]: 'Department Manager',
  [Role.EMPLOYEE]: 'Employee',
};
