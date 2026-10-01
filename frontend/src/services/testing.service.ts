/**
 * Testing & Inspection Service — EEC EAMS (Phase 10B.5 Optimized)
 * Handles API communication with Express backend /api/testing endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  InspectionTest,
  CreateInspectionInput,
} from '../constants/maintenance';

export interface InspectionListResponse {
  success: boolean;
  data: InspectionTest[];
}

export interface InspectionResponse {
  success: boolean;
  message?: string;
  data: InspectionTest;
}

export function invalidateTestingCaches() {
  appDataCache.invalidateEntity('testing');
  appDataCache.invalidateEntity('assets');
}

export const testingService = {
  /**
   * GET /api/testing/:ticketId — list inspections for a ticket
   */
  async getByTicketId(ticketId: string, forceRefresh = false): Promise<InspectionListResponse> {
    const key = `testing:ticket:${ticketId}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<InspectionListResponse>(`/testing/${ticketId}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/testing — create a new inspection record
   */
  async create(data: CreateInspectionInput): Promise<InspectionResponse> {
    const res = await apiClient.post<InspectionResponse>('/testing', data);
    invalidateTestingCaches();
    return res.data;
  },

  /**
   * PUT /api/testing/:id — update an inspection record
   */
  async update(id: string, data: Partial<CreateInspectionInput>): Promise<InspectionResponse> {
    const res = await apiClient.put<InspectionResponse>(`/testing/${id}`, data);
    invalidateTestingCaches();
    return res.data;
  },

  /**
   * Invalidate testing caches manually
   */
  invalidateCache() {
    invalidateTestingCaches();
  },
};

export default testingService;
