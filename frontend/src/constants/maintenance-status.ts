/**
 * Maintenance request/ticket statuses for EEC EAMS.
 * Values will be populated in Phase 2.
 */

export enum MaintenanceStatus {
  OPEN        = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD     = 'ON_HOLD',
  COMPLETED   = 'COMPLETED',
  CANCELLED   = 'CANCELLED',
}

export const MAINTENANCE_STATUSES: MaintenanceStatus[] = [];

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.OPEN]:        'Open',
  [MaintenanceStatus.IN_PROGRESS]: 'In Progress',
  [MaintenanceStatus.ON_HOLD]:     'On Hold',
  [MaintenanceStatus.COMPLETED]:   'Completed',
  [MaintenanceStatus.CANCELLED]:   'Cancelled',
};
