/**
 * Maintenance Service — EEC EAMS (Phase 10B.5 Optimized)
 * Handles API communication with Express backend /api/maintenance endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
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

export interface MaintenanceTechnician {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  jobTitle?: string | null;
  department?: { id: string; name: string } | null;
  user: { id: string; email: string; role: string };
}

export interface MaintenanceTechniciansResponse {
  success: boolean;
  data: MaintenanceTechnician[];
}

export function invalidateMaintenanceCaches() {
  appDataCache.invalidateEntity('maintenance');
  appDataCache.invalidateEntity('assets');
}

export const maintenanceService = {
  /**
   * GET /api/maintenance/technicians — list active IT technicians
   */
  async getTechnicians(forceRefresh = false): Promise<MaintenanceTechniciansResponse> {
    const key = 'maintenance:technicians';
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<MaintenanceTechniciansResponse>('/maintenance/technicians');
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/maintenance — list tickets with filters & pagination
   */
  async getAll(params?: MaintenanceQueryParams, forceRefresh = false): Promise<MaintenanceListResponse> {
    const key = `maintenance:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<MaintenanceListResponse>('/maintenance', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/maintenance/stats — aggregate stats & KPIs
   */
  async getStats(forceRefresh = false): Promise<MaintenanceStatsResponse> {
    const key = 'dashboard:maintenance_stats';
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<MaintenanceStatsResponse>('/maintenance/stats');
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/maintenance/:id — single ticket by ID
   */
  async getById(id: string, forceRefresh = false): Promise<MaintenanceResponse> {
    const key = `maintenance:${id}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<MaintenanceResponse>(`/maintenance/${id}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/maintenance — create new ticket
   */
  async create(data: CreateMaintenanceInput): Promise<MaintenanceResponse> {
    const res = await apiClient.post<MaintenanceResponse>('/maintenance', data);
    invalidateMaintenanceCaches();
    return res.data;
  },

  /**
   * PUT /api/maintenance/:id — update ticket details
   */
  async update(id: string, data: UpdateMaintenanceInput): Promise<MaintenanceResponse> {
    const res = await apiClient.put<MaintenanceResponse>(`/maintenance/${id}`, data);
    invalidateMaintenanceCaches();
    return res.data;
  },

  /**
   * PATCH /api/maintenance/:id/status — transition status
   */
  async updateStatus(id: string, data: UpdateMaintenanceStatusInput): Promise<MaintenanceResponse> {
    const res = await apiClient.patch<MaintenanceResponse>(`/maintenance/${id}/status`, data);
    invalidateMaintenanceCaches();
    return res.data;
  },

  /**
   * Invalidate maintenance caches manually
   */
  invalidateCache() {
    invalidateMaintenanceCaches();
  },
};

export default maintenanceService;
