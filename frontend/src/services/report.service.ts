/**
 * Report Service — EEC EAMS
 * Handles executive reports, analytics, and data export endpoints.
 */

import apiClient from '../lib/axios';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface DashboardReportMetrics {
  kpis: {
    totalAssets: number;
    assignedAssets: number;
    availableAssets: number;
    activeEmployees: number;
    totalDepartments: number;
    openMaintenanceTickets: number;
    assetsUnderTesting: number;
    warrantyExpiringSoon: number;
  };
  warrantySummary: {
    expiring30: number;
    expiring60: number;
    expiring90: number;
  };
  charts: {
    assetsByDepartment: Array<{
      departmentName: string;
      code: string;
      count: number;
    }>;
    assetsByCategory: Array<{
      category: string;
      count: number;
    }>;
    maintenanceByStatus: Array<{
      status: string;
      count: number;
    }>;
    maintenanceByPriority: Array<{
      priority: string;
      count: number;
    }>;
    monthlyMaintenance: Array<{
      month: string;
      count: number;
    }>;
  };
}

export interface AssetReportItem {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string;
  status: string;
  condition: string;
  location: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiry: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  assignedTo: {
    id: string;
    employeeId: string;
    fullName: string;
  } | null;
}

export interface EmployeeReportItem {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  jobTitle: string;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  isActive: boolean;
  assignedAssetsCount: number;
  assignedAssets: Array<{
    id: string;
    assetCode: string;
    name: string;
    category: string;
    status: string;
  }>;
}

export interface DepartmentReportItem {
  id: string;
  code: string;
  name: string;
  location: string;
  headOfDepartment: string;
  isActive: boolean;
  employeeCount: number;
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  maintenanceAssets: number;
  testingAssets: number;
}

export interface MaintenanceReportItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  cost: number | null;
  reportedBy: string;
  assignedTechnician: string;
  startDate: string | null;
  completedDate: string | null;
  createdAt: string;
  asset: {
    id: string;
    assetCode: string;
    name: string;
    category: string;
  } | null;
  inspectionStatus: string | null;
}

export interface WarrantyReportItem {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  serialNumber: string;
  status: string;
  condition: string;
  purchaseDate: string | null;
  warrantyExpiry: string;
  daysRemaining: number | null;
  urgency: 'EXPIRED' | 'CRITICAL_30' | 'MODERATE_60' | 'UPCOMING_90' | 'HEALTHY';
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface ReportMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedReportResponse<T, S = undefined> {
  success: boolean;
  data: T[];
  summary?: S;
  meta: ReportMeta;
  buckets?: {
    within30Days: number;
    within60Days: number;
    within90Days: number;
    expired: number;
  };
}

// ─── Service API ─────────────────────────────────────────────────────────────

export const reportService = {
  /**
   * GET /api/reports/dashboard — Executive KPI and 5 charts
   */
  async getDashboard(): Promise<DashboardReportMetrics> {
    const res = await apiClient.get<{ success: boolean; data: DashboardReportMetrics }>(
      '/reports/dashboard'
    );
    return res.data.data;
  },

  /**
   * GET /api/reports/assets — Asset inventory report
   */
  async getAssets(params?: Record<string, any>): Promise<PaginatedReportResponse<AssetReportItem, { totalValue: number }>> {
    const res = await apiClient.get<PaginatedReportResponse<AssetReportItem, { totalValue: number }>>(
      '/reports/assets',
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/reports/employees — Employee equipment report
   */
  async getEmployees(params?: Record<string, any>): Promise<PaginatedReportResponse<EmployeeReportItem>> {
    const res = await apiClient.get<PaginatedReportResponse<EmployeeReportItem>>(
      '/reports/employees',
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/reports/departments — Department asset allocation report
   */
  async getDepartments(params?: Record<string, any>): Promise<PaginatedReportResponse<DepartmentReportItem>> {
    const res = await apiClient.get<PaginatedReportResponse<DepartmentReportItem>>(
      '/reports/departments',
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/reports/maintenance — Maintenance & testing report
   */
  async getMaintenance(params?: Record<string, any>): Promise<PaginatedReportResponse<MaintenanceReportItem, { totalCost: number }>> {
    const res = await apiClient.get<PaginatedReportResponse<MaintenanceReportItem, { totalCost: number }>>(
      '/reports/maintenance',
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/reports/warranty — Warranty Center report
   */
  async getWarranty(params?: Record<string, any>): Promise<PaginatedReportResponse<WarrantyReportItem>> {
    const res = await apiClient.get<PaginatedReportResponse<WarrantyReportItem>>(
      '/reports/warranty',
      { params }
    );
    return res.data;
  },
};

export default reportService;
