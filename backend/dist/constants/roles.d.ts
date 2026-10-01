/**
 * EEC EAMS – Centralized Roles Definition (Phase 9D.0)
 * Standardized system roles for the EEC Asset Management System.
 */
export declare const ROLES: {
    readonly ADMIN: 'ADMIN';
    readonly IT_TECHNICIAN: 'IT_TECHNICIAN';
    readonly DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER';
    readonly EMPLOYEE: 'EMPLOYEE';
    readonly STORE_KEEPER: 'STORE_KEEPER';
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const ROLE_LIST: readonly ["ADMIN", "IT_TECHNICIAN", "DEPARTMENT_MANAGER", "EMPLOYEE", "STORE_KEEPER"];
//# sourceMappingURL=roles.d.ts.map