import { AssetCategory, Asset, AssetCondition } from './assets';

export type RequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'FULFILLED'
  | 'CANCELLED';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved (Awaiting Handover)',
  REJECTED: 'Rejected',
  FULFILLED: 'Fulfilled (Assigned)',
  CANCELLED: 'Cancelled',
};

export const REQUEST_STATUS_COLORS: Record<
  RequestStatus,
  { bg: string; text: string; border: string }
> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  APPROVED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  REJECTED: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  FULFILLED: {
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

export interface RequestEmployee {
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

export interface AssetRequest {
  id: string;
  requestNumber: string;
  requesterId: string;
  requester: RequestEmployee;
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  category: AssetCategory;
  description: string;
  notes?: string | null;
  status: RequestStatus;

  approvedById?: string | null;
  approvedBy?: { id: string; email: string } | null;
  approvedAt?: string | null;
  approvalRemarks?: string | null;

  rejectedById?: string | null;
  rejectedBy?: { id: string; email: string } | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;

  fulfilledById?: string | null;
  fulfilledBy?: { id: string; email: string } | null;
  fulfilledAt?: string | null;
  assetId?: string | null;
  asset?: Asset | null;
  handoverNotes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequestInput {
  category: AssetCategory;
  description: string;
  notes?: string;
}

export interface ApproveAssetRequestInput {
  approvalRemarks?: string;
}

export interface RejectAssetRequestInput {
  rejectionReason: string;
}

export interface FulfillAssetRequestInput {
  assetId: string;
  handoverNotes?: string;
  conditionOnAssign?: AssetCondition;
}

export interface AssetRequestQuery {
  status?: RequestStatus;
  category?: AssetCategory;
  departmentId?: string;
  requesterId?: string;
  search?: string;
  personal?: boolean;
  page?: number;
  limit?: number;
}

export interface AssetRequestsResponse {
  success: boolean;
  data: AssetRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AssetRequestResponse {
  success: boolean;
  message?: string;
  data: AssetRequest;
}
