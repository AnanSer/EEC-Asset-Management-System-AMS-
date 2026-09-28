/**
 * Employee Service — EEC EAMS (Phase 10B.5 Optimized)
 * Handles API communication with Express backend /api/employees endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeQuery,
  EmployeesResponse,
  EmployeeResponse,
} from '../constants/employees';

export function invalidateEmployeeCaches() {
  appDataCache.invalidateEntity('employees');
}

export const employeeService = {
  /**
   * GET /api/employees — list employees with search, department, role, status & pagination
   * Served via SWR in-memory cache
   */
  async getAll(params?: EmployeeQuery, forceRefresh = false): Promise<EmployeesResponse> {
    const key = `employees:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<EmployeesResponse>('/employees', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/employees/:id — retrieve single employee with profile, user, department & counts
   */
  async getById(id: string, forceRefresh = false): Promise<EmployeeResponse> {
    const key = `employees:${id}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<EmployeeResponse>(`/employees/${id}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/employees — create a new employee with User and EmployeeProfile
   */
  async create(data: CreateEmployeeInput): Promise<EmployeeResponse> {
    const res = await apiClient.post<EmployeeResponse>('/employees', data);
    invalidateEmployeeCaches();
    return res.data;
  },

  /**
   * PUT /api/employees/:id — update existing employee
   */
  async update(id: string, data: UpdateEmployeeInput): Promise<EmployeeResponse> {
    const res = await apiClient.put<EmployeeResponse>(`/employees/${id}`, data);
    invalidateEmployeeCaches();
    return res.data;
  },

  /**
   * PATCH /api/employees/:id/status — activate or deactivate employee
   */
  async updateStatus(id: string, isActive: boolean): Promise<EmployeeResponse> {
    const res = await apiClient.patch<EmployeeResponse>(`/employees/${id}/status`, { isActive });
    invalidateEmployeeCaches();
    return res.data;
  },

  /**
   * Helper to invalidate cache manually
   */
  invalidateCache() {
    invalidateEmployeeCaches();
  },
};

export default employeeService;
