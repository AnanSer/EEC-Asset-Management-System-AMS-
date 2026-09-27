import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import { LockKeyhole } from 'lucide-react';

export const metadata = {
  title: 'Sign In — Ethiopian Engineering Corporation Asset Management System (EEC EAMS)',
  description: 'Sign in to the Ethiopian Engineering Corporation Asset Management System (EEC EAMS)',
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in with your credentials to access the Ethiopian Engineering Corporation Asset Management System (EEC EAMS)"
      icon={<LockKeyhole size={24} className="text-eec-primary" />}
    >
      <LoginForm />
    </AuthCard>
  );
}
