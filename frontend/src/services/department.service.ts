/**
 * Department Service — EEC EAMS
 * Handles API communication with Express backend /api/departments endpoints.
 */

import apiClient from '../lib/axios';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentQueryParams,
  DepartmentsResponse,
  DepartmentResponse,
} from '../constants/departments';

export const departmentService = {
  /**
   * GET /api/departments — list departments with search, status filter, and pagination
   */
  async getAll(params?: DepartmentQueryParams): Promise<DepartmentsResponse> {
    const res = await apiClient.get<DepartmentsResponse>('/departments', { params });
    return res.data;
  },

  /**
   * GET /api/departments/:id — retrieve single department with employee and asset counts
   */
  async getById(id: string): Promise<DepartmentResponse> {
    const res = await apiClient.get<DepartmentResponse>(`/departments/${id}`);
    return res.data;
  },

  /**
   * POST /api/departments — create a new department
   */
  async create(data: CreateDepartmentInput): Promise<DepartmentResponse> {
    const res = await apiClient.post<DepartmentResponse>('/departments', data);
    return res.data;
  },

  /**
   * PUT /api/departments/:id — update existing department
   */
  async update(id: string, data: UpdateDepartmentInput): Promise<DepartmentResponse> {
    const res = await apiClient.put<DepartmentResponse>(`/departments/${id}`, data);
    return res.data;
  },

  /**
   * PATCH /api/departments/:id/status — soft activate or deactivate
   */
  async updateStatus(id: string, isActive: boolean): Promise<DepartmentResponse> {
    const res = await apiClient.patch<DepartmentResponse>(`/departments/${id}/status`, { isActive });
    return res.data;
  },
};

export default departmentService;
