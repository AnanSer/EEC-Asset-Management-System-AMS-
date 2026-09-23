/**
 * EEC EAMS – Resource Ownership Authorization Helpers (Phase 9D.3)
 * Centralizes granular ownership and department boundary checks for:
 * - Employees
 * - Departments
 * - Assets
 * - Maintenance Tickets
 */

import { ROLES, type Role } from '../../constants';

export interface AuthUserContext {
  userId: string;
  role: Role | string;
  departmentId?: string | null;
  employeeProfileId?: string | null;
  employeeId?: string | null;
  name?: string | null;
}

export interface EmployeeAccessTarget {
  id?: string;
  userId?: string | null;
  employeeId?: string | null;
  departmentId?: string | null;
}

export interface AssetAccessTarget {
  id?: string;
  departmentId?: string | null;
  assignments?: Array<{
    employeeId?: string;
    isCurrent?: boolean;
    employee?: {
      id?: string;
      userId?: string;
      employeeId?: string;
    };
  }>;
  currentAssignment?: {
    employeeId?: string;
    employee?: {
      id?: string;
      userId?: string;
      employeeId?: string;
    };
  } | null;
  assignedToEmployeeId?: string | null;
}

export interface MaintenanceTicketAccessTarget {
  id?: string;
  departmentId?: string | null;
  reportedBy?: string | null;
  reportedByUserId?: string | null;
  reportedByEmployeeId?: string | null;
  asset?: {
    id?: string;
    departmentId?: string | null;
    currentHolder?: {
      id?: string;
      employeeId?: string;
      fullName?: string;
    } | null;
    assignments?: Array<{
      employeeId?: string;
      isCurrent?: boolean;
      employee?: {
        id?: string;
        userId?: string;
        employeeId?: string;
      };
    }>;
  } | null;
}

/**
 * Validates access to an Employee Profile resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> employee.departmentId === manager.departmentId
 * - EMPLOYEE -> employee.userId === auth.userId
 */
export function canAccessEmployee(
  auth: AuthUserContext,
  employee: EmployeeAccessTarget
): boolean {
  if (!auth) return false;

  const role = auth.role as Role;

  // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
  if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN) {
    return true;
  }

  // Rule 3: DEPARTMENT_MANAGER can only access employees in their department
  if (role === ROLES.DEPARTMENT_MANAGER) {
    if (!auth.departmentId || !employee.departmentId) return false;
    return auth.departmentId === employee.departmentId;
  }

  // Rule 4: EMPLOYEE can only access their own profile
  if (role === ROLES.EMPLOYEE) {
    if (employee.userId && auth.userId) {
      return employee.userId === auth.userId;
    }
    if (employee.id && auth.employeeProfileId) {
      return employee.id === auth.employeeProfileId;
    }
    if (employee.employeeId && auth.employeeId) {
      return employee.employeeId === auth.employeeId;
    }
    return false;
  }

  return false;
}

/**
 * Validates access to a Department resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> own department only
 * - EMPLOYEE -> own department only
 */
export function canAccessDepartment(
  auth: AuthUserContext,
  departmentId: string | null | undefined
): boolean {
  if (!auth) return false;

  const role = auth.role as Role;

  // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
  if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN) {
    return true;
  }

  if (!departmentId || !auth.departmentId) {
    return false;
  }

  // Rules 3 & 4: DEPARTMENT_MANAGER & EMPLOYEE can only access own department
  if (role === ROLES.DEPARTMENT_MANAGER || role === ROLES.EMPLOYEE) {
    return auth.departmentId === departmentId;
  }

  return false;
}

/**
 * Validates access to an Asset resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> asset.departmentId === manager.departmentId
 * - EMPLOYEE -> currently assigned asset only
 */
/**
 * Helper to check if an asset is currently assigned to the authenticated user.
 */
