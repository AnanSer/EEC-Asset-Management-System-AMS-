'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import employeeService from '@/services/employee.service';
import { Employee } from '@/constants/employees';
import EmployeeDetails from '@/components/employees/EmployeeDetails';

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

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

  const handleToggleStatus = async () => {
    if (!employee) return;
    const newStatus = !employee.isActive;
    try {
      setStatusLoading(true);
      const res = await employeeService.updateStatus(employee.id, newStatus);
      if (res.success) {
        setEmployee((prev) =>
          prev
            ? {
                ...prev,
                isActive: newStatus,
                accountStatus: newStatus ? 'ACTIVE' : 'INACTIVE',
              }
            : null
        );
        toast.success(`Employee ${newStatus ? 'activated' : 'deactivated'} successfully`);
        setShowStatusModal(false);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update employee status';
      toast.error(errorMsg);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Loading Profile..."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Employees', href: '/employees' },
            { label: 'Details' },
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-8 border border-slate-200">
        <EmptyState
          icon={Users}
          title="Employee Not Found"
          description="The employee record you requested does not exist or may have been removed."
          action={{
            label: 'Back to Employees',
            onClick: () => router.push('/employees'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={employee.fullName}
        description={`Employee ID: ${employee.employeeId} • ${employee.position}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees', href: '/employees' },
          { label: employee.fullName },
        ]}
      />

      <EmployeeDetails
        employee={employee}
        onToggleStatus={() => setShowStatusModal(true)}
        statusLoading={statusLoading}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleToggleStatus}
        title={employee.isActive ? 'Deactivate Employee?' : 'Activate Employee?'}
        message={
          employee.isActive
            ? 'This employee will become inactive. Existing asset allocations will remain recorded.'
            : 'This employee will become active. They will regain operational access in the system.'
        }
        confirmLabel={employee.isActive ? 'Deactivate' : 'Activate'}
        cancelLabel="Cancel"
        variant={employee.isActive ? 'warning' : 'success'}
        isLoading={statusLoading}
      />
    </div>
  );
}
