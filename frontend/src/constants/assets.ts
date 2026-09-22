export type AssetCategory =
  | 'LAPTOP' | 'DESKTOP' | 'PRINTER' | 'SCANNER'
  | 'ROUTER' | 'SWITCH' | 'PROJECTOR' | 'MONITOR'
  | 'SERVER' | 'UPS' | 'OTHER';

export type AssetStatus =
  | 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'TESTING' | 'RETIRED' | 'DISPOSED';

export type AssetCondition =
  | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR' | 'DAMAGED' | 'RETIRED';

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop',
  PRINTER: 'Printer',
  SCANNER: 'Scanner',
  ROUTER: 'Router',
  SWITCH: 'Switch',
  PROJECTOR: 'Projector',
  MONITOR: 'Monitor',
  SERVER: 'Server',
  UPS: 'UPS',
  OTHER: 'Other',
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  MAINTENANCE: 'Maintenance',
  TESTING: 'Testing',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed',
};

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  NEEDS_REPAIR: 'Needs Repair',
  DAMAGED: 'Damaged',
  RETIRED: 'Retired',
};

export interface AssetDepartment {
  id: string;
  name: string;
  code: string;
  officeLocation?: string | null;
  building?: string | null;
  floor?: string | null;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  brand?: string | null;
  model?: string | null;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  departmentId?: string | null;
  department?: AssetDepartment | null;
  location?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyExpiry?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignments?: number;
    maintenanceTickets?: number;
  };
  currentAssignment?: {
    id: string;
    employeeId?: string;
    employeeBadgeId?: string;
    employeeName: string;
    departmentName?: string | null;
    assignedDate: string;
    remarks?: string | null;
  } | null;
}

export interface CreateAssetInput {
  assetCode: string;
  name: string;
  category: AssetCategory;
  brand?: string | null;
  model?: string | null;
  serialNumber: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  departmentId?: string | null;
  location?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyExpiry?: string | null;
  notes?: string | null;
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {}

export interface AssetQuery {
  search?: string;
  category?: string;
  status?: string;
  condition?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface AssetsResponse {
  success: boolean;
  data: Asset[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AssetResponse {
  success: boolean;
  message?: string;
  data: Asset;
}
