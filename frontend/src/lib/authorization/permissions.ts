/**
 * EEC EAMS – Centralized Permissions Definition (Phase 9D.0)
 * Granular permissions grouped by business module.
 */

import { ROLES, type Role } from './roles';

export const PERMISSIONS = {
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

  // testing: view, execute
  TESTING_VIEW: 'testing:view',
  TESTING_EXECUTE: 'testing:execute',

  // reports: view
  REPORTS_VIEW: 'reports:view',

  // identity: approve, reject
  IDENTITY_APPROVE: 'identity:approve',
  IDENTITY_REJECT: 'identity:reject',

  // settings: view, update
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',

  // asset requests: view, create, approve, reject, fulfill, cancel
  ASSET_REQUESTS_VIEW: 'asset_requests:view',
  ASSET_REQUESTS_CREATE: 'asset_requests:create',
  ASSET_REQUESTS_APPROVE: 'asset_requests:approve',
  ASSET_REQUESTS_REJECT: 'asset_requests:reject',
  ASSET_REQUESTS_FULFILL: 'asset_requests:fulfill',
  ASSET_REQUESTS_CANCEL: 'asset_requests:cancel',

  // asset returns: view, create, receive, cancel (Phase 11D)
  ASSET_RETURNS_VIEW: 'asset_returns:view',
  ASSET_RETURNS_CREATE: 'asset_returns:create',
  ASSET_RETURNS_RECEIVE: 'asset_returns:receive',
  ASSET_RETURNS_CANCEL: 'asset_returns:cancel',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role-to-Permissions Mapping for Frontend RBAC
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.IT_TECHNICIAN]: [
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.ASSETS_CREATE,
    PERMISSIONS.ASSETS_UPDATE,
    PERMISSIONS.ASSETS_ASSIGN,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_CREATE,
    PERMISSIONS.MAINTENANCE_UPDATE,
    PERMISSIONS.TESTING_VIEW,
    PERMISSIONS.TESTING_EXECUTE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_VIEW,
    PERMISSIONS.ASSET_RETURNS_VIEW,
    PERMISSIONS.ASSET_RETURNS_CREATE,
    PERMISSIONS.ASSET_RETURNS_CANCEL,
  ],
  [ROLES.DEPARTMENT_MANAGER]: [
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_CREATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_CREATE,
    PERMISSIONS.ASSET_REQUESTS_CANCEL,
    PERMISSIONS.ASSET_RETURNS_VIEW,
    PERMISSIONS.ASSET_RETURNS_CREATE,
    PERMISSIONS.ASSET_RETURNS_CANCEL,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_CREATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_CREATE,
    PERMISSIONS.ASSET_REQUESTS_CANCEL,
    PERMISSIONS.ASSET_RETURNS_VIEW,
    PERMISSIONS.ASSET_RETURNS_CREATE,
    PERMISSIONS.ASSET_RETURNS_CANCEL,
  ],
  [ROLES.STORE_KEEPER]: [
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_CREATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_VIEW,
    PERMISSIONS.ASSET_REQUESTS_FULFILL,
    PERMISSIONS.ASSET_RETURNS_VIEW,
    PERMISSIONS.ASSET_RETURNS_RECEIVE,
  ],
};
