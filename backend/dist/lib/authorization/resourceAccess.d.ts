/**
 * EEC EAMS – Resource Ownership Authorization Helpers (Phase 9D.3)
 * Centralizes granular ownership and department boundary checks for:
 * - Employees
 * - Departments
 * - Assets
 * - Maintenance Tickets
 */
import { type Role } from '../../constants';
export interface AuthUserContext {
    userId: string;
    role: Role | string;
    departmentId?: string | null;
    employeeProfileId?: string | null;
    employeeId?: string | null;
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
        departmentId?: string | null;
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
export declare function canAccessEmployee(auth: AuthUserContext, employee: EmployeeAccessTarget): boolean;
/**
 * Validates access to a Department resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> own department only
 * - EMPLOYEE -> own department only
 */
export declare function canAccessDepartment(auth: AuthUserContext, departmentId: string | null | undefined): boolean;
/**
 * Validates access to an Asset resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> asset.departmentId === manager.departmentId
 * - EMPLOYEE -> currently assigned asset only
 */
export declare function canAccessAsset(auth: AuthUserContext, asset: AssetAccessTarget): boolean;
/**
 * Validates access to a Maintenance Ticket resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> ticket.departmentId === manager.departmentId (or asset department)
 * - EMPLOYEE -> reportedByUserId === auth.userId
 */
export declare function canAccessMaintenanceTicket(auth: AuthUserContext, ticket: MaintenanceTicketAccessTarget): boolean;
//# sourceMappingURL=resourceAccess.d.ts.map