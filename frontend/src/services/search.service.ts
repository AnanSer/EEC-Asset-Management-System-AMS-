/**
 * Search Service — EEC EAMS
 * Handles global search queries across Assets, Employees, Departments, and Maintenance Tickets.
 */

import apiClient from '../lib/axios';

export interface SearchAssetItem {
  id: string;
  assetCode: string;
  name: string;
  serialNumber: string;
  category: string;
  status: string;
  condition: string;
  departmentName?: string;
}

export interface SearchEmployeeItem {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  departmentName?: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface SearchDepartmentItem {
  id: string;
  departmentCode: string;
  departmentName: string;
  location?: string;
  isActive: boolean;
}

export interface SearchMaintenanceItem {
  id: string;
  ticketNumber: string;
  title: string;
  assetName: string;
  employeeName: string;
  status: string;
  priority: string;
}

export interface GlobalSearchResults {
  assets: SearchAssetItem[];
  employees: SearchEmployeeItem[];
  departments: SearchDepartmentItem[];
  maintenance: SearchMaintenanceItem[];
}

export interface SearchApiResponse {
  success: boolean;
  data: GlobalSearchResults;
}

export const searchService = {
  /**
   * GET /api/search?q= — global system search
   */
  async globalSearch(q: string): Promise<GlobalSearchResults> {
    if (!q || q.trim().length < 2) {
      return {
        assets: [],
        employees: [],
        departments: [],
        maintenance: [],
      };
    }
    const res = await apiClient.get<SearchApiResponse>('/search', {
      params: { q: q.trim() },
    });
    return res.data.data;
  },
};

export default searchService;
