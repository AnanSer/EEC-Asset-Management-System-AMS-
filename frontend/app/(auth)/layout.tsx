import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';

export const metadata = {
  title: 'Authentication — EEC Enterprise Asset Management System',
  description: 'Sign in or request access to the Ethiopian Engineering Corporation EAMS Portal',
};

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
