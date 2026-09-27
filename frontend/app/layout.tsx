import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import SplashScreen from '@/components/loading/SplashScreen';
import RouteLoadingBar from '@/components/loading/RouteLoadingBar';

export const metadata: Metadata = {
  title: 'EEC EAMS – Ethiopian Engineering Corporation',
  description:
    'Enterprise Asset Management System for Ethiopian Engineering Corporation',
  keywords: ['EEC', 'Asset Management', 'Ethiopian Engineering', 'EAMS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ToastProvider>
          <SplashScreen />
          <Suspense fallback={null}>
            <RouteLoadingBar />
          </Suspense>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
