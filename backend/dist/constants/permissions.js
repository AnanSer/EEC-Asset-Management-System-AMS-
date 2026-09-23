"use strict";
/**
 * EEC EAMS – Centralized Permissions Definition (Phase 9D.0)
 * Granular permissions grouped by business module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = void 0;
const roles_1 = require("./roles");
exports.PERMISSIONS = {
    // departments: view, create, update
    DEPARTMENTS_VIEW: 'departments:view',
    DEPARTMENTS_CREATE: 'departments:create',
    DEPARTMENTS_UPDATE: 'departments:update',
    // employees: view, create, update
    EMPLOYEES_VIEW: 'employees:view',
    EMPLOYEES_CREATE: 'employees:create',
    EMPLOYEES_UPDATE: 'employees:update',
    // assets: view, create, update, assign
    ASSETS_VIEW: 'assets:view',
    ASSETS_CREATE: 'assets:create',
    ASSETS_UPDATE: 'assets:update',
    ASSETS_ASSIGN: 'assets:assign',
    // maintenance: view, create, update
    MAINTENANCE_VIEW: 'maintenance:view',
    MAINTENANCE_CREATE: 'maintenance:create',
    MAINTENANCE_UPDATE: 'maintenance:update',
    // reports: view
    REPORTS_VIEW: 'reports:view',
    // identity: approve, reject
    IDENTITY_APPROVE: 'identity:approve',
    IDENTITY_REJECT: 'identity:reject',
    // settings: view, update
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_UPDATE: 'settings:update',
};
/**
 * Role-to-Permissions Mapping for Backend RBAC
 */
exports.ROLE_PERMISSIONS = {
    [roles_1.ROLES.ADMIN]: Object.values(exports.PERMISSIONS),
    [roles_1.ROLES.IT_TECHNICIAN]: [
        exports.PERMISSIONS.DEPARTMENTS_VIEW,
        exports.PERMISSIONS.EMPLOYEES_VIEW,
        exports.PERMISSIONS.ASSETS_VIEW,
        exports.PERMISSIONS.ASSETS_CREATE,
        exports.PERMISSIONS.ASSETS_UPDATE,
        exports.PERMISSIONS.ASSETS_ASSIGN,
        exports.PERMISSIONS.MAINTENANCE_VIEW,
        exports.PERMISSIONS.MAINTENANCE_CREATE,
        exports.PERMISSIONS.MAINTENANCE_UPDATE,
        exports.PERMISSIONS.REPORTS_VIEW,
        exports.PERMISSIONS.SETTINGS_VIEW,
    ],
    [roles_1.ROLES.DEPARTMENT_MANAGER]: [
        exports.PERMISSIONS.DEPARTMENTS_VIEW,
        exports.PERMISSIONS.EMPLOYEES_VIEW,
        exports.PERMISSIONS.ASSETS_VIEW,
        exports.PERMISSIONS.MAINTENANCE_VIEW,
        exports.PERMISSIONS.MAINTENANCE_CREATE,
        exports.PERMISSIONS.REPORTS_VIEW,
        exports.PERMISSIONS.SETTINGS_VIEW,
    ],
    [roles_1.ROLES.EMPLOYEE]: [
        exports.PERMISSIONS.DEPARTMENTS_VIEW,
        exports.PERMISSIONS.EMPLOYEES_VIEW,
        exports.PERMISSIONS.ASSETS_VIEW,
        exports.PERMISSIONS.MAINTENANCE_VIEW,
        exports.PERMISSIONS.MAINTENANCE_CREATE,
        exports.PERMISSIONS.SETTINGS_VIEW,
    ],
};
//# sourceMappingURL=permissions.js.map