'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth-client';
import LogoPreloader from '@/components/loading/LogoPreloader';
import {
  AuthSessionProvider,
  fetchAuthSession,
  clearAuthSessionCache,
  getCachedAuthSession,
} from '@/context/AuthSessionContext';

function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { error } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    const cached = getCachedAuthSession();
    return !cached?.businessUser;
  });

  // Authentication & Account Status Route Protection with Cached Session
  useEffect(() => {
    let isMounted = true;

    async function verifySession(isHeartbeat = false) {
      try {
        const session = await fetchAuthSession(isHeartbeat);

        if (!session || !session.businessUser) {
          if (isMounted) {
            if (isHeartbeat) {
              error('Session expired. Please sign in again.');
            }
            clearAuthSessionCache();
            router.push('/login');
          }
          return;
        }

        const businessUser = session.businessUser;
        const status = businessUser?.status;

        if (status === 'SUSPENDED') {
          if (isMounted) {
            clearAuthSessionCache();
            try {
              await authClient.signOut();
            } catch (signOutErr) {
              console.error('Sign out error:', signOutErr);
            }
            error('Your account has been suspended. Please contact EEC ICT Administration.');
            router.push('/login');
          }
          return;
        }

        if (status === 'PENDING') {
          if (isMounted) router.push('/pending');
          return;
        }

        if (status === 'REJECTED') {
          if (isMounted) router.push('/rejected');
          return;
        }

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        if (isMounted) {
          if (isHeartbeat) {
            error('Session expired. Please sign in again.');
          }
          clearAuthSessionCache();
          router.push('/login');
        }
      }
    }

    // Initial session verification (uses instant cache if available)
    verifySession(false);

    // Periodic session heartbeat (every 60 seconds)
    const interval = setInterval(() => {
      verifySession(true);
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, error]);

  // Loading state while verifying authentication
  if (isCheckingAuth) {
    const isSplashActive =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('eec_splash_shown') !== 'true';

    // Suppress competing loading card if the corporate splash screen is currently active
    if (isSplashActive) {
      return <div className="min-h-screen bg-[#052831]" />;
    }

    return <LogoPreloader />;
  }

  return (
    <div className="flex h-screen bg-eec-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky Navbar */}
        <Navbar collapsed={sidebarCollapsed} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthSessionProvider>
        <DashboardAuthGuard>{children}</DashboardAuthGuard>
      </AuthSessionProvider>
    </ToastProvider>
  );
}
