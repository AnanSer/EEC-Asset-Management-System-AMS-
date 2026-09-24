/**
 * System Settings Service — EEC EAMS
 * Handles API communication with Express backend /api/settings endpoints.
 */

import apiClient from '../lib/axios';

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

export const settingsService = {
  /**
   * GET /api/settings — Retrieve current organization settings
   */
  async getSettings(): Promise<SettingsResponse> {
    const res = await apiClient.get<SettingsResponse>('/settings');
    return res.data;
  },

  /**
   * PATCH /api/settings — Update organization settings (ADMIN only)
   */
  async updateSettings(data: UpdateSettingsInput): Promise<SettingsResponse> {
    const res = await apiClient.patch<SettingsResponse>('/settings', data);
    return res.data;
  },

  /**
   * GET /api/settings/system-info — Retrieve read-only runtime and deployment information
   */
  async getSystemInfo(): Promise<SystemInfoResponse> {
    const res = await apiClient.get<SystemInfoResponse>('/settings/system-info');
    return res.data;
  },
};

export default settingsService;
