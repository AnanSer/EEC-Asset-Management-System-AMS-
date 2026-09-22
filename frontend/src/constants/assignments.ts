export interface AssignmentAsset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serialNumber: string;
  status: string;
  condition: string;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface AssignmentEmployee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  email?: string | null;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  asset: AssignmentAsset | null;
  employeeId: string;
  employee: AssignmentEmployee | null;
  assignedDate: string;
  returnedDate?: string | null;
  durationDays: number;
  conditionOnAssign?: string | null;
  conditionOnReturn?: string | null;
  isCurrent: boolean;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignAssetInput {
  assetId: string;
  employeeId: string;
  assignedDate?: string | null;
  conditionOnAssign?: string | null;
  remarks?: string | null;
}

export interface TransferAssetInput {
  newEmployeeId: string;
  transferDate?: string | null;
  conditionOnTransfer?: string | null;
  remarks?: string | null;
}

export interface ReturnAssetInput {
  returnDate?: string | null;
  conditionOnReturn?: string | null;
  remarks?: string | null;
}

export interface AssignmentQueryParams {
  search?: string;
  departmentId?: string;
  employeeId?: string;
  assetId?: string;
  isCurrent?: 'true' | 'false' | 'all';
  page?: number;
  limit?: number;
}

export interface AssignmentStats {
  availableAssets: number;
  assignedAssets: number;
  employeesWithAssets: number;
  totalAssignments: number;
  activeAssignments: number;
  returnedAssignments: number;
  recentAssignments: AssetAssignment[];
}
