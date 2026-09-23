'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import DepartmentForm from '@/components/departments/DepartmentForm';
import { useToast } from '@/components/ui/Toast';
import departmentService from '@/services/department.service';
import { CreateDepartmentInput } from '@/constants/departments';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';

export default function NewDepartmentPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateDepartmentInput) => {
    try {
      setIsSubmitting(true);
      const res = await departmentService.create(data);
      if (res.success) {
        toast.success(`Department '${res.data.name}' created successfully!`);
        router.push('/departments');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } } };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.errors?.[0]?.message ||
        'Failed to create department. Please check your inputs.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.DEPARTMENTS_CREATE}>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Create Department"
          description="Register a new organizational sector, directorate, or facility for Ethiopian Engineering Corporation."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Departments', href: '/departments' },
            { label: 'New' },
          ]}
        />

        <DepartmentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </PermissionGuard>
  );
}