function isAssetAssignedToAuthUser(
  auth: AuthUserContext,
  asset?: AssetAccessTarget | MaintenanceTicketAccessTarget['asset'] | null
): boolean {
  if (!asset || !auth) return false;

  // Direct assignedToEmployeeId
  if ('assignedToEmployeeId' in asset && asset.assignedToEmployeeId && auth.employeeProfileId) {
    if (asset.assignedToEmployeeId === auth.employeeProfileId) return true;
  }

  // currentHolder (from formatTicket)
  if ('currentHolder' in asset && asset.currentHolder) {
    if (auth.employeeProfileId && asset.currentHolder.id === auth.employeeProfileId) return true;
    if (auth.employeeId && asset.currentHolder.employeeId === auth.employeeId) return true;
    if (auth.name && asset.currentHolder.fullName?.toLowerCase().includes(auth.name.toLowerCase())) return true;
  }

  // currentAssignment object
  if ('currentAssignment' in asset && asset.currentAssignment) {
    const ca = asset.currentAssignment;
    if (ca.employeeId && auth.employeeProfileId && ca.employeeId === auth.employeeProfileId) return true;
    if (ca.employee?.userId && auth.userId && ca.employee.userId === auth.userId) return true;
    if (ca.employee?.employeeId && auth.employeeId && ca.employee.employeeId === auth.employeeId) return true;
  }

  // assignments array
  if (Array.isArray(asset.assignments)) {
    const isAssigned = asset.assignments.some((assignment) => {
      if (assignment.isCurrent === false) return false;
      if (assignment.employeeId && auth.employeeProfileId && assignment.employeeId === auth.employeeProfileId) return true;
      if (assignment.employee?.userId && auth.userId && assignment.employee.userId === auth.userId) return true;
      if (assignment.employee?.employeeId && auth.employeeId && assignment.employee.employeeId === auth.employeeId) return true;
      return false;
    });
    if (isAssigned) return true;
  }

  return false;
}

/**
 * Helper to check if a maintenance ticket was reported by the authenticated user.
 */
function isReportedByAuthUser(
  auth: AuthUserContext,
  ticket: MaintenanceTicketAccessTarget
): boolean {
  if (!auth || !ticket) return false;

  if (ticket.reportedByUserId && auth.userId && ticket.reportedByUserId === auth.userId) {
    return true;
  }
  if (ticket.reportedByEmployeeId && auth.employeeProfileId && ticket.reportedByEmployeeId === auth.employeeProfileId) {
    return true;
  }
  if (ticket.reportedBy) {
    if (auth.userId && ticket.reportedBy === auth.userId) return true;
    if (auth.employeeId && ticket.reportedBy === auth.employeeId) return true;
    if (auth.employeeProfileId && ticket.reportedBy === auth.employeeProfileId) return true;
    if (auth.name && ticket.reportedBy.toLowerCase().includes(auth.name.toLowerCase())) return true;
  }

  return false;
}

/**
 * Validates access to an Asset resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> asset in own department OR own assigned asset
 * - EMPLOYEE -> currently assigned asset only
 */
export function canAccessAsset(
  auth: AuthUserContext,
  asset: AssetAccessTarget
): boolean {
  if (!auth) return false;

  const role = auth.role as Role;

  // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
  if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN) {
    return true;
  }

  // Rule 3: DEPARTMENT_MANAGER -> asset in own department OR own assigned asset
  if (role === ROLES.DEPARTMENT_MANAGER) {
    if (auth.departmentId && asset.departmentId && auth.departmentId === asset.departmentId) {
      return true;
    }
    if (isAssetAssignedToAuthUser(auth, asset)) {
      return true;
    }
    return false;
  }

  // Rule 4: EMPLOYEE -> currently assigned asset only
  if (role === ROLES.EMPLOYEE) {
    return isAssetAssignedToAuthUser(auth, asset);
  }

  return false;
}

/**
 * Validates access to a Maintenance Ticket resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> ticket in own department OR own assigned asset OR reported by manager
 * - EMPLOYEE -> ticket reported by employee OR ticket asset currently assigned to employee
 */
export function canAccessMaintenanceTicket(
  auth: AuthUserContext,
  ticket: MaintenanceTicketAccessTarget
): boolean {
  if (!auth) return false;

  const role = auth.role as Role;

  // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
  if (role === ROLES.ADMIN || role === ROLES.IT_TECHNICIAN) {
    return true;
  }

  // Rule 3: DEPARTMENT_MANAGER -> department ticket OR own assigned asset OR reported by manager
  if (role === ROLES.DEPARTMENT_MANAGER) {
    const ticketDept = ticket.departmentId || ticket.asset?.departmentId;
    if (auth.departmentId && ticketDept && auth.departmentId === ticketDept) {
      return true;
    }
    if (isAssetAssignedToAuthUser(auth, ticket.asset)) {
      return true;
    }
    if (isReportedByAuthUser(auth, ticket)) {
      return true;
    }
    return false;
  }

  // Rule 4: EMPLOYEE -> reported by employee OR ticket asset currently assigned to employee
  if (role === ROLES.EMPLOYEE) {
    if (isReportedByAuthUser(auth, ticket)) {
      return true;
    }
    if (isAssetAssignedToAuthUser(auth, ticket.asset)) {
      return true;
    }
    return false;
  }

  return false;
}
