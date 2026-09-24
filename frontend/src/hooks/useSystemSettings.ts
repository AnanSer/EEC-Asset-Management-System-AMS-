/**
 * System Settings Hook — EEC EAMS (Phase 10A.1)
 *
 * Single source of truth for organization branding, support contact details,
 * and system information across the entire frontend.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import settingsService, {
  SystemSettings,
  SystemInfo,
} from '@/services/settings.service';

export interface OrganizationBranding {
  organizationName: string;
  organizationShortName: string;
  supportEmail: string;
  supportPhone: string;
  headquartersAddress: string;
  logoUrl: string | null;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  systemVersion: string;
}

export const DEFAULT_BRANDING: OrganizationBranding = {
  organizationName: 'Ethiopian Engineering Corporation',
  organizationShortName: 'EEC',
  supportEmail: 'support@eec.gov.et',
  supportPhone: '+251 11 123 4567',
  headquartersAddress: 'Addis Ababa Head Office (Kazanchis), Ethiopia',
  logoUrl: '/branding/eec-logo.png',
  defaultLanguage: 'EN',
  timezone: 'Africa/Addis_Ababa',
  dateFormat: 'DD/MM/YYYY',
  systemVersion: 'v1.0.0',
};

// In-memory cache shared across all hook instances
let cachedSettings: SystemSettings | null = null;
let cachedSystemInfo: SystemInfo | null = null;
let cachedError: string | null = null;
let isFetchingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error in settings listener:', err);
    }
  });
}

/**
 * Fetch settings and system info into global cache
 */
export async function fetchSystemSettingsData(force = false): Promise<void> {
  if (cachedSettings && !force) {
    return;
  }

  if (isFetchingPromise && !force) {
    return isFetchingPromise;
  }

  isFetchingPromise = (async () => {
    try {
      const [settingsRes, infoRes] = await Promise.allSettled([
        settingsService.getSettings(),
        settingsService.getSystemInfo(),
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.success) {
        cachedSettings = settingsRes.value.data;
        cachedError = null;
      } else if (settingsRes.status === 'rejected') {
        // Graceful error capture (e.g. 401 unauthenticated on auth pages)
        cachedError = settingsRes.reason?.message || 'Failed to load settings';
      }

      if (infoRes.status === 'fulfilled' && infoRes.value?.success) {
        cachedSystemInfo = infoRes.value.data;
      }
    } catch (err: unknown) {
      cachedError = err instanceof Error ? err.message : 'Unknown settings error';
    } finally {
      isFetchingPromise = null;
      notifyListeners();
    }
  })();

  return isFetchingPromise;
}

/**
 * Invalidate cached settings and trigger fresh data fetch
 */
export function invalidateSystemSettings(): Promise<void> {
  cachedSettings = null;
  cachedSystemInfo = null;
  return fetchSystemSettingsData(true);
}

export interface UseSystemSettingsReturn {
  settings: SystemSettings | null;
  systemInfo: SystemInfo | null;
  branding: OrganizationBranding;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSystemSettings(): UseSystemSettingsReturn {
  const [settings, setSettings] = useState<SystemSettings | null>(cachedSettings);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(cachedSystemInfo);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedSettings && !cachedError);
  const [error, setError] = useState<string | null>(cachedError);

  const updateState = useCallback(() => {
    setSettings(cachedSettings);
    setSystemInfo(cachedSystemInfo);
    setError(cachedError);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    listeners.add(updateState);

    if (!cachedSettings && !isFetchingPromise) {
      setIsLoading(true);
      fetchSystemSettingsData().finally(() => {
        setIsLoading(false);
      });
    } else if (cachedSettings) {
      setIsLoading(false);
    }

    return () => {
      listeners.delete(updateState);
    };
  }, [updateState]);

  const branding: OrganizationBranding = {
    organizationName: settings?.organizationName || DEFAULT_BRANDING.organizationName,
    organizationShortName: settings?.organizationShortName || DEFAULT_BRANDING.organizationShortName,
    supportEmail: settings?.supportEmail || DEFAULT_BRANDING.supportEmail,
    supportPhone: settings?.supportPhone || DEFAULT_BRANDING.supportPhone,
    headquartersAddress: settings?.headquartersAddress || DEFAULT_BRANDING.headquartersAddress,
    logoUrl: settings?.logoUrl || DEFAULT_BRANDING.logoUrl,
    defaultLanguage: settings?.defaultLanguage || DEFAULT_BRANDING.defaultLanguage,
    timezone: settings?.timezone || DEFAULT_BRANDING.timezone,
    dateFormat: settings?.dateFormat || DEFAULT_BRANDING.dateFormat,
    systemVersion: systemInfo?.systemVersion || DEFAULT_BRANDING.systemVersion,
  };

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchSystemSettingsData(true);
    setIsLoading(false);
  }, []);

  return {
    settings,
    systemInfo,
    branding,
    isLoading,
    error,
    refetch,
  };
}

export default useSystemSettings;
