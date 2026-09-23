'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { UserAvatar } from '@/components/auth';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/authorization';
import {
  UserCheck,
  UserX,
  Search,
  Building2,
  Calendar,
  Mail,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface PendingUser {
  id: string;
  email: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  employeeProfile?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string | null;
    jobTitle: string;
    departmentId: string;
    departmentName?: string;
    officeLocation: string | null;
  } | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function PendingUsersPage() {
  const { success, error } = useToast();

  const [users, setUsers] = useState<PendingUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Modals state
  const [approveUser, setApproveUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'IT_TECHNICIAN' | 'DEPARTMENT_MANAGER' | 'ADMIN'>('EMPLOYEE');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const [rejectUser, setRejectUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch pending users
  const fetchPendingUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedDepartment) params.append('departmentId', selectedDepartment);
      params.append('limit', '50');

      const res = await fetch(`${apiBase}/api/identity/pending?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      } else {
        error('Failed to load pending account requests.');
      }
    } catch (err) {
      console.error('Fetch pending users error:', err);
      error('Network error loading pending requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, selectedDepartment, error]);

  // Initial load & load departments
  useEffect(() => {
    async function loadDepartments() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/departments?limit=100`);
        if (res.ok) {
          const json = await res.json();
          setDepartments(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    }

    loadDepartments();
  }, []);

  // Debounced/triggered fetch when filter changes
  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Handle Approve Account
  const handleConfirmApprove = async () => {
    if (!approveUser) return;
    setIsApproving(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/identity/${approveUser.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          notes: approvalNotes.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        success(
          `Account for ${approveUser.employeeProfile?.fullName || approveUser.email} has been approved as ${selectedRole.replace('_', ' ')}.`
        );
        setApproveUser(null);
        setApprovalNotes('');
        setSelectedRole('EMPLOYEE');
        fetchPendingUsers(true);
      } else {
        error(json.message || 'Failed to approve account.');
      }
    } catch (err: any) {
      console.error('Approve account error:', err);
      error(err?.message || 'Error approving account request.');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Reject Account
  const handleConfirmReject = async () => {
    if (!rejectUser) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      error('Please enter a rejection reason (min. 3 characters).');
      return;
    }

    setIsRejecting(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/identity/${rejectUser.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason.trim(),
        }),
      });

      const json = await res.json();

      if (res.ok) {
        success(
          `Account request for ${rejectUser.employeeProfile?.fullName || rejectUser.email} has been rejected.`
        );
        setRejectUser(null);
        setRejectionReason('');
        fetchPendingUsers(true);
      } else {
        error(json.message || 'Failed to reject account.');
      }
    } catch (err: any) {
      console.error('Reject account error:', err);
      error(err?.message || 'Error rejecting account request.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.IDENTITY_APPROVE}>
      <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pending Account Approvals"
        description="Review employee registration requests and assign system access permissions"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Users' },
          { label: 'Pending Approvals' },
        ]}
        actions={
          <button
            onClick={() => fetchPendingUsers(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20 transition-all"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20 transition-all"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pending Table / Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={7} />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={UserCheck}
              title="No Pending Account Requests"
              description="There are currently no employee registrations awaiting administrative approval."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Employee ID</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Position</th>
                  <th className="px-5 py-3.5">Requested Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const profile = u.employeeProfile;
                  const fullName = profile?.fullName || profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Unspecified';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Applicant & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={fullName} email={u.email} size="md" className="w-9 h-9 text-xs" />
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {fullName}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-5 py-4 font-mono font-medium text-slate-800">
                        {profile?.employeeId || '—'}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Building2 size={13} className="text-slate-400" />
                          {profile?.departmentName || 'General'}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="px-5 py-4 text-slate-600">
                        {profile?.jobTitle || 'Staff'}
                      </td>

                      {/* Requested Date */}
                      <td className="px-5 py-4 text-slate-500">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={u.status} />
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setApproveUser(u);
                              setSelectedRole(
                                (u.role as any) || 'EMPLOYEE'
                              );
                              setApprovalNotes('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            <UserCheck size={14} />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectUser(u);
                              setRejectionReason('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <UserX size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── APPROVAL MODAL ──────────────────────────────────────────────── */}
      {approveUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900">
                  Approve Registration Request
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Grant system access for{' '}
                  <span className="font-semibold text-slate-700">
                    {approveUser.employeeProfile?.fullName || approveUser.email}
                  </span>
                </p>
              </div>
            </div>

            {/* User Details Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Corporate Email:</span>
                <span className="font-medium text-slate-800">{approveUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-medium text-slate-800">
                  {approveUser.employeeProfile?.employeeId || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">
                  {approveUser.employeeProfile?.departmentName || 'General'}
                </span>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label
                htmlFor="role-select"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Assign System Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20"
              >
                <option value="EMPLOYEE">EMPLOYEE (Standard Staff Access)</option>
                <option value="IT_TECHNICIAN">IT_TECHNICIAN (Maintenance & Asset Management)</option>
                <option value="DEPARTMENT_MANAGER">DEPARTMENT_MANAGER (Department Approvals & Reports)</option>
                <option value="ADMIN">ADMIN (Full Administrative Control)</option>
              </select>
            </div>

            {/* Optional Notes */}
            <div>
              <label
                htmlFor="notes-input"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Approval Notes (Optional)
              </label>
              <textarea
                id="notes-input"
                rows={2}
                placeholder="e.g. Verified by ICT Directorate."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-eec-accent focus:ring-2 focus:ring-eec-accent/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveUser(null)}
                disabled={isApproving}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isApproving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isApproving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Activate Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECTION MODAL ──────────────────────────────────────────────── */}
      {rejectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900">
                  Reject Account Request
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Deny access request for{' '}
                  <span className="font-semibold text-slate-700">
                    {rejectUser.employeeProfile?.fullName || rejectUser.email}
                  </span>
                </p>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div>
              <label
                htmlFor="rejection-reason"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                placeholder="State the reason for rejection (e.g. Invalid employee ID or non-matching department)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectUser(null)}
                disabled={isRejecting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PermissionGuard>
  );
}
