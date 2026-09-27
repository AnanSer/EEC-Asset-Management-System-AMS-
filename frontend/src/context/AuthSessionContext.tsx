/**
 * Auth Session Context & Cache Provider — EEC EAMS (Phase 10B.4)
 * Caches /api/auth/me during the session to avoid redundant round-trips
 * and prevent duplicate API requests across route transitions.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BusinessUserProfile {
  id: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  email: string;
  name?: string;
  isEmailVerified?: boolean;
  employeeProfile?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    jobTitle?: string;
    phone?: string;
    department?: {
      id: string;
      name: string;
      code?: string;
    };
  } | null;
}

export interface AuthSessionData {
  user: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  businessUser: BusinessUserProfile | null;
}

export interface AuthSessionContextValue {
  session: AuthSessionData | null;
  user: BusinessUserProfile | null;
  role: string | null;
  status: string | null;
  isLoading: boolean;
  refetch: () => Promise<AuthSessionData | null>;
  clearCache: () => void;
}

// In-memory module cache
let cachedSession: AuthSessionData | null = null;
let sessionFetchPromise: Promise<AuthSessionData | null> | null = null;
const sessionListeners = new Set<(session: AuthSessionData | null) => void>();

function notifySessionListeners(session: AuthSessionData | null) {
  sessionListeners.forEach((listener) => {
    try {
      listener(session);
    } catch (err) {
      console.error('[AuthSession] Listener error:', err);
    }
  });
}

/**
 * Fetch authenticated session with deduplication and in-memory caching.
 */
export async function fetchAuthSession(forceRefresh = false): Promise<AuthSessionData | null> {
  if (!forceRefresh && cachedSession) {
    return cachedSession;
  }

  if (sessionFetchPromise) {
    return sessionFetchPromise;
  }

  sessionFetchPromise = (async () => {
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
      const res = await fetch(`${apiBase}/api/auth/me`, {
        credentials: 'include',
      });

      if (!res.ok) {
        cachedSession = null;
        notifySessionListeners(null);
        return null;
      }

      const json = await res.json();
      const sessionData: AuthSessionData = {
        user: json?.data?.user || null,
        businessUser: json?.data?.businessUser || null,
      };

      cachedSession = sessionData;
      notifySessionListeners(sessionData);
      return sessionData;
    } catch (err) {
      console.error('[fetchAuthSession] Error fetching session:', err);
      return null;
    } finally {
      sessionFetchPromise = null;
    }
  })();

  return sessionFetchPromise;
}

/**
 * Clear the in-memory session cache (e.g. on sign out)
 */
export function clearAuthSessionCache(): void {
  cachedSession = null;
  sessionFetchPromise = null;
  notifySessionListeners(null);
}

/**
 * Update the in-memory session cache (e.g. on profile update or login)
 */
export function setAuthSessionCache(data: AuthSessionData): void {
  cachedSession = data;
  notifySessionListeners(data);
}

const AuthSessionContext = createContext<AuthSessionContextValue>({
  session: null,
  user: null,
  role: null,
  status: null,
  isLoading: true,
  refetch: async () => null,
  clearCache: () => {},
});

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSessionData | null>(cachedSession);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedSession);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAuthSession(true);
    setSession(data);
    setIsLoading(false);
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Register listener for external updates
    const handleUpdate = (updated: AuthSessionData | null) => {
      if (isMounted) {
        setSession(updated);
        setIsLoading(false);
      }
    };
    sessionListeners.add(handleUpdate);

    // Initial fetch if cache is empty
    if (!cachedSession) {
      fetchAuthSession(false).then((data) => {
        if (isMounted) {
          setSession(data);
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      sessionListeners.delete(handleUpdate);
    };
  }, []);

  const businessUser = session?.businessUser || null;
  const role = businessUser?.role || null;
  const status = businessUser?.status || null;

  return (
    <AuthSessionContext.Provider
      value={{
        session,
        user: businessUser,
        role,
        status,
        isLoading,
        refetch,
        clearCache: clearAuthSessionCache,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
