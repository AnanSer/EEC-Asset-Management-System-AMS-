import { Asset, AssetCondition } from './assets';

export type ReturnRequestStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export const RETURN_STATUS_LABELS: Record<ReturnRequestStatus, string> = {
  PENDING: 'Pending Store Receipt',
  RECEIVED: 'Received (In Store)',
  CANCELLED: 'Cancelled',
};

export const RETURN_STATUS_COLORS: Record<
  ReturnRequestStatus,
  { bg: string; text: string; border: string }
> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  RECEIVED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  CANCELLED: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

export const COMMON_RETURN_LOCATIONS = [
  'ICT Asset Store',
  'Main Warehouse',
  'Engineering Store',
  'ICT Directorate',
  'Central Archive & Records Store',
  'Kality Testing & Logistics Center',
  'Bole Sub-Office Store',
] as const;

export interface ReturnEmployee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  phone?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

export interface AssetReturnRequest {
  id: string;
  requestNumber: string;
  requesterId: string;
  requester: ReturnEmployee;
  assetId: string;
  asset: Asset;
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  status: ReturnRequestStatus;
  reason: string;
  requestedAt: string;

  receivedById?: string | null;
  receivedBy?: {
    id: string;
    email: string;
    role?: string;
    employeeProfile?: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  receivedAt?: string | null;
  conditionOnReturn?: AssetCondition | string | null;
  returnLocation?: string | null;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnRequestInput {
  assetId: string;
  reason: string;
  notes?: string;
}

export interface ReceiveReturnInput {
  conditionOnReturn?: AssetCondition;
  returnLocation: string;
  notes?: string;
}

export interface WalkInReturnInput {
  assetId: string;
  conditionOnReturn: AssetCondition;
  returnLocation: string;
  notes?: string;
}

export interface ReturnQuery {
  status?: ReturnRequestStatus;
  departmentId?: string;
  requesterId?: string;
  assetId?: string;
  search?: string;
  personal?: boolean;
  page?: number;
  limit?: number;
}

export interface AssetReturnsResponse {
  success: boolean;
  data: AssetReturnRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AssetReturnResponse {
  success: boolean;
  message?: string;
  data: AssetReturnRequest;
}
