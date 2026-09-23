'use client';

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  Edit2,
  Power,
  Mail,
  Building2,
  Briefcase,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Employee } from '@/constants/employees';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/authorization';

interface EmployeeTableProps {
  employees: Employee[];
  onToggleStatus: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  onToggleStatus,
}: EmployeeTableProps) {
  const { can } = usePermissions();
  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 ring-purple-200';
      case 'IT_TECHNICIAN':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'DEPARTMENT_MANAGER':
        return 'bg-teal-50 text-teal-700 ring-teal-200';
      case 'EMPLOYEE':
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  const getAccountStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'approved';
      case 'PENDING':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      case 'SUSPENDED':
        return 'suspended';
      default:
        return 'pending';
    }
  };

  const formatAccountStatusLabel = (status: string) => {
    if (!status) return 'Pending';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-5">Employee ID</th>
            <th className="py-3.5 px-5">Full Name</th>
            <th className="py-3.5 px-5">Department</th>
            <th className="py-3.5 px-5">Position</th>
            <th className="py-3.5 px-5">Email</th>
            <th className="py-3.5 px-4 text-center">Role</th>
            <th className="py-3.5 px-4 text-center">Account Status</th>
            <th className="py-3.5 px-4 text-center">Active Status</th>
            <th className="py-3.5 px-4 text-center">Assigned Assets</th>
            <th className="py-3.5 px-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="hover:bg-slate-50/70 transition-colors group"
            >
              {/* Employee ID */}
              <td className="py-3.5 px-5 font-mono text-xs font-semibold text-eec-primary whitespace-nowrap">
                <span className="bg-eec-primary/5 px-2 py-1 rounded border border-eec-primary/15">
                  {emp.employeeId}
                </span>
              </td>

              {/* Full Name */}
              <td className="py-3.5 px-5">
                <Link
                  href={`/employees/${emp.id}`}
                  className="font-semibold text-eec-text hover:text-eec-accent transition-colors block"
                >
                  {emp.fullName}
                </Link>
                {emp.phone && (
                  <span className="text-xs text-slate-400 block mt-0.5">{emp.phone}</span>
                )}
              </td>

              {/* Department */}
              <td className="py-3.5 px-5 text-slate-600">
                <div className="flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1 max-w-[180px]">
                    {emp.department?.name || 'Unassigned'}
                  </span>
                </div>
              </td>

              {/* Position */}
              <td className="py-3.5 px-5 text-slate-600">
                <div className="flex items-center gap-1.5 text-xs">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1 max-w-[160px] font-medium text-slate-700">
                    {emp.position}
                  </span>
                </div>
              </td>

              {/* Email */}
              <td className="py-3.5 px-5 text-slate-500 text-xs">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{emp.email}</span>
                </div>
              </td>

              {/* Role */}
              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${getRoleBadgeClasses(
                    emp.role
                  )}`}
                >
                  {emp.role.replace(/_/g, ' ')}
                </span>
              </td>

              {/* Account Status */}
              <td className="py-3.5 px-4 text-center">
                <StatusBadge
                  status={getAccountStatusVariant(emp.accountStatus)}
                  label={formatAccountStatusLabel(emp.accountStatus)}
                />
              </td>

              {/* Active Status */}
              <td className="py-3.5 px-4 text-center">
                <StatusBadge status={emp.isActive ? 'active' : 'inactive'} />
              </td>

              {/* Assigned Assets */}
              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-flex items-center justify-center min-w-[24px] px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    (emp._count?.assetAssignments ?? 0) > 0
                      ? 'bg-eec-primary/10 text-eec-primary border border-eec-primary/20'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                  title={`${emp._count?.assetAssignments ?? 0} active asset(s) assigned`}
                >
                  {emp._count?.assetAssignments ?? 0}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  {/* View */}
                  <Link
                    href={`/employees/${emp.id}`}
                    className="p-1.5 rounded-md text-slate-500 hover:text-eec-primary hover:bg-slate-100 transition-colors"
                    title="View Employee Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Edit */}
                  {can(PERMISSIONS.EMPLOYEES_UPDATE) && (
                    <Link
                      href={`/employees/${emp.id}/edit`}
                      className="p-1.5 rounded-md text-slate-500 hover:text-eec-accent hover:bg-slate-100 transition-colors"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  )}

                  {/* Deactivate/Activate */}
                  {can(PERMISSIONS.EMPLOYEES_UPDATE) && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(emp)}
                      className={`p-1.5 rounded-md transition-colors ${
                        emp.isActive
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={emp.isActive ? 'Deactivate Employee' : 'Activate Employee'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
