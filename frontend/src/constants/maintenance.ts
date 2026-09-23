export type IssueCategory =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'PRINTER'
  | 'NETWORK'
  | 'POWER_UPS'
  | 'OTHER';

export type MaintenancePriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type MaintenanceStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'TESTING'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type InspectionResult = 'PASS' | 'FAIL';

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  HARDWARE: 'Hardware Failure',
  SOFTWARE: 'Software / OS',
  PRINTER: 'Printer / Copier',
  NETWORK: 'Network / Connectivity',
  POWER_UPS: 'Power / UPS',
  OTHER: 'General Maintenance',
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  TESTING: 'In Testing',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
};

export interface InspectionTest {
  id: string;
  ticketId: string;
  testType: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'NEEDS_REPAIR';
  testedBy: string;
  testDate: string;
  findings?: string | null;
  notes?: string | null;
  recommendations?: string | null;
  recommendedAction?: string | null;
  passed: boolean;
  result: InspectionResult;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  assetId: string;
  category: IssueCategory | string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  cost?: number | null;
  startDate?: string | null;
  completedDate?: string | null;
  reportedBy?: string | null;
  assignedTechnician?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
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
    currentHolder?: {
      id: string;
      employeeId: string;
      fullName: string;
      departmentName?: string | null;
    } | null;
  } | null;
  inspectionTests?: InspectionTest[];
  latestInspection?: InspectionTest | null;
}

export interface CreateMaintenanceInput {
  assetId: string;
  category: IssueCategory;
  priority: MaintenancePriority;
  description: string;
  reportedBy: string;
  assignedTechnician: string;
  cost?: number | null;
  startDate?: string | null;
  status?: MaintenanceStatus;
  resolutionNotes?: string | null;
}

export interface UpdateMaintenanceInput {
  category?: IssueCategory;
  priority?: MaintenancePriority;
  description?: string;
  reportedBy?: string;
  assignedTechnician?: string;
  cost?: number | null;
  startDate?: string | null;
  completedDate?: string | null;
  status?: MaintenanceStatus;
  resolutionNotes?: string | null;
}

export interface UpdateMaintenanceStatusInput {
  status: MaintenanceStatus;
  resolutionNotes?: string | null;
}

export interface CreateInspectionInput {
  ticketId: string;
  testedBy: string;
  testDate?: string | null;
  result: InspectionResult;
  findings?: string | null;
  recommendations?: string | null;
  autoComplete?: boolean;
}

export interface MaintenanceQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  technician?: string;
  assetId?: string;
  personal?: boolean;
  page?: number;
  limit?: number;
}

export interface MaintenanceStats {
  openTickets: number;
  inProgress: number;
  testing: number;
  completedThisMonth: number;
  recentTickets: MaintenanceTicket[];
}
