'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { useToast } from '@/components/ui/Toast';
import employeeService from '@/services/employee.service';
import { CreateEmployeeInput } from '@/constants/employees';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

export default function NewEmployeePage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateEmployeeInput) => {
    try {
      setIsSubmitting(true);
      const res = await employeeService.create(data);
      if (res.success) {
        toast.success(`Employee '${res.data.fullName}' registered successfully!`);
        router.push('/employees');
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
      };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.errors?.[0]?.message ||
        'Failed to register employee. Please check your inputs.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.EMPLOYEES_CREATE}>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Register Employee"
          description="Add a new employee record and assign them to an Ethiopian Engineering Corporation directorate."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Employees', href: '/employees' },
            { label: 'New' },
          ]}
        />

        <EmployeeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </PermissionGuard>
  );
}
