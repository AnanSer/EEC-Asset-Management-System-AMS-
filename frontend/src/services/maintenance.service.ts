/**
 * Maintenance Service — EEC EAMS
 * Handles API communication with Express backend /api/maintenance endpoints.
 */

import apiClient from '../lib/axios';
import {
  MaintenanceTicket,
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  UpdateMaintenanceStatusInput,
  MaintenanceQueryParams,
  MaintenanceStats,
} from '../constants/maintenance';

export interface MaintenanceListResponse {
  success: boolean;
  data: MaintenanceTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MaintenanceResponse {
  success: boolean;
  message?: string;
  data: MaintenanceTicket;
}

export interface MaintenanceStatsResponse {
  success: boolean;
  data: MaintenanceStats;
}

export const maintenanceService = {
  /**
   * GET /api/maintenance — list tickets with filters & pagination
   */
  async getAll(params?: MaintenanceQueryParams): Promise<MaintenanceListResponse> {
    const res = await apiClient.get<MaintenanceListResponse>('/maintenance', { params });
    return res.data;
  },

  /**
   * GET /api/maintenance/stats — aggregate stats & KPIs
   */
  async getStats(): Promise<MaintenanceStatsResponse> {
    const res = await apiClient.get<MaintenanceStatsResponse>('/maintenance/stats');
    return res.data;
  },

  /**
   * GET /api/maintenance/:id — single ticket by ID
   */
  async getById(id: string): Promise<MaintenanceResponse> {
    const res = await apiClient.get<MaintenanceResponse>(`/maintenance/${id}`);
    return res.data;
  },

  /**
   * POST /api/maintenance — create new ticket
   */
  async create(data: CreateMaintenanceInput): Promise<MaintenanceResponse> {
    const res = await apiClient.post<MaintenanceResponse>('/maintenance', data);
    return res.data;
  },

  /**
   * PUT /api/maintenance/:id — update ticket details
   */
  async update(id: string, data: UpdateMaintenanceInput): Promise<MaintenanceResponse> {
    const res = await apiClient.put<MaintenanceResponse>(`/maintenance/${id}`, data);
    return res.data;
  },

  /**
   * PATCH /api/maintenance/:id/status — transition status
   */
  async updateStatus(id: string, data: UpdateMaintenanceStatusInput): Promise<MaintenanceResponse> {
    const res = await apiClient.patch<MaintenanceResponse>(`/maintenance/${id}/status`, data);
    return res.data;
  },
};

export default maintenanceService;
