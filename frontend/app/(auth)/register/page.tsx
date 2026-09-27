import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import RegisterForm from '@/components/auth/RegisterForm';
import { UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Request Access — Ethiopian Engineering Corporation Asset Management System (EEC EAMS)',
  description: 'Submit an employee registration request for the Ethiopian Engineering Corporation Asset Management System (EEC EAMS)',
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Request Access"
      subtitle="Submit your employee details to request access to the Ethiopian Engineering Corporation Asset Management System (EEC EAMS)"
      icon={<UserCheck size={24} className="text-eec-primary" />}
      className="max-w-xl"
    >
      <RegisterForm />
    </AuthCard>
  );
}
