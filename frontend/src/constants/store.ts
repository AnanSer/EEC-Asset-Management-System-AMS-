/**
 * Store Dashboard & Movement History Types — EEC EAMS (Phase 11E)
 */
import { AssetCategory, AssetStatus } from './assets';

export interface StoreKpis {
  availableAssets: number;
  assignedAssets: number;
  pendingHandovers: number;
  pendingReturns: number;
}

export type StoreActivityType = 'HANDOVER' | 'RETURN' | 'TRANSFER' | 'LOCATION_CHANGE' | 'ASSIGNMENT';

export interface StoreActivityItem {
  id: string;
  type: StoreActivityType;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: AssetCategory | string;
  employeeName: string;
  departmentName: string;
  location: string;
  timestamp: string;
  actorName: string;
  details: string;
}

export interface StoreDashboardData {
  kpis: StoreKpis;
  recentActivity: StoreActivityItem[];
}

export interface StoreDashboardResponse {
  success: boolean;
  data: StoreDashboardData;
  message?: string;
}

export type MovementEventType =
  | 'ASSIGNMENT'
  | 'TRANSFER'
  | 'RETURN'
  | 'MAINTENANCE'
  | 'TESTING'
  | 'LOCATION_CHANGE';

export interface AssetMovementEvent {
  id: string;
  type: MovementEventType;
  date: string;
  title: string;
  actorName?: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  employeeName?: string;
  departmentName?: string;
  location?: string;
  condition?: string | null;
  status?: string;
  details?: string | null;
}

export interface AssetMovementHistoryData {
  asset: {
    id: string;
    assetCode: string;
    name: string;
    category: AssetCategory | string;
    status: AssetStatus | string;
    location?: string | null;
  };
  events: AssetMovementEvent[];
}

export interface AssetMovementHistoryResponse {
  success: boolean;
  data: AssetMovementHistoryData;
  message?: string;
}
