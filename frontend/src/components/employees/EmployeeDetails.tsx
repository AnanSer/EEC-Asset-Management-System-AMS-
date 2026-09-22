'use client';

import React, { useEffect, useState } from 'react';
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
  Package,
  Plus,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Employee } from '@/constants/employees';
import assignmentService from '@/services/assignment.service';
import maintenanceService from '@/services/maintenance.service';
import { AssetAssignment } from '@/constants/assignments';
import { MaintenanceTicket } from '@/constants/maintenance';
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/constants/assets';

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
  const [assignedAssets, setAssignedAssets] = useState<AssetAssignment[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [reportedTickets, setReportedTickets] = useState<MaintenanceTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    async function loadAssignedAssets() {
      try {
        setLoadingAssets(true);
        const res = await assignmentService.getAll({
          employeeId: employee.id,
          isCurrent: 'true',
          limit: 100,
        });
        if (res.success) {
          setAssignedAssets(res.data);
        }
      } catch {
        // fail gracefully
      } finally {
        setLoadingAssets(false);
      }
    }

    async function loadMaintenanceTickets() {
      try {
        setLoadingTickets(true);
        const fullName = `${employee.firstName} ${employee.lastName}`;
        const res = await maintenanceService.getAll({
          search: fullName,
          limit: 20,
        });
        if (res.success) {
          setReportedTickets(res.data);
        }
      } catch {
        // fail gracefully
      } finally {
        setLoadingTickets(false);
      }
    }

    loadAssignedAssets();
    loadMaintenanceTickets();
  }, [employee.id, employee.firstName, employee.lastName]);

  const formatRoleLabel = (role: string) => {
    return role.replace(/_/g, ' ');
  };

  const formatAccountStatusLabel = (status: string) => {
    if (!status) return 'Pending';
    return status.charAt(0) + status.slice(1).toLowerCase();
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
              <StatusBadge
                status={getAccountStatusVariant(employee.accountStatus)}
                label={`Account: ${formatAccountStatusLabel(employee.accountStatus)}`}
              />
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
              <span className="text-slate-400 block mb-1">Active Status</span>
              <StatusBadge status={employee.isActive ? 'active' : 'inactive'} />
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

      {/* Assigned Assets Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-eec-primary" />
            <h3 className="text-sm font-bold text-eec-text uppercase tracking-wider">
              Assigned Assets ({assignedAssets.length})
            </h3>
          </div>
          {employee.isActive && (
            <Link
              href={`/assignments/new?employeeId=${employee.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-eec-primary text-white text-xs font-semibold hover:bg-eec-primary/90 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Equipment
            </Link>
          )}
        </div>

        {loadingAssets ? (
          <div className="p-6">
            <TableSkeleton rows={3} />
          </div>
        ) : assignedAssets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Box className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No Assets Currently Assigned</p>
            <p className="text-xs text-slate-400 mt-0.5">
              This staff member has no active equipment custody records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Asset Code</th>
                  <th className="px-6 py-3">Asset Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedAssets.map((record) => {
                  const asset = record.asset;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/assets/${record.assetId}`}
                          className="font-mono text-xs font-semibold text-eec-primary hover:underline"
                        >
                          {asset?.assetCode || '—'}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-eec-text">
                        <Link
                          href={`/assets/${record.assetId}`}
                          className="hover:text-eec-primary transition"
                        >
                          {asset?.name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600">
                        {asset?.category
                          ? ASSET_CATEGORY_LABELS[asset.category as keyof typeof ASSET_CATEGORY_LABELS] ?? asset.category
                          : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge
                          status={(asset?.status || 'ASSIGNED').toLowerCase()}
                          label={
                            asset?.status
                              ? ASSET_STATUS_LABELS[asset.status as keyof typeof ASSET_STATUS_LABELS] ?? asset.status
                              : 'Assigned'
                          }
                        />
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        {new Date(record.assignedDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/assets/${record.assetId}`}
                          className="text-xs text-eec-primary hover:underline font-semibold"
                        >
                          View Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reported / Handled Maintenance Tickets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Maintenance &amp; Support Tickets ({reportedTickets.length})
            </h3>
          </div>
          <Link
            href="/maintenance/new"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Log Issue
          </Link>
        </div>

        {loadingTickets ? (
          <div className="p-6">
            <TableSkeleton rows={2} cols={5} />
          </div>
        ) : reportedTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No Maintenance Tickets</p>
            <p className="text-xs text-slate-400 mt-0.5">
              This employee has not reported or been assigned any maintenance tickets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Ticket #</th>
                  <th className="px-6 py-3">Asset</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-eec-primary">
                      <Link href={`/maintenance/${ticket.id}`} className="hover:underline">
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      {ticket.asset?.name || 'Asset'}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      {ticket.category}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={ticket.status.toLowerCase()} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/maintenance/${ticket.id}`}
                        className="text-xs text-eec-primary hover:underline font-semibold"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
