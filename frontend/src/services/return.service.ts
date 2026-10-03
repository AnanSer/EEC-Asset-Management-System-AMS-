/**
 * Asset Return Service — EEC EAMS (Phase 11D)
 * Handles API communication with Express backend /api/returns endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  CreateReturnRequestInput,
  ReceiveReturnInput,
  WalkInReturnInput,
  ReturnQuery,
  AssetReturnsResponse,
  AssetReturnResponse,
} from '../constants/returns';

export function invalidateReturnCaches() {
  appDataCache.invalidateEntity('returns');
  appDataCache.invalidateEntity('my-returns');
  appDataCache.invalidateEntity('assets');
  appDataCache.invalidateEntity('assignments');
  appDataCache.invalidateEntity('notifications');
  appDataCache.invalidateEntity('store-dashboard');
  appDataCache.invalidateEntity('asset-movement');
}

export const returnService = {
  /**
   * GET /api/returns — list return requests with filters and pagination
   */
  async getAll(params?: ReturnQuery, forceRefresh = false): Promise<AssetReturnsResponse> {
    const key = `returns:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetReturnsResponse>('/returns', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/returns?personal=true — list current user's return requests
   */
  async getMyReturns(params?: Omit<ReturnQuery, 'personal'>, forceRefresh = false): Promise<AssetReturnsResponse> {
    const query = { ...params, personal: 'true' as any };
    const key = `my-returns:list:${JSON.stringify(query)}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetReturnsResponse>('/returns', { params: query });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/returns/:id — retrieve single return request details
   */
  async getById(id: string, forceRefresh = false): Promise<AssetReturnResponse> {
    const key = `returns:${id}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetReturnResponse>(`/returns/${id}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/returns — submit a new asset return request (Path A)
   */
  async create(data: CreateReturnRequestInput): Promise<AssetReturnResponse> {
    const res = await apiClient.post<AssetReturnResponse>('/returns', data);
    invalidateReturnCaches();
    return res.data;
  },

  /**
   * POST /api/returns/:id/receive — Store Keeper physically receives asset (Path A fulfillment)
   */
  async receive(id: string, data: ReceiveReturnInput): Promise<AssetReturnResponse> {
    const res = await apiClient.post<AssetReturnResponse>(`/returns/${id}/receive`, data);
    invalidateReturnCaches();
    return res.data;
  },

  /**
   * POST /api/returns/walk-in — Store Keeper receives walk-in direct physical return (Path B)
   */
  async receiveWalkIn(data: WalkInReturnInput): Promise<AssetReturnResponse> {
    const res = await apiClient.post<AssetReturnResponse>('/returns/walk-in', data);
    invalidateReturnCaches();
    return res.data;
  },

  async walkIn(data: WalkInReturnInput): Promise<AssetReturnResponse> {
    return this.receiveWalkIn(data);
  },

  /**
   * POST /api/returns/:id/cancel — cancel pending return request (Requester)
   */
  async cancel(id: string): Promise<AssetReturnResponse> {
    const res = await apiClient.post<AssetReturnResponse>(`/returns/${id}/cancel`, {});
    invalidateReturnCaches();
    return res.data;
  },

  /**
   * Invalidate return caches manually
   */
  invalidateCache() {
    invalidateReturnCaches();
  },
};

export default returnService;
