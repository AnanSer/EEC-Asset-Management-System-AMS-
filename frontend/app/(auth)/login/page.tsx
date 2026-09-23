import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import { LockKeyhole } from 'lucide-react';

export const metadata = {
  title: 'Sign In — EEC EAMS',
  description: 'Sign in to the Ethiopian Engineering Corporation Enterprise Asset Management System',
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in with your corporate credentials to access the EAMS Portal"
      icon={<LockKeyhole size={24} className="text-eec-primary" />}
    >
      <LoginForm />
    </AuthCard>
  );
}
