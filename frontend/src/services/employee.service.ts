/**
 * Employee Service — EEC EAMS
 * Handles API communication with Express backend /api/employees endpoints.
 */

import apiClient from '../lib/axios';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeQuery,
  EmployeesResponse,
  EmployeeResponse,
} from '../constants/employees';

export const employeeService = {
  /**
   * GET /api/employees — list employees with search, department, role, status & pagination
   */
  async getAll(params?: EmployeeQuery): Promise<EmployeesResponse> {
    const res = await apiClient.get<EmployeesResponse>('/employees', { params });
    return res.data;
  },

  /**
   * GET /api/employees/:id — retrieve single employee with profile, user, department & counts
   */
  async getById(id: string): Promise<EmployeeResponse> {
    const res = await apiClient.get<EmployeeResponse>(`/employees/${id}`);
    return res.data;
  },

  /**
   * POST /api/employees — create a new employee with User and EmployeeProfile
   */
  async create(data: CreateEmployeeInput): Promise<EmployeeResponse> {
    const res = await apiClient.post<EmployeeResponse>('/employees', data);
    return res.data;
  },

  /**
   * PUT /api/employees/:id — update existing employee
   */
  async update(id: string, data: UpdateEmployeeInput): Promise<EmployeeResponse> {
    const res = await apiClient.put<EmployeeResponse>(`/employees/${id}`, data);
    return res.data;
  },

  /**
   * PATCH /api/employees/:id/status — activate or deactivate employee
   */
  async updateStatus(id: string, isActive: boolean): Promise<EmployeeResponse> {
    const res = await apiClient.patch<EmployeeResponse>(`/employees/${id}/status`, { isActive });
    return res.data;
  },
};

export default employeeService;
