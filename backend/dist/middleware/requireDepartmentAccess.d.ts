/**
 * EEC EAMS – Department Access Authorization Middleware (Phase 9D.2)
 * Reusable middleware enforcing department boundaries:
 * - ADMIN: bypasses
 * - IT_TECHNICIAN: bypasses
 * - DEPARTMENT_MANAGER: can only access resources from their own department
 * - EMPLOYEE: can only access their own profile/resources
 */
import { Request, Response, NextFunction } from 'express';
export interface DepartmentAccessOptions {
    departmentIdParam?: string;
    employeeIdParam?: string;
}
export declare function requireDepartmentAccess(options?: DepartmentAccessOptions): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export default requireDepartmentAccess;
//# sourceMappingURL=requireDepartmentAccess.d.ts.map