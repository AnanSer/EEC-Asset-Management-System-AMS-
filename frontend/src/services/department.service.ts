/**
 * Department Service — EEC EAMS (Phase 10B.5 Optimized)
 * Handles API communication with Express backend /api/departments endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentQueryParams,
  DepartmentsResponse,
  DepartmentResponse,
} from '../constants/departments';

export function invalidateDepartmentCaches() {
  appDataCache.invalidateEntity('departments');
}

export const departmentService = {
  /**
   * GET /api/departments — list departments with search, status filter, and pagination
   */
  async getAll(params?: DepartmentQueryParams, forceRefresh = false): Promise<DepartmentsResponse> {
    const key = `departments:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<DepartmentsResponse>('/departments', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/departments/:id — retrieve single department with employee and asset counts
   */
  async getById(id: string, forceRefresh = false): Promise<DepartmentResponse> {
    const key = `departments:${id}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<DepartmentResponse>(`/departments/${id}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/departments — create a new department
   */
  async create(data: CreateDepartmentInput): Promise<DepartmentResponse> {
    const res = await apiClient.post<DepartmentResponse>('/departments', data);
    invalidateDepartmentCaches();
    return res.data;
  },

  /**
   * PUT /api/departments/:id — update existing department
   */
  async update(id: string, data: UpdateDepartmentInput): Promise<DepartmentResponse> {
    const res = await apiClient.put<DepartmentResponse>(`/departments/${id}`, data);
    invalidateDepartmentCaches();
    return res.data;
  },

  /**
   * PATCH /api/departments/:id/status — soft activate or deactivate
   */
  async updateStatus(id: string, isActive: boolean): Promise<DepartmentResponse> {
    const res = await apiClient.patch<DepartmentResponse>(`/departments/${id}/status`, { isActive });
    invalidateDepartmentCaches();
    return res.data;
  },

  /**
   * Invalidate department caches manually
   */
  invalidateCache() {
    invalidateDepartmentCaches();
  },
};

export default departmentService;
