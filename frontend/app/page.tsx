'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession, AuthSessionData } from '@/context/AuthSessionContext';

export default function RootPage() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Timeout guard so session verification never blocks navigation
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 2500)
    );

    // Concurrently fetch auth session in the background while splash plays
    const authPromise = Promise.race([
      fetchAuthSession(false).catch(() => null),
      timeoutPromise,
    ]);

    const proceedToDestination = (session: AuthSessionData | null) => {
      if (!isMounted || hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      if (!session || !session.businessUser) {
        router.replace('/login');
        return;
      }

      const status = session.businessUser.status;
      if (status === 'PENDING') {
        router.replace('/pending');
      } else if (status === 'REJECTED') {
        router.replace('/rejected');
      } else if (status === 'SUSPENDED') {
        router.replace('/login');
      } else {
        router.replace('/dashboard');
      }
    };

    const isSplashAlreadyShown =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('eec_splash_shown') === 'true';

    if (isSplashAlreadyShown) {
      // In this session the splash was already displayed; route immediately
      authPromise.then((session) => {
        proceedToDestination(session);
      });
      return () => {
        isMounted = false;
      };
    }

    // Await splash screen completion before navigating
    const handleSplashCompleted = async () => {
      const session = await authPromise;
      proceedToDestination(session);
    };

    window.addEventListener('eec-splash-completed', handleSplashCompleted);

    // High-frequency check: as soon as sessionStorage marks splash shown, navigate immediately
    const pollInterval = setInterval(async () => {
      if (
        !hasNavigatedRef.current &&
        typeof window !== 'undefined' &&
        sessionStorage.getItem('eec_splash_shown') === 'true'
      ) {
        clearInterval(pollInterval);
        const session = await authPromise;
        proceedToDestination(session);
      }
    }, 150);

    // Watchdog fallback timer (2.8s) guarantees root page never stays stuck
    const fallbackTimer = setTimeout(async () => {
      if (!hasNavigatedRef.current) {
        const session = await authPromise;
        proceedToDestination(session);
      }
    }, 2800);

    return () => {
      isMounted = false;
      window.removeEventListener('eec-splash-completed', handleSplashCompleted);
      clearInterval(pollInterval);
      clearTimeout(fallbackTimer);
    };
  }, [router]);

  return <div className="min-h-screen bg-[#052831]" />;
}
