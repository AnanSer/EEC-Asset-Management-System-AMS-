'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { error } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Authentication & Account Status Route Protection
  useEffect(() => {
    let isMounted = true;

    async function verifySession(isHeartbeat = false) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/auth/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          if (isMounted) {
            if (isHeartbeat) {
              error('Session expired. Please sign in again.');
            }
            router.push('/login');
          }
          return;
        }

        const json = await res.json();
        const businessUser = json?.data?.businessUser;
        const status = businessUser?.status;

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
          router.push('/login');
        }
      }
    }

    // Initial session verification on route access
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
    return (
      <div className="flex h-screen bg-eec-background items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-10 h-10 border-3 border-eec-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Verifying Session & Authorization
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Securing corporate access to EEC EAMS...
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse mx-auto" />
            <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
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
      <DashboardAuthGuard>{children}</DashboardAuthGuard>
    </ToastProvider>
  );
}
