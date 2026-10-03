/**
 * Enterprise Application Data Cache Context & SWR Layer — EEC EAMS (Phase 10B.5)
 *
 * Provides high-performance in-memory caching, stale-while-revalidate (SWR),
 * request deduplication, and event-based cache invalidation across the application.
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// ─── Cache Item & Options Types ─────────────────────────────────────────────

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export type CacheEntity =
  | 'employees'
  | 'departments'
  | 'assets'
  | 'assignments'
  | 'my-assets'
  | 'maintenance'
  | 'my-maintenance'
  | 'testing'
  | 'dashboard'
  | 'notifications'
  | 'settings'
  | 'reports'
  | 'requests'
  | 'my-requests'
  | 'returns'
  | 'my-returns'
  | 'store-dashboard'
  | 'asset-movement'
  | 'profile';

export interface AppDataCacheContextValue {
  getCached: <T = any>(key: string) => T | undefined;
  setCached: <T = any>(key: string, value: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  invalidateMany: (keys: string[]) => void;
  invalidateEntity: (entity: CacheEntity) => void;
  clearCache: () => void;
  prefetch: <T = any>(key: string, fetcher: () => Promise<T>, ttl?: number) => Promise<T | undefined>;
  fetchWithCache: <T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      forceRefresh?: boolean;
      ttl?: number;
    }
  ) => Promise<T>;
}

// ─── In-Memory Singleton Storage ────────────────────────────────────────────

const memoryCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<any>>();
const cacheSubscribers = new Set<(key: string, data?: any) => void>();

function notifySubscribers(key: string, data?: any) {
  cacheSubscribers.forEach((callback) => {
    try {
      callback(key, data);
    } catch (err) {
      console.error('[AppDataCache] Subscriber error:', err);
    }
  });
}

// ─── Core Cache Operations ──────────────────────────────────────────────────

export const appDataCache = {
  /**
   * Retrieve cached data if valid and unexpired
   */
  getCached<T = any>(key: string): T | undefined {
    const entry = memoryCache.get(key);
    if (!entry) return undefined;

    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      memoryCache.delete(key);
      return undefined;
    }

    return entry.data as T;
  },

  /**
   * Set cached item with optional TTL (in milliseconds)
   */
  setCached<T = any>(key: string, value: T, ttl?: number): void {
    memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
    notifySubscribers(key, value);
  },

  /**
   * Invalidate exact key or all keys starting with prefix
   */
  invalidate(key: string): void {
    const prefix = key.toLowerCase();
    const keysToDelete: string[] = [];
    memoryCache.forEach((_, cachedKey) => {
      if (cachedKey === key || cachedKey.toLowerCase().startsWith(prefix)) {
        keysToDelete.push(cachedKey);
      }
    });
    keysToDelete.forEach((k) => memoryCache.delete(k));
    notifySubscribers(key, undefined);
  },

  /**
   * Invalidate multiple keys/prefixes
   */
  invalidateMany(keys: string[]): void {
    keys.forEach((key) => appDataCache.invalidate(key));
  },

  /**
   * Invalidate entity and all cascading dependencies according to Phase 10B.5 rules
   */
  invalidateEntity(entity: CacheEntity): void {
    switch (entity) {
      case 'employees':
        appDataCache.invalidateMany(['employees', 'dashboard', 'notifications', 'reports:employees']);
        break;
      case 'departments':
        appDataCache.invalidateMany(['departments', 'dashboard', 'settings', 'reports:departments']);
        break;
      case 'assets':
        appDataCache.invalidateMany(['assets', 'dashboard', 'assignments', 'my-assets', 'maintenance', 'reports:assets', 'reports:warranty']);
        break;
      case 'assignments':
        appDataCache.invalidateMany(['assets', 'assignments', 'my-assets', 'dashboard', 'notifications', 'reports']);
        break;
      case 'maintenance':
        appDataCache.invalidateMany(['maintenance', 'my-maintenance', 'testing', 'assets', 'dashboard', 'notifications', 'reports:maintenance']);
        break;
      case 'testing':
        appDataCache.invalidateMany(['testing', 'maintenance', 'assets', 'dashboard', 'notifications', 'reports:maintenance']);
        break;
      case 'settings':
        appDataCache.invalidateMany(['settings', 'branding', 'navbar', 'sidebar', 'profile']);
        break;
      default:
        appDataCache.invalidate(entity);
        break;
    }
  },

  /**
   * Clear all stored cache entries
   */
  clearCache(): void {
    memoryCache.clear();
    inflightRequests.clear();
    notifySubscribers('*', undefined);
  },

  /**
   * Fetch with in-flight Promise deduplication
   */
  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = inflightRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fetcher();
      } finally {
        inflightRequests.delete(key);
      }
    })();

    inflightRequests.set(key, promise);
    return promise;
  },

  /**
   * Fetch with SWR pattern: returns cache if present while refreshing in background,
   * or fetches immediately on cache miss.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      forceRefresh?: boolean;
      ttl?: number;
    }
  ): Promise<T> {
    const { forceRefresh = false, ttl } = options || {};

    if (!forceRefresh) {
      const cached = appDataCache.getCached<T>(key);
      if (cached !== undefined) {
        // Trigger background silent revalidation with deduplication
        appDataCache
          .deduplicate(`swr:${key}`, fetcher)
          .then((freshData) => {
            appDataCache.setCached(key, freshData, ttl);
          })
          .catch(() => {});

        return cached;
      }
    }

    // Cache miss or force refresh: execute with deduplication
    const fresh = await appDataCache.deduplicate(key, fetcher);
    appDataCache.setCached(key, fresh, ttl);
    return fresh;
  },

  /**
   * Preload route or service data ahead of user interaction (failure-safe).
   * Background prefetching must NEVER produce an unhandled runtime error.
   * If a prefetch fails (403, 401, network failure, timeout), it is safely caught
   * and treated as "cache not warmed" (returning undefined).
   */
  async prefetch<T = any>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T | undefined> {
    try {
      const cached = appDataCache.getCached<T>(key);
      if (cached !== undefined) {
        return cached;
      }
      return await appDataCache.fetchWithCache(key, fetcher, { ttl });
    } catch {
      // Best-effort background prefetch failure: do not propagate or throw
      return undefined;
    }
  },

  /**
   * Subscribe to cache updates/invalidations
   */
  subscribe(callback: (key: string, data?: any) => void): () => void {
    cacheSubscribers.add(callback);
    return () => {
      cacheSubscribers.delete(callback);
    };
  },
};

