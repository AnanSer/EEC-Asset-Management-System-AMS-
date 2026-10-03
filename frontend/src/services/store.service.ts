/**
 * Store Service — EEC EAMS (Phase 11E)
 * Communicates with /api/store endpoints for Store Operations Dashboard KPIs,
 * Recent Store Activity feed, and Asset Movement History.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';
import {
  StoreDashboardResponse,
  AssetMovementHistoryResponse,
} from '../constants/store';

export function invalidateStoreCaches() {
  appDataCache.invalidateEntity('store-dashboard');
  appDataCache.invalidateEntity('asset-movement');
}

export const storeService = {
  /**
   * GET /api/store/dashboard — Retrieves Store Keeper Dashboard KPIs and Activity Feed
   */
  async getDashboard(forceRefresh = false): Promise<StoreDashboardResponse> {
    const key = 'store-dashboard:overview';
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<StoreDashboardResponse>('/store/dashboard');
        return res.data;
      },
      { forceRefresh, ttl: 30000 }
    );
  },

  /**
   * GET /api/store/assets/:assetId/movement-history — Retrieves chronological movement history for an asset
   */
  async getAssetMovementHistory(
    assetId: string,
    forceRefresh = false
  ): Promise<AssetMovementHistoryResponse> {
    const key = `asset-movement:${assetId}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<AssetMovementHistoryResponse>(
          `/store/assets/${assetId}/movement-history`
        );
        return res.data;
      },
      { forceRefresh, ttl: 60000 }
    );
  },

  /**
   * Manually invalidate store caches
   */
  invalidateCache() {
    invalidateStoreCaches();
  },
};

export default storeService;
