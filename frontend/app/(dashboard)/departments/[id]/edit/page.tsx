'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import DepartmentForm from '@/components/departments/DepartmentForm';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Building2 } from 'lucide-react';
import departmentService from '@/services/department.service';
import { Department, CreateDepartmentInput } from '@/constants/departments';

export default function EditDepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await departmentService.getById(id);
      if (res.success) {
        setDepartment(res.data);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Department not found';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const handleSubmit = async (data: CreateDepartmentInput) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      const res = await departmentService.update(id, data);
      if (res.success) {
        toast.success(`Department '${res.data.name}' updated successfully!`);
        router.push(`/departments/${id}`);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } } };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.errors?.[0]?.message ||
        'Failed to update department. Please check your inputs.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Loading Department..."
          breadcrumbs={[
            { label: 'Departments', href: '/departments' },
            { label: 'Edit' },
          ]}
        />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-8 border border-slate-200">
        <EmptyState
          icon={Building2}
          title="Department Not Found"
          description="The department you are trying to edit does not exist or may have been removed."
          action={{
            label: 'Back to Departments',
            onClick: () => router.push('/departments'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${department.name}`}
        description={`Update details, office location, or code for ${department.code}`}
        breadcrumbs={[
          { label: 'Departments', href: '/departments' },
          { label: department.name, href: `/departments/${department.id}` },
          { label: 'Edit' },
        ]}
      />

      <DepartmentForm
        initialData={department}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
