import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import RegisterForm from '@/components/auth/RegisterForm';
import { UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Request Access — EEC EAMS',
  description: 'Submit an employee registration request for the EEC Enterprise Asset Management System',
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Request EAMS Access"
      subtitle="Submit your employee details for administrative review and corporate account activation"
      icon={<UserCheck size={24} className="text-eec-primary" />}
      className="max-w-xl"
    >
      <RegisterForm />
    </AuthCard>
  );
}
