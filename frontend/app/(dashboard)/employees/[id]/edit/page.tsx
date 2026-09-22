'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { useToast } from '@/components/ui/Toast';
import employeeService from '@/services/employee.service';
import { Employee, CreateEmployeeInput } from '@/constants/employees';

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployee = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await employeeService.getById(id);
      if (res.success) {
        setEmployee(res.data);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Employee record not found';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleSubmit = async (data: CreateEmployeeInput) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      const res = await employeeService.update(id, data);
      if (res.success) {
        toast.success(`Employee '${res.data.fullName}' updated successfully!`);
        router.push(`/employees/${id}`);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
      };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.errors?.[0]?.message ||
        'Failed to update employee. Please check your inputs.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Loading Profile..."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Employees', href: '/employees' },
            { label: 'Edit' },
          ]}
        />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-8 border border-slate-200">
        <EmptyState
          icon={Users}
          title="Employee Not Found"
          description="The employee you are trying to edit does not exist or may have been removed."
          action={{
            label: 'Back to Employees',
            onClick: () => router.push('/employees'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${employee.fullName}`}
        description={`Update employment details, department, or system access for ${employee.employeeId}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees', href: '/employees' },
          { label: 'Edit' },
        ]}
      />

      <EmployeeForm
        initialData={employee}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
