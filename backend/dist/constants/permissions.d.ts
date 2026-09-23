/**
 * EEC EAMS – Centralized Permissions Definition (Phase 9D.0)
 * Granular permissions grouped by business module.
 */
import { type Role } from './roles';
export declare const PERMISSIONS: {
    readonly DEPARTMENTS_VIEW: 'departments:view';
    readonly DEPARTMENTS_CREATE: 'departments:create';
    readonly DEPARTMENTS_UPDATE: 'departments:update';
    readonly EMPLOYEES_VIEW: 'employees:view';
    readonly EMPLOYEES_CREATE: 'employees:create';
    readonly EMPLOYEES_UPDATE: 'employees:update';
    readonly ASSETS_VIEW: 'assets:view';
    readonly ASSETS_CREATE: 'assets:create';
    readonly ASSETS_UPDATE: 'assets:update';
    readonly ASSETS_ASSIGN: 'assets:assign';
    readonly MAINTENANCE_VIEW: 'maintenance:view';
    readonly MAINTENANCE_CREATE: 'maintenance:create';
    readonly MAINTENANCE_UPDATE: 'maintenance:update';
    readonly REPORTS_VIEW: 'reports:view';
    readonly IDENTITY_APPROVE: 'identity:approve';
    readonly IDENTITY_REJECT: 'identity:reject';
    readonly SETTINGS_VIEW: 'settings:view';
    readonly SETTINGS_UPDATE: 'settings:update';
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
/**
 * Role-to-Permissions Mapping for Backend RBAC
 */
export declare const ROLE_PERMISSIONS: Record<Role, readonly Permission[]>;
//# sourceMappingURL=permissions.d.ts.map