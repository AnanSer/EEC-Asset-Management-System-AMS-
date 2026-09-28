/**
 * Asset Service — EEC EAMS (Phase 10B.5 Optimized)
 * Handles API communication with Express backend /api/assets endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetQuery,
  AssetsResponse,
  AssetResponse,
} from '../constants/assets';

export function invalidateAssetCaches() {
  appDataCache.invalidateEntity('assets');
}

export const assetService = {
  /**
   * GET /api/assets — list assets with search, filters & pagination
   */
  async getAll(params?: AssetQuery, forceRefresh = false): Promise<AssetsResponse> {
    const key = `assets:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetsResponse>('/assets', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/assets/:id — retrieve single asset with department & counts
   */
  async getById(id: string, forceRefresh = false): Promise<AssetResponse> {
    const key = `assets:${id}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetResponse>(`/assets/${id}`);
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * POST /api/assets — register a new asset
   */
  async create(data: CreateAssetInput): Promise<AssetResponse> {
    const res = await apiClient.post<AssetResponse>('/assets', data);
    invalidateAssetCaches();
    return res.data;
  },

  /**
   * PUT /api/assets/:id — update existing asset
   */
  async update(id: string, data: UpdateAssetInput): Promise<AssetResponse> {
    const res = await apiClient.put<AssetResponse>(`/assets/${id}`, data);
    invalidateAssetCaches();
    return res.data;
  },

  /**
   * PATCH /api/assets/:id/status — change asset status
   */
  async updateStatus(id: string, status: string): Promise<AssetResponse> {
    const res = await apiClient.patch<AssetResponse>(`/assets/${id}/status`, { status });
    invalidateAssetCaches();
    return res.data;
  },

  /**
   * Invalidate asset caches manually
   */
  invalidateCache() {
    invalidateAssetCaches();
  },
};

export default assetService;
