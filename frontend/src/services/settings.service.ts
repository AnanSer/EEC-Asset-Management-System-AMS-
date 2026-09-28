/**
 * System Settings Service — EEC EAMS (Phase 10B.5 Optimized)
 * Handles API communication with Express backend /api/settings endpoints
 * with integrated SWR caching, request deduplication, and cascading invalidation.
 */

import apiClient from '../lib/axios';
import { appDataCache } from '../context/AppDataCacheContext';

export interface SystemSettings {
  id: string;
  organizationName: string;
  organizationShortName: string;
  supportEmail: string;
  supportPhone: string;
  headquartersAddress: string;
  logoUrl?: string | null;
  defaultLanguage: 'EN' | 'AM' | 'OM' | string;
  timezone: string;
  dateFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  organizationName?: string;
  organizationShortName?: string;
  supportEmail?: string;
  supportPhone?: string;
  headquartersAddress?: string;
  logoUrl?: string | null;
  defaultLanguage?: 'EN' | 'AM' | 'OM';
  timezone?: string;
  dateFormat?: string;
}

export interface SystemInfo {
  systemVersion: string;
  backendStatus: string;
  database: string;
  authProvider: string;
  mailProvider: string;
  nodeVersion: string;
  environment: string;
  uptimeSeconds: number;
  serverTime: string;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  data: SystemSettings;
}

export interface SystemInfoResponse {
  success: boolean;
  message?: string;
  data: SystemInfo;
}

export function invalidateSettingsCaches() {
  appDataCache.invalidateEntity('settings');
}

export const settingsService = {
  /**
   * GET /api/settings — Retrieve current organization settings
   */
  async getSettings(forceRefresh = false): Promise<SettingsResponse> {
    const key = 'settings:organization';
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<SettingsResponse>('/settings');
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * PATCH /api/settings — Update organization settings (ADMIN only)
   */
  async updateSettings(data: UpdateSettingsInput): Promise<SettingsResponse> {
    const res = await apiClient.patch<SettingsResponse>('/settings', data);
    invalidateSettingsCaches();
    return res.data;
  },

  /**
   * GET /api/settings/system-info — Retrieve read-only runtime and deployment information
   */
  async getSystemInfo(forceRefresh = false): Promise<SystemInfoResponse> {
    const key = 'settings:system_info';
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<SystemInfoResponse>('/settings/system-info');
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * Invalidate settings caches manually
   */
  invalidateCache() {
    invalidateSettingsCaches();
  },
};

export default settingsService;