// ─── React Context & Provider ───────────────────────────────────────────────

const AppDataCacheContext = createContext<AppDataCacheContextValue>({
  getCached: appDataCache.getCached,
  setCached: appDataCache.setCached,
  invalidate: appDataCache.invalidate,
  invalidateMany: appDataCache.invalidateMany,
  invalidateEntity: appDataCache.invalidateEntity,
  clearCache: appDataCache.clearCache,
  prefetch: appDataCache.prefetch,
  fetchWithCache: appDataCache.fetchWithCache,
});

export function AppDataCacheProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppDataCacheContext.Provider
      value={{
        getCached: appDataCache.getCached,
        setCached: appDataCache.setCached,
        invalidate: appDataCache.invalidate,
        invalidateMany: appDataCache.invalidateMany,
        invalidateEntity: appDataCache.invalidateEntity,
        clearCache: appDataCache.clearCache,
        prefetch: appDataCache.prefetch,
        fetchWithCache: appDataCache.fetchWithCache,
      }}
    >
      {children}
    </AppDataCacheContext.Provider>
  );
}

export function useAppDataCache(): AppDataCacheContextValue {
  return useContext(AppDataCacheContext);
}

// ─── Custom SWR Query Hook for Components ───────────────────────────────────

export interface UseCacheQueryOptions<T> {
  enabled?: boolean;
  ttl?: number;
  onSuccess?: (data: T) => void;
}

export interface UseCacheQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isUpdating: boolean;
  error: Error | null;
  refetch: (force?: boolean) => Promise<T | undefined>;
}

export function useCacheQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseCacheQueryOptions<T>
): UseCacheQueryResult<T> {
  const { enabled = true, ttl, onSuccess } = options || {};
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const [data, setData] = useState<T | undefined>(() => appDataCache.getCached<T>(key));
  const [isLoading, setIsLoading] = useState<boolean>(() => enabled && appDataCache.getCached<T>(key) === undefined);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const executeFetch = useCallback(
    async (force = false): Promise<T | undefined> => {
      if (!enabled) return undefined;

      const cached = appDataCache.getCached<T>(key);
      if (cached !== undefined && !force) {
        setData(cached);
        setIsLoading(false);
        setIsUpdating(true);

        try {
          const fresh = await appDataCache.deduplicate(`query:${key}`, fetcher);
          appDataCache.setCached(key, fresh, ttl);
          setData(fresh);
          setError(null);
          onSuccessRef.current?.(fresh);
          return fresh;
        } catch (err) {
          // Keep stale cached data intact on error
          console.warn(`[useCacheQuery] Silent background revalidation error for key "${key}":`, err);
        } finally {
          setIsUpdating(false);
        }
        return cached;
      }

      // Cache miss or force refresh
      setIsLoading(true);
      try {
        const result = await appDataCache.deduplicate(key, fetcher);
        appDataCache.setCached(key, result, ttl);
        setData(result);
        setError(null);
        onSuccessRef.current?.(result);
        return result;
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return undefined;
      } finally {
        setIsLoading(false);
        setIsUpdating(false);
      }
    },
    [key, enabled, fetcher, ttl]
  );

  useEffect(() => {
    if (!enabled) return;

    // Check current cache state immediately
    const cached = appDataCache.getCached<T>(key);
    if (cached !== undefined) {
      setData(cached);
      setIsLoading(false);
      setIsUpdating(true);

      // Background revalidation
      appDataCache
        .deduplicate(`query:${key}`, fetcher)
        .then((fresh) => {
          appDataCache.setCached(key, fresh, ttl);
          setData(fresh);
          setError(null);
          onSuccessRef.current?.(fresh);
        })
        .catch(() => {})
        .finally(() => {
          setIsUpdating(false);
        });
    } else {
      executeFetch(false);
    }

    // Subscribe to cache invalidation and updates
    const unsubscribe = appDataCache.subscribe((invalidatedKey, updatedData) => {
      if (
        invalidatedKey === '*' ||
        invalidatedKey === key ||
        key.startsWith(invalidatedKey) ||
        invalidatedKey.startsWith(key)
      ) {
        if (updatedData !== undefined) {
          setData(updatedData as T);
          setIsLoading(false);
          setIsUpdating(false);
        } else {
          // Invalidated, trigger background refetch
          executeFetch(true);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [key, enabled, executeFetch, fetcher, ttl]);

  return {
    data,
    isLoading,
    isUpdating,
    error,
    refetch: executeFetch,
  };
}
