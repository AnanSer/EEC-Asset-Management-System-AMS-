/**
 * Asset Request Service — EEC EAMS (Phase 11C)
 * Handles API communication with Express backend /api/requests endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  CreateAssetRequestInput,
  ApproveAssetRequestInput,
  RejectAssetRequestInput,
  FulfillAssetRequestInput,
  AssetRequestQuery,
  AssetRequestsResponse,
  AssetRequestResponse,
} from '../constants/requests';

export function invalidateRequestCaches() {
  appDataCache.invalidateEntity('requests');
  appDataCache.invalidateEntity('my-requests');
  appDataCache.invalidateEntity('store-dashboard');
  appDataCache.invalidateEntity('assets');
  appDataCache.invalidateEntity('assignments');
  appDataCache.invalidateEntity('asset-movement');
}

export const requestService = {
  /**
   * GET /api/requests — list requests with filters and pagination
   */
  async getAll(params?: AssetRequestQuery, forceRefresh = false): Promise<AssetRequestsResponse> {
    const key = `requests:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetRequestsResponse>('/requests', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/requests?personal=true — list current user's requests
   */
  async getMyRequests(params?: Omit<AssetRequestQuery, 'personal'>, forceRefresh = false): Promise<AssetRequestsResponse> {
    const query = { ...params, personal: 'true' as any };
    const key = `my-requests:list:${JSON.stringify(query)}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetRequestsResponse>('/requests', { params: query });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/requests/:id — retrieve single request details
   */
  async getById(id: string, forceRefresh = false): Promise<AssetRequestResponse> {
    const key = `requests:${id}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetRequestResponse>(`/requests/${id}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/requests — submit a new asset request
   */
  async create(data: CreateAssetRequestInput): Promise<AssetRequestResponse> {
    const res = await apiClient.post<AssetRequestResponse>('/requests', data);
    invalidateRequestCaches();
    return res.data;
  },

  /**
   * POST /api/requests/:id/approve — approve request (ADMIN)
   */
  async approve(id: string, data?: ApproveAssetRequestInput): Promise<AssetRequestResponse> {
    const res = await apiClient.post<AssetRequestResponse>(`/requests/${id}/approve`, data || {});
    invalidateRequestCaches();
    return res.data;
  },

  /**
   * POST /api/requests/:id/reject — reject request (ADMIN)
   */
  async reject(id: string, data: RejectAssetRequestInput): Promise<AssetRequestResponse> {
    const res = await apiClient.post<AssetRequestResponse>(`/requests/${id}/reject`, data);
    invalidateRequestCaches();
    return res.data;
  },

  /**
   * POST /api/requests/:id/fulfill — fulfill request with physical handover (STORE_KEEPER / ADMIN)
   * Invalidates requests, assets, and assignments to update live inventory counts!
   */
  async fulfill(id: string, data: FulfillAssetRequestInput): Promise<AssetRequestResponse> {
    const res = await apiClient.post<AssetRequestResponse>(`/requests/${id}/fulfill`, data);
    invalidateRequestCaches();
    appDataCache.invalidateEntity('assets');
    appDataCache.invalidateEntity('assignments');
    return res.data;
  },

  /**
   * POST /api/requests/:id/cancel — cancel pending request (Requester)
   */
  async cancel(id: string): Promise<AssetRequestResponse> {
    const res = await apiClient.post<AssetRequestResponse>(`/requests/${id}/cancel`, {});
    invalidateRequestCaches();
    return res.data;
  },

  /**
   * Invalidate request caches manually
   */
  invalidateCache() {
    invalidateRequestCaches();
  },
};

export default requestService;
