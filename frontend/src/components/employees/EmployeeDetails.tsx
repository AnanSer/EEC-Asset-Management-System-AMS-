'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  Shield,
  CheckCircle2,
  XCircle,
  Box,
  Wrench,
  Edit2,
  Power,
  Calendar,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Employee } from '@/constants/employees';

interface EmployeeDetailsProps {
  employee: Employee;
  onToggleStatus: () => void;
  statusLoading?: boolean;
}

export default function EmployeeDetails({
  employee,
  onToggleStatus,
  statusLoading = false,
}: EmployeeDetailsProps) {
  const formatRoleLabel = (role: string) => {
    return role.replace(/_/g, ' ');
  };

  const formatAccountStatusLabel = (status: string) => {
    if (status === 'PENDING_VERIFICATION') return 'Pending Verification';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getAccountStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'PENDING_VERIFICATION':
      case 'PENDING':
        return 'pending';
      case 'SUSPENDED':
        return 'retired';
      default:
        return 'inactive';
    }
  };

  const assignedAssetsCount = employee._count?.assetAssignments || 0;
  const maintenanceTicketsCount = 0; // Placeholder count for Phase 4

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-eec-primary/10 text-eec-primary flex items-center justify-center font-bold text-2xl shrink-0">
            {employee.firstName.charAt(0)}
            {employee.lastName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-eec-text">{employee.fullName}</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-eec-primary/10 text-eec-primary border border-eec-primary/20">
                {employee.employeeId}
              </span>
              <StatusBadge status={employee.isActive ? 'active' : 'inactive'} />
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{employee.position}</span>
              <span className="text-slate-300">•</span>
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{employee.department?.name || 'Unassigned Directorate'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <Link
            href={`/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit Profile
          </Link>
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={statusLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              employee.isActive
                ? 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {employee.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-eec-accent/10 text-eec-accent flex items-center justify-center shrink-0">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Assigned Assets
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-eec-text">{assignedAssetsCount}</span>
              <span className="text-xs text-slate-400">allocated devices</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Maintenance Tickets
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-eec-text">{maintenanceTicketsCount}</span>
              <span className="text-xs text-slate-400">tickets in progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-eec-text flex items-center gap-2">
              <User className="w-4 h-4 text-eec-primary" />
              Basic Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Full Name</span>
              <span className="font-semibold text-slate-800 text-sm">{employee.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Employee ID</span>
              <span className="font-mono font-medium text-slate-800">{employee.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Official Email</span>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="break-all">{employee.email}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Phone Number</span>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{employee.phone || 'Not provided'}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Job Position</span>
              <span className="font-semibold text-slate-800">{employee.position}</span>
            </div>
          </div>
        </div>

        {/* Department Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-eec-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-eec-accent" />
              Department Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Directorate / Sector</span>
              {employee.department ? (
                <Link
                  href={`/departments/${employee.department.id}`}
                  className="font-semibold text-eec-primary hover:text-eec-accent transition-colors block text-sm"
                >
                  {employee.department.name} ({employee.department.code})
                </Link>
              ) : (
                <span className="text-slate-500 italic">Unassigned</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Campus Location</span>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{employee.department?.location || 'Addis Ababa Head Office (Kazanchis)'}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Building</span>
              <span className="font-medium text-slate-800">
                {employee.department?.building || 'Main Administration Block'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Floor</span>
              <span className="font-medium text-slate-800">
                {employee.department?.floor || 'Unspecified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Assigned Office / Room</span>
              <span className="font-semibold text-slate-800">
                {employee.officeLocation || employee.department?.officeLocation || 'Main Hall'}
              </span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-eec-text flex items-center gap-2">
              <Shield className="w-4 h-4 text-eec-primary" />
              Account Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">System Role</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">
                {formatRoleLabel(employee.role)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Account Status</span>
              <StatusBadge
                status={getAccountStatusVariant(employee.accountStatus)}
                label={formatAccountStatusLabel(employee.accountStatus)}
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Email Verification</span>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {employee.isEmailVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700 font-semibold">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-700 font-semibold">Unverified (Pending)</span>
                  </>
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block mb-0.5">Registered On</span>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
