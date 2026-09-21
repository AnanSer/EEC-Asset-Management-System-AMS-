/**
 * Asset lifecycle statuses for EEC EAMS.
 * Values will be populated in Phase 2.
 */

export enum AssetStatus {
  AVAILABLE    = 'AVAILABLE',
  ASSIGNED     = 'ASSIGNED',
  MAINTENANCE  = 'MAINTENANCE',
  TESTING      = 'TESTING',
  RETIRED      = 'RETIRED',
  DISPOSED     = 'DISPOSED',
}

export const ASSET_STATUSES: AssetStatus[] = [];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.AVAILABLE]:   'Available',
  [AssetStatus.ASSIGNED]:    'Assigned',
  [AssetStatus.MAINTENANCE]: 'Under Maintenance',
  [AssetStatus.TESTING]:     'Under Testing',
  [AssetStatus.RETIRED]:     'Retired',
  [AssetStatus.DISPOSED]:    'Disposed',
};
